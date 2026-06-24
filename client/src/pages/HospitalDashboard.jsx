import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.js'

const BLOOD_TYPES    = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const URGENCY_LEVELS = ['critical', 'moderate', 'low']

const urgencyStyles = {
  critical: { border: 'border-l-red-500',    badge: 'bg-red-100 text-red-700'    },
  moderate: { border: 'border-l-yellow-500',  badge: 'bg-yellow-100 text-yellow-700' },
  low:      { border: 'border-l-green-500',   badge: 'bg-green-100 text-green-700'  },
}

const statusStyles = {
  pending:  'bg-gray-100 text-gray-600',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  fulfilled:'bg-blue-100 text-blue-700',
}

const HospitalDashboard = () => {
  const { user }      = useAuth()
  const socketRef     = useRef(null)
  const [requests,    setRequests]   = useState([])
  const [loading,     setLoading]    = useState(true)
  const [submitting,  setSubmitting] = useState(false)
  const [message,     setMessage]    = useState(null)
  const [form, setForm] = useState({
    bloodType: 'A+', unitsRequired: 1, urgencyLevel: 'moderate', condition: ''
  })

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const fetchRequests = async () => {
    try {
      const res = await api.get('/hospital/requests')
      setRequests(res.data.requests)
    } catch {
      showMessage('error', 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()

    socketRef.current = io('http://localhost:5000')
    socketRef.current.on(`hospital-${user?._id}-update`, (data) => {
      setRequests((prev) =>
        prev.map((r) =>
          r._id === data.requestId
            ? { ...r, status: data.status, fulfilledBy: { name: data.bankName } }
            : r
        )
      )
      showMessage('success', `Request ${data.status} by ${data.bankName}`)
    })

    return () => socketRef.current.disconnect()
  }, [user])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/hospital/request', {
        ...form,
        patientDetails: { condition: form.condition }
      })
      showMessage('success', 'Request sent — nearby blood banks have been notified!')
      fetchRequests()
    } catch {
      showMessage('error', 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  // Summary stats
  const pending  = requests.filter((r) => r.status === 'pending').length
  const accepted = requests.filter((r) => r.status === 'accepted').length
  const total    = requests.length

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center mt-32">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
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
          <h1 className="text-2xl font-bold text-gray-800">Hospital Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Raise urgent blood requests — nearby banks are notified instantly.</p>
        </div>

        {/* Toast */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-3xl font-extrabold text-gray-800">{total}</p>
            <p className="text-xs text-gray-500 mt-1">Total Requests</p>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-100 shadow-sm p-4 text-center">
            <p className="text-3xl font-extrabold text-yellow-600">{pending}</p>
            <p className="text-xs text-gray-500 mt-1">Pending</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-100 shadow-sm p-4 text-center">
            <p className="text-3xl font-extrabold text-green-600">{accepted}</p>
            <p className="text-xs text-gray-500 mt-1">Accepted</p>
          </div>
        </div>

        {/* New Request Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">🩸 New Blood Request</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <select
                  name="bloodType"
                  value={form.bloodType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {BLOOD_TYPES.map((bt) => <option key={bt}>{bt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Units Required</label>
                <input
                  name="unitsRequired"
                  type="number"
                  min="1"
                  value={form.unitsRequired}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
                <select
                  name="urgencyLevel"
                  value={form.urgencyLevel}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {URGENCY_LEVELS.map((u) => (
                    <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Condition</label>
                <input
                  name="condition"
                  type="text"
                  placeholder="e.g. Surgery, Accident"
                  value={form.condition}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Sending...' : 'Send Blood Request'}
            </button>
          </form>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">📋 Your Requests</h2>

          {requests.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-2">🏥</p>
              <p className="text-gray-400 text-sm">No requests raised yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => {
                const uStyle = urgencyStyles[r.urgencyLevel] || urgencyStyles.moderate
                return (
                  <div key={r._id} className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl border-l-4 ${uStyle.border}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">
                          {r.bloodType}
                          <span className="text-gray-400 font-normal"> — {r.unitsRequired} units</span>
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${uStyle.badge}`}>
                          {r.urgencyLevel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {r.fulfilledBy?.name ? `Handled by ${r.fulfilledBy.name}` : 'Awaiting response'}
                        {' · '}
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyles[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default HospitalDashboard