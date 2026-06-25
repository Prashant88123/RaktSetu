import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import api from '../utils/api'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const getUrgencyStyle = (units) => {
  if (units < 5)  return { bg: 'bg-red-50',    border: 'border-red-400',    badge: 'bg-red-500',    label: 'Critical', text: 'text-red-600'    }
  if (units < 15) return { bg: 'bg-yellow-50', border: 'border-yellow-400', badge: 'bg-yellow-500', label: 'Low',      text: 'text-yellow-600' }
  return              { bg: 'bg-green-50',  border: 'border-green-400',  badge: 'bg-green-500',  label: 'Stable',   text: 'text-green-600'  }
}

const BankDashboard = () => {
  const { user }    = useAuth()
  const socketRef   = useRef(null)

  const [inventory,     setInventory]     = useState(Object.fromEntries(BLOOD_TYPES.map((bt) => [bt, 0])))
  const [editInventory, setEditInventory] = useState(Object.fromEntries(BLOOD_TYPES.map((bt) => [bt, 0])))
  const [bankName,      setBankName]      = useState('')
  const [saving,        setSaving]        = useState(false)
  const [loading,       setLoading]       = useState(true)
  const [message,       setMessage]       = useState(null)
  const [requests,      setRequests]      = useState([])
  const [donors,        setDonors]        = useState([])
  const [selectedDonor, setSelectedDonor] = useState('')
  const [logging,       setLogging]       = useState(false)
  const [predictions,   setPredictions]   = useState({})
  const [usage,         setUsage]         = useState(Object.fromEntries(BLOOD_TYPES.map((bt) => [bt, 0])))
  const [loggingUsage,  setLoggingUsage]  = useState(false)

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchInventory = async () => {
    try {
      const res = await api.get('/banks/inventory')
      setInventory(res.data.inventory)
      setEditInventory(res.data.inventory)
      setBankName(res.data.name)
    } catch {
      showMessage('error', 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const fetchRequests = async () => {
    try {
      const res = await api.get('/banks/requests')
      setRequests(res.data.requests)
    } catch {
      console.error('Failed to fetch requests')
    }
  }

  const fetchDonors = async () => {
    try {
      const res = await api.get('/donors/all')
      setDonors(res.data.donors)
    } catch {
      console.error('Failed to fetch donors')
    }
  }

  useEffect(() => {
    fetchInventory()
    fetchRequests()
    fetchDonors()

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')
    socketRef.current.on('inventory-changed', () => fetchInventory())
    socketRef.current.on(`bank-${user?._id}-request`, (data) => {
      setRequests((prev) => [data, ...prev])
    })

    return () => socketRef.current.disconnect()
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put('/banks/inventory', { inventory: editInventory })
      setInventory(res.data.bank.inventory)
      setPredictions(res.data.predictions)
      showMessage('success', 'Inventory updated — AI analysis complete!')
    } catch {
      showMessage('error', 'Failed to update inventory')
    } finally {
      setSaving(false)
    }
  }

  const handleRequestAction = async (requestId, action) => {
    try {
      await api.put(`/banks/requests/${requestId}`, { action })
      setRequests((prev) => prev.map((r) => r._id === requestId ? { ...r, status: action } : r))
      showMessage('success', `Request ${action} successfully`)
    } catch {
      showMessage('error', 'Failed to update request')
    }
  }

  const handleLogDonation = async () => {
    if (!selectedDonor) return
    setLogging(true)
    try {
      await api.post('/donors/log-donation', { donorId: selectedDonor })
      showMessage('success', 'Donation logged successfully!')
      setSelectedDonor('')
      fetchDonors()
    } catch {
      showMessage('error', 'Failed to log donation')
    } finally {
      setLogging(false)
    }
  }

  const handleLogUsage = async () => {
    setLoggingUsage(true)
    try {
      for (const [bloodType, unitsUsed] of Object.entries(usage)) {
        if (unitsUsed > 0) await api.post('/banks/usage', { bloodType, unitsUsed })
      }
      showMessage('success', 'Usage logged — AI predictions will update on next save!')
      setUsage(Object.fromEntries(BLOOD_TYPES.map((bt) => [bt, 0])))
    } catch {
      showMessage('error', 'Failed to log usage')
    } finally {
      setLoggingUsage(false)
    }
  }

  // Summary stats
  const criticalCount = BLOOD_TYPES.filter((bt) => inventory[bt] < 5).length
  const lowCount      = BLOOD_TYPES.filter((bt) => inventory[bt] >= 5 && inventory[bt] < 15).length
  const totalUnits    = BLOOD_TYPES.reduce((sum, bt) => sum + (inventory[bt] || 0), 0)

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

      <div className="max-w-5xl mx-auto p-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{bankName}</h1>
          <p className="text-gray-500 text-sm mt-0.5">Blood Inventory Dashboard</p>
        </div>

        {/* Toast message */}
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
            <p className="text-3xl font-extrabold text-gray-800">{totalUnits}</p>
            <p className="text-xs text-gray-500 mt-1">Total Units</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-100 shadow-sm p-4 text-center">
            <p className="text-3xl font-extrabold text-red-600">{criticalCount}</p>
            <p className="text-xs text-gray-500 mt-1">Critical Types</p>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-100 shadow-sm p-4 text-center">
            <p className="text-3xl font-extrabold text-yellow-600">{lowCount}</p>
            <p className="text-xs text-gray-500 mt-1">Low Types</p>
          </div>
        </div>

        {/* Inventory Cards — display only */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">🩸 Current Stock Levels</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BLOOD_TYPES.map((bt) => {
              const style = getUrgencyStyle(inventory[bt] ?? 0)
              return (
                <div key={bt} className={`rounded-xl border-2 p-4 text-center ${style.bg} ${style.border}`}>
                  <p className="text-xl font-bold text-gray-800">{bt}</p>
                  <p className={`text-3xl font-extrabold mt-1 ${style.text}`}>{inventory[bt] ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-0.5">units</p>
                  <span className={`text-xs text-white px-2 py-0.5 rounded-full mt-2 inline-block ${style.badge}`}>
                    {style.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Edit Inventory */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">✏️ Update Stock</h2>
          <p className="text-xs text-gray-400 mb-4">Edit units and save — AI will analyze for shortages automatically.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {BLOOD_TYPES.map((bt) => (
              <div key={bt} className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-gray-700">{bt}</span>
                <input
                  type="number"
                  min="0"
                  onChange={(e) => setEditInventory((prev) => ({
                    ...prev,
                    [bt]: e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                  }))}
                  value={editInventory[bt] === 0 ? '' : editInventory[bt]}
                  placeholder="0"
                  className="w-full text-center border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving & Analyzing...' : 'Save Inventory'}
          </button>
        </div>

        {/* AI Predictions */}
        {Object.keys(predictions).length > 0 && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">🤖 AI Shortage Predictions</h2>
            <p className="text-xs text-gray-400 mb-4">Based on your last 7 days of usage history</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(predictions).map(([bloodType, pred]) => (
                <div key={bloodType} className={`rounded-xl p-3 text-center border ${
                  pred.critical ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}>
                  <p className="font-bold text-gray-800">{bloodType}</p>
                  {pred.daysLeft !== null ? (
                    <>
                      <p className={`text-2xl font-extrabold ${pred.critical ? 'text-red-600' : 'text-green-600'}`}>
                        {pred.daysLeft}d
                      </p>
                      <p className="text-xs text-gray-400">days left</p>
                      {pred.critical && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                          Alert sent!
                        </span>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">No history</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log Daily Usage */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">📊 Log Today's Usage</h2>
          <p className="text-xs text-gray-400 mb-4">Enter units consumed today to train the AI prediction engine.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {BLOOD_TYPES.map((bt) => (
              <div key={bt} className="flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-gray-700">{bt}</span>
                <input
                  type="number"
                  min="0"
                  onChange={(e) => setUsage((prev) => ({
                    ...prev,
                    [bt]: e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                  }))}
                  value={usage[bt] === 0 ? '' : usage[bt]}
                  placeholder="0"
                  className="w-full text-center border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
                <span className="text-xs text-gray-400">used today</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleLogUsage}
            disabled={loggingUsage}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
          >
            {loggingUsage ? 'Logging...' : 'Log Usage'}
          </button>
        </div>

        {/* Incoming Blood Requests */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">📋 Incoming Blood Requests</h2>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🩸</p>
              <p className="text-gray-400 text-sm">No pending requests from hospitals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {r.bloodType}
                      <span className="text-gray-400 font-normal"> — {r.unitsRequired} units</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      From: {r.requestedBy?.name || r.hospitalName} ·{' '}
                      <span className="capitalize">{r.urgencyLevel}</span> urgency
                    </p>
                  </div>
                  {r.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequestAction(r._id, 'accepted')}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequestAction(r._id, 'rejected')}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                      r.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {r.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log Donation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">✅ Log a Donor Visit</h2>
          <p className="text-xs text-gray-400 mb-4">Select a donor who visited today to update their donation count and badges.</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <select
                value={selectedDonor}
                onFocus={fetchDonors}
                onChange={(e) => setSelectedDonor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Choose a donor...</option>
                {donors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} — {d.bloodType}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleLogDonation}
              disabled={logging || !selectedDonor}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
            >
              {logging ? 'Logging...' : 'Log Donation'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default BankDashboard