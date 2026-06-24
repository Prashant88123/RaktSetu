import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardLink =
    user?.role === 'donor'     ? '/donor'    :
    user?.role === 'bloodbank' ? '/bank'     :
    user?.role === 'hospital'  ? '/hospital' : '/'

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">

      {/* Logo */}
      <Link to={dashboardLink} className="flex items-center gap-2">
        <span className="text-2xl">🩸</span>
        <span className="text-xl font-extrabold text-red-600">RaktSetu</span>
      </Link>

      {/* Right side */}
      {user && (
        <div className="flex items-center gap-4">

          {/* Role badge */}
          <span className="hidden sm:inline-block text-xs font-medium bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full capitalize">
            {user.role === 'bloodbank' ? 'Blood Bank' : user.role}
          </span>

          {/* User name */}
          <span className="text-sm font-medium text-gray-700">
            {user.name}
          </span>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar