import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet with React
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function MiniMap() {
  // Coordinates for Butuan City, Philippines
  const position = [8.9489, 125.5436]

  return (
    <div className="mini-map card">
      <h3>Station Location</h3>
      <MapContainer center={position} zoom={12} style={{ height: '220px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>
            <strong>Butuan City, Philippines</strong><br />
            Weather Station Location<br />
            Coordinates: 8.9489° N, 125.5436° E
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}