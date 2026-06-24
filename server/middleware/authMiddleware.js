import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import BloodBank from '../models/BloodBank.js'
import Hospital from '../models/Hospital.js'

// Protect any route — verifies JWT token
export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(' ')[1] // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user across all 3 models based on role
    if (decoded.role === 'donor') {
      req.user = await User.findById(decoded.id).select('-password')
    } else if (decoded.role === 'bloodbank') {
      req.user = await BloodBank.findById(decoded.id).select('-password')
    } else if (decoded.role === 'hospital') {
      req.user = await Hospital.findById(decoded.id).select('-password')
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user.role = decoded.role
    next()

  } catch (error) {
    return res.status(401).json({ message: 'Token invalid or expired' })
  }
}

// Restrict route to specific roles
// Usage: restrictTo('donor'), restrictTo('bloodbank', 'hospital')
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${roles.join(' or ')} can do this.`
      })
    }
    next()
  }
}