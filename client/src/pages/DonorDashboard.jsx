import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar.jsx'
import MapView from '../components/MapView.jsx'
import ProfileCard from '../components/ProfileCard.jsx'
import api from '../utils/api.js'

const DonorDashboard = () => {
  const socketRef   = useRef(null)
  const [donor,   setDonor]   = useState(null)
  const [alerts,  setAlerts]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/donors/profile')
        setDonor(res.data.donor)
        if (res.data.donor.isAvailable) {
          socketRef.current.emit('join-blood-type-room', res.data.donor.bloodType)
        }
      } catch {
        console.error('Failed to fetch donor profile')
      } finally {
        setLoading(false)
      }
    }

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')
    fetchProfile()

    socketRef.current.on('urgent-request', (data) => {
      setAlerts((prev) => [data, ...prev].slice(0, 5))
    })

    return () => socketRef.current.disconnect()
  }, [])

  const handleToggleAvailability = async () => {
    try {
      const res = await api.put('/donors/availability')
      const isNowAvailable = res.data.isAvailable
      setDonor((prev) => ({ ...prev, isAvailable: isNowAvailable }))
      if (isNowAvailable) {
        socketRef.current.emit('join-blood-type-room', donor.bloodType)
      } else {
        socketRef.current.emit('leave-blood-type-room', donor.bloodType)
      }
    } catch {
      console.error('Failed to toggle availability')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center mt-32">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-gray-500 text-sm">Loading your profile...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {donor?.name} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track your donations and find nearby blood banks.</p>
        </div>

        {/* Profile + Gamification */}
        <ProfileCard donor={donor} onToggleAvailability={handleToggleAvailability} />

        {/* Live Emergency Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">🚨 Emergency Alerts</h2>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No urgent alerts right now</p>
              <p className="text-gray-300 text-xs mt-1">You'll be notified instantly when your blood type is needed</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{alert.bankName}</p>
                    {alert.aiPredicted && (
                      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                        🤖 AI Predicted
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{alert.address}</p>
                  {alert.message && (
                    <p className="text-sm text-gray-700 mt-2 italic">"{alert.message}"</p>
                  )}
                  <p className="text-red-600 font-medium text-xs mt-1">
                    {alert.bloodType} — only {alert.units} units remaining
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">🗺️ Nearby Blood Banks</h2>
          <p className="text-xs text-gray-400 mb-4">
            Showing banks near you ranked by urgency for your blood type ({donor?.bloodType})
          </p>
          <MapView bloodType={donor?.bloodType} />
        </div>

      </div>
    </div>
  )
}

export default DonorDashboard