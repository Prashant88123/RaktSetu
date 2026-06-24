import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.js'

const ROLES       = ['donor', 'bloodbank', 'hospital']
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const Register = () => {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const [role, setRole]             = useState('donor')
  const [form, setForm]             = useState({
    name: '', email: '', password: '', phone: '', bloodType: '', address: ''
  })
  const [error, setError]           = useState(null)
  const [loading, setLoading]       = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const getLocation = () => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
        () => resolve(null) 
      )
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      let coordinates = null

      // Get real coordinates for banks and hospitals during registration
      if (role === 'bloodbank' || role === 'hospital') {
        coordinates = await getLocation()
      }

      const res = await api.post('/auth/register', {
        ...form,
        role,
        coordinates  // send coordinates to backend
      })

      login(res.data.user, res.data.token)

      if (role === 'donor')     navigate('/donor')
      if (role === 'bloodbank') navigate('/bank')
      if (role === 'hospital')  navigate('/hospital')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl">🩸</span>
          <h1 className="text-3xl font-extrabold text-red-600 mt-2">RaktSetu</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Register as</h2>

          {/* Role Selector */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-medium capitalize transition-colors
                  ${role === r
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-red-50'
                  }`}
              >
                {r === 'bloodbank' ? 'Blood Bank' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {role === 'donor' ? 'Full Name' : 'Institution Name'}
              </label>
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder={role === 'donor' ? 'Rahul Sharma' : 'City Blood Bank'}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Blood type only for donors */}
            {role === 'donor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <select
                  name="bloodType"
                  required
                  value={form.bloodType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                name="address"
                type="text"
                required
                value={form.address}
                onChange={handleChange}
                placeholder="Civil Lines, Kanpur"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/" className="text-red-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register