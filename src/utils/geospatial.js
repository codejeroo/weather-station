/**
 * Geospatial utilities for flood risk assessment
 */

/**
 * Check if a point is inside a polygon using ray-casting algorithm
 * @param {[number, number]} point - [longitude, latitude]
 * @param {[number, number][][]} polygon - Polygon coordinates array
 * @returns {boolean} True if point is inside polygon
 */
function isPointInPolygon(point, polygon) {
  const [x, y] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }

  return inside
}

/**
 * Find which hazard zone contains the station
 * @param {[number, number]} stationLocation - [longitude, latitude]
 * @param {Object} floodMapData - GeoJSON FeatureCollection from floodMap.json
 * @returns {number|null} Var value of containing zone, or null if outside all zones
 */
export function getStationHazardZone(stationLocation, floodMapData) {
  if (!floodMapData || !floodMapData.features) {
    return null
  }

  // Check each feature to see if station is inside
  for (const feature of floodMapData.features) {
    if (feature.geometry.type === 'Polygon') {
      // Polygon coordinates are in a single array
      const coordinates = feature.geometry.coordinates[0]
      if (isPointInPolygon(stationLocation, coordinates)) {
        return feature.properties.Var
      }
    } else if (feature.geometry.type === 'MultiPolygon') {
      // MultiPolygon has array of polygon arrays
      for (const polygon of feature.geometry.coordinates) {
        const coordinates = polygon[0]
        if (isPointInPolygon(stationLocation, coordinates)) {
          return feature.properties.Var
        }
      }
    }
  }

  // If not in any zone, determine which is closest for safety
  // Default to safe if no intersection
  return null
}

/**
 * Get human-readable hazard zone label
 * @param {number|null} varValue - Var value from GeoJSON properties
 * @returns {string} Hazard zone label
 */
export function getHazardZoneLabel(varValue) {
  if (varValue === null || varValue === undefined) return 'Outside Hazard Zones'
  if (varValue >= 3) return 'Extreme Flood Risk Zone (Var 3+)'
  if (varValue === 2) return 'Very High Flood Risk Zone (Var 2)'
  if (varValue === 1) return 'High Flood Risk Zone (Var 1)'
  if (varValue === 0) return 'Moderate Flood Risk Zone (Var 0)'
  if (varValue === -1) return 'Low Flood Risk Zone (Var -1)'
  if (varValue === -2) return 'No Flood Risk Area (Var -2)' // Outside LIDAR mapped areas
  return 'Unknown Zone'
}

/**
 * Get color for hazard zone visualization
 * @param {number|null} varValue - Var value from GeoJSON properties
 * @returns {string} Color hex code
 */
export function getHazardZoneColor(varValue) {
  if (varValue === null || varValue === undefined) return '#10b981' // green
  if (varValue >= 3) return '#8B0000' // dark red - extreme
  if (varValue === 2) return '#DC143C' // crimson - very high
  if (varValue === 1) return '#FF8C00' // orange - high
  if (varValue === 0) return '#FFD700' // gold - moderate
  if (varValue === -1) return '#90EE90' // light green - low
  if (varValue === -2) return '#00AA00' // medium green - safe/no risk
  return '#10b981' // green - default
}
