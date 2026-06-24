import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import DonorDashboard from './pages/DonorDashboard.jsx'
import BankDashboard from './pages/BankDashboard.jsx'
import HospitalDashboard from './pages/HospitalDashboard.jsx'

// Redirects already logged-in users away from login/register
const PublicRoute = ({ children }) => {
  const { user } = useAuth()
  if (user?.role === 'donor')     return <Navigate to="/donor"    replace />
  if (user?.role === 'bloodbank') return <Navigate to="/bank"     replace />
  if (user?.role === 'hospital')  return <Navigate to="/hospital" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PublicRoute><Login /></PublicRoute>
        }/>
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        }/>
        <Route path="/donor" element={
          <ProtectedRoute allowedRole="donor">
            <DonorDashboard />
          </ProtectedRoute>
        }/>
        <Route path="/bank" element={
          <ProtectedRoute allowedRole="bloodbank">
            <BankDashboard />
          </ProtectedRoute>
        }/>
        <Route path="/hospital" element={
          <ProtectedRoute allowedRole="hospital">
            <HospitalDashboard />
          </ProtectedRoute>
        }/>

        {/* Catch all unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App