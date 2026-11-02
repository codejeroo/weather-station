import { supabase } from '../supabaseClient'
import { calculatePrecipitationChance } from './sensorLogs'

/**
 * Composes a live "sensor readings + forecast" context block that is injected
 * as the system message before every chat request. This simulates RAG:
 * the model answers grounded in the latest actual readings instead of
 * generic advice.
 */

const CACHE_TTL_MS = 45000 // refresh snapshot at most every 45s
let cache = null
let cacheTime = 0

const LOCATION = 'Butuan City, Philippines'

function round1(v) {
  return Math.round(v * 10) / 10
}

function fmtDelta(delta) {
  if (Math.abs(delta) < 0.05) return '≈0'
  return delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)
}

function minutesSince(iso) {
  const t = new Date(iso).getTime()
  if (!t) return null
  return Math.round((Date.now() - t) / 60000)
}

/** Latest N readings grouped by node, each list oldest → newest */
async function fetchReadingsByNode(limit = 400) {
  const { data, error } = await supabase
    .from('sensor_logs')
    .select('node_id, temperature, humidity, pressure, soil_moisture, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data || data.length === 0) return {}

  const byNode = {}
  // reverse so each node's list is oldest → newest
  for (const row of [...data].reverse()) {
    ;(byNode[row.node_id] = byNode[row.node_id] || []).push(row)
  }
  return byNode
}

function describeNode(nodeId, rows) {
  if (!rows || rows.length === 0) return null

  const latest = rows[rows.length - 1]
  const parts = [
    `Temperature ${round1(Number(latest.temperature))} °C`,
    `Humidity ${round1(Number(latest.humidity))} %`,
    `Pressure ${round1(Number(latest.pressure))} hPa`,
    `Soil moisture ${round1(Number(latest.soil_moisture))}`
  ]

  // ~1 hour trend: compare against the reading from ~12 samples earlier (~5 min cadence)
  const older = rows[Math.max(0, rows.length - 13)]
  const trends = []
  if (older) {
    trends.push(`temp ${fmtDelta(Number(latest.temperature) - Number(older.temperature))} °C/h`)
    trends.push(`humidity ${fmtDelta(Number(latest.humidity) - Number(older.humidity))} %/h`)
    trends.push(`pressure ${fmtDelta(Number(latest.pressure) - Number(older.pressure))} hPa/h`)
  }

  return `${nodeId}: ${parts.join(' | ')}` +
    (trends.length ? ` | hourly trend: ${trends.join(', ')}` : '')
}

/**
 * Header noting how fresh the readings are. Live station data uploads every
 * ~5 min; the stored dataset can also be an older snapshot (e.g. thesis
 * collection), which is still treated as the station's current state.
 */
function freshnessHeader(byNode) {
  const newest = Object.values(byNode)
    .flatMap(rows => (rows.length ? [rows[rows.length - 1]] : []))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
  if (!newest) return 'No recent readings available.'
  const minAgo = minutesSince(newest.created_at)
  if (minAgo != null && minAgo <= 120) {
    return `Live sensor readings, updated ${minAgo <= 1 ? 'just now' : `${minAgo} min ago`}.`
  }
  const ts = new Date(newest.created_at)
  return `Sensor data snapshot — newest record ${ts.toISOString().slice(0, 16).replace('T', ' ')} UTC. ` +
    'Treat it as the stations\' current state and answer from it.'
}

/** Latest saved machine forecast record → { node, time, horizons: [...] } */
async function fetchLatestForecast() {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) return null

  const row = data[0]
  let list = row.predictions
  if (typeof list === 'string') {
    try { list = JSON.parse(list) } catch { list = null }
  }
  if (!Array.isArray(list)) return null

  const horizonOrder = ['1h', '4h', '6h', '12h']
  const byHorizon = {}
  for (const p of list) if (p && p.horizon) byHorizon[p.horizon] = p

  return {
    node: row.node_id,
    time: row.prediction_time || row.created_at,
    horizons: horizonOrder.filter(h => byHorizon[h]).map(h => byHorizon[h])
  }
}

function describeForecast(fc) {
  if (!fc) return 'No saved ML forecast available.'
  const lines = fc.horizons.map(h => {
    const temp = h.temperature || {}
    const hum = h.humidity || {}
    const soil = h.soil_moisture || {}
    let t = 'n/a'
    if (temp.value != null) {
      t = round1(temp.value) + ' °C'
      if (temp.lower_bound != null && temp.upper_bound != null) {
        t += ` (${round1(temp.lower_bound)}–${round1(temp.upper_bound)})`
      }
    }
    return `${h.horizon} (${h.confidence || 'unknown'} confidence): ` +
      `temp ${t}, humidity ${hum.value != null ? round1(hum.value) + ' %' : 'n/a'}, ` +
      `soil moisture ${soil.value != null ? round1(soil.value) : 'n/a'}`
  })
  return `Saved ML forecast (node ${fc.node}, ${fc.time || 'time unknown'}):\n` + lines.join('\n')
}

export async function buildSystemContext() {
  const now = Date.now()
  if (cache && now - cacheTime < CACHE_TTL_MS) return cache

  let prompt
  try {
    const [byNode, forecast, precipChance] = await Promise.all([
      fetchReadingsByNode(),
      fetchLatestForecast(),
      calculatePrecipitationChance()
    ])

    const nodeLines = Object.keys(byNode)
      .map(nid => describeNode(nid, byNode[nid]))
      .filter(Boolean)

    const hasReadings = nodeLines.length > 0

    prompt = [
      `You are MicroClimate.AI, the assistant of a microclimate monitoring system located in ${LOCATION}. ` +
      'Sensor readings update roughly every 5 minutes. Answer the user\'s question about current or ' +
      'near-future conditions using ONLY the data blocks below, quoting its numbers. Be concise (2–6 ' +
      'short paragraphs or a short list). Never ask the user for their location or tell them to check ' +
      'external weather apps — you have the data. If a needed value is missing, say exactly that.',
      '',
      '=== SENSOR READINGS ===',
      freshnessHeader(byNode),
      ...(hasReadings ? nodeLines : ['No recent readings available.']),
      '',
      `Computed precipitation chance (humidity + pressure-trend model): ${precipChance.toFixed(0)} %`,
      '',
      '=== MACHINE FORECAST ===',
      describeForecast(forecast),
      '',
      'For rain/umbrella questions: weigh precipitation chance, pressure trend and forecast ' +
      'humidity/temperature above, then give a clear yes/no leaning with the reason.'
    ].join('\n')

    cache = prompt
    cacheTime = now
  } catch (err) {
    console.error('Failed to build AI context:', err)
    prompt = `You are MicroClimate.AI, the assistant of a microclimate monitoring system located in ` +
      `${LOCATION}. Live sensor data could not be fetched right now: state that briefly and answer ` +
      `only with general knowledge, clearly marked as such.`
  }
  return prompt
}
