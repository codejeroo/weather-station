import { supabase } from '../supabaseClient'

/**
 * Fetch sensor logs from the database
 * @param {number} limit - Number of records to fetch (default: 100)
 * @returns {Promise<Array>} Array of sensor log records
 */
export const fetchSensorLogs = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('sensor_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching sensor logs:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Exception fetching sensor logs:', err)
    return []
  }
}

/**
 * Fetch sensor logs for a specific node
 * @param {string} nodeId - The node ID to filter by
 * @param {number} limit - Number of records to fetch (default: 50)
 * @returns {Promise<Array>} Array of sensor log records for the node
 */
export const fetchSensorLogsByNode = async (nodeId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('sensor_logs')
      .select('*')
      .eq('node_id', nodeId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching sensor logs for node:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Exception fetching sensor logs:', err)
    return []
  }
}

/**
 * Insert a new sensor log
 * @param {object} sensorData - Sensor data object
 * @returns {Promise<object>} Inserted record or error
 */
export const insertSensorLog = async (sensorData) => {
  try {
    const { data, error } = await supabase
      .from('sensor_logs')
      .insert([sensorData])
      .select()

    if (error) {
      console.error('Error inserting sensor log:', error)
      return null
    }

    return data?.[0] || null
  } catch (err) {
    console.error('Exception inserting sensor log:', err)
    return null
  }
}

/**
 * Subscribe to real-time updates of sensor logs
 * @param {function} callback - Callback function to handle new data
 * @returns {function} Unsubscribe function
 */
export const subscribeSensorLogs = (callback) => {
  const subscription = supabase
    .from('sensor_logs')
    .on('*', (payload) => {
      callback(payload)
    })
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

/**
 * Calculate precipitation chance based on humidity and pressure trends
 * Uses weighted formula: (humidity * 0.6) + (pressureDrop * 0.4)
 * @returns {Promise<number>} Precipitation chance percentage (0-100)
 */
export const calculatePrecipitationChance = async () => {
  try {
    // Fetch recent logs to get current and previous readings
    const logs = await fetchSensorLogs(10)
    
    if (logs.length === 0) {
      return 0
    }

    // Current reading (most recent)
    const currentLog = logs[0]
    const currentHumidity = currentLog.humidity ?? 0
    const currentPressure = currentLog.pressure ?? 1013.25

    // Find a previous reading from ~1 hour ago
    const now = new Date(currentLog.created_at)
    const oneHourAgo = new Date(now.getTime() - 3600000)
    
    let previousLog = null
    for (let i = 1; i < logs.length; i++) {
      const logTime = new Date(logs[i].created_at)
      if (logTime <= oneHourAgo) {
        previousLog = logs[i]
        break
      }
    }

    // Calculate pressure drop percentage
    let pressureDropPercent = 0
    if (previousLog && previousLog.pressure) {
      const prevPressure = previousLog.pressure
      pressureDropPercent = ((prevPressure - currentPressure) / prevPressure) * 100
      // Clamp pressure drop between 0-100%
      pressureDropPercent = Math.max(0, Math.min(pressureDropPercent, 100))
    } else {
      // Fallback: if no historical data, use humidity only
      return Math.min(100, currentHumidity)
    }

    // Combined calculation: humidity (60%) + pressure drop (40%)
    const precipChance = (currentHumidity * 0.6) + (pressureDropPercent * 0.4)
    
    // Clamp final result between 0-100%
    return Math.max(0, Math.min(precipChance, 100))
  } catch (err) {
    console.error('Exception calculating precipitation chance:', err)
    return 0
  }
}
