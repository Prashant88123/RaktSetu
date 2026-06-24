import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Redirects to login if user is not authenticated
// Redirects to correct dashboard if user tries to access wrong role's page
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, token } = useAuth()

  if (!token || !user) return <Navigate to="/" replace />

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'donor')     return <Navigate to="/donor"    replace />
    if (user.role === 'bloodbank') return <Navigate to="/bank"     replace />
    if (user.role === 'hospital')  return <Navigate to="/hospital" replace />
  }

  return children
}

export default ProtectedRoute