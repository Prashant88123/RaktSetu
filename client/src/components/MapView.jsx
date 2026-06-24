import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from '../utils/api'

// Fix leaflet default marker icons not showing in React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Color-coded markers based on urgency score
const getMarkerColor = (urgencyScore) => {
  if (urgencyScore >= 80) return 'red'
  if (urgencyScore >= 50) return 'orange'
  return 'green'
}

const createColorMarker = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })
}

// Moves map view to user's location
const RecenterMap = ({ coords }) => {
  const map = useMap()
  useEffect(() => {
    if (coords) map.setView(coords, 13)
  }, [coords])
  return null
}

const MapView = ({ bloodType }) => {
  const [userLocation, setUserLocation] = useState(null)
  const [nearbyBanks, setNearbyBanks]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  useEffect(() => {
    // Get donor's live location from browser
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        setUserLocation([lat, lng])

        try {
          const res = await axios.get('/banks/nearby', {
            params: { lat, lng, bloodType }
          })
          setNearbyBanks(res.data.banks)
        } catch (err) {
          setError('Failed to fetch nearby banks')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError('Location access denied. Please enable location.')
        setLoading(false)
      }
    )
  }, [bloodType])

  if (loading) return <p className="text-center mt-10 text-gray-500">Finding nearby blood banks...</p>
  if (error)   return <p className="text-center mt-10 text-red-500">{error}</p>

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={userLocation || [26.4499, 80.3319]} // Default: Kanpur
        zoom={13}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {userLocation && <RecenterMap coords={userLocation} />}

        {/* Donor's location marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>📍 Your Location</Popup>
          </Marker>
        )}

        {/* Blood bank markers color coded by urgency */}
        {nearbyBanks.map((bank) => (
          <Marker
            key={bank._id}
            position={[
              bank.location.coordinates[1],
              bank.location.coordinates[0]
            ]}
            icon={createColorMarker(getMarkerColor(bank.urgencyScore))}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-base">{bank.name}</p>
                <p className="text-gray-600">{bank.location.address}</p>
                <p className="mt-1">
                  🩸 {bloodType} Stock:{' '}
                  <span className={
                    bank.inventory[bloodType] < 5 ? 'text-red-500 font-bold' :
                    bank.inventory[bloodType] < 15 ? 'text-yellow-500 font-bold' :
                    'text-green-500 font-bold'
                  }>
                    {bank.inventory[bloodType]} units
                  </span>
                </p>
                <p className="text-xs mt-1 text-gray-500">{bank.operatingHours}</p>
                <a
                  href={`https://www.openstreetmap.org/directions?to=${bank.location.coordinates[1]},${bank.location.coordinates[0]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block text-blue-600 underline text-xs"
                >
                  🧭 Get Directions
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Urgency legend */}
      <div className="flex gap-4 mt-3 text-sm px-1">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"/> Critical</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-400 inline-block"/> Low</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"/> Stable</span>
      </div>
    </div>
  )
}

export default MapView