import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import BloodBank from '../models/BloodBank.js'
import Hospital from '../models/Hospital.js'

// generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

const getModel = (role) => {
  if (role === 'donor') return User
  if (role === 'bloodbank') return BloodBank
  if (role === 'hospital') return Hospital
  return null
}

// ─── REGISTER ───────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, bloodType, address, coordinates } = req.body

    const Model = getModel(role)
    if (!Model) {
      return res.status(400).json({ message: 'Invalid role provided' })
    }

    const existingUser = await Model.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      location: {
        type: 'Point',
        address: address || '',
        // Use provided coordinates or default to Kanpur center
        coordinates: coordinates ?? [80.3319, 26.4499]
      }
    }

    if (role === 'donor') {
      if (!bloodType) {
        return res.status(400).json({ message: 'Blood type is required for donor registration' })
      }
      userData.bloodType = bloodType
    }

    const newUser = await Model.create(userData)
    const token = generateToken(newUser._id, role)

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id:         newUser._id,
        name:       newUser.name,
        email:      newUser.email,
        role,
        bloodType:  newUser.bloodType  || null,
        isVerified: newUser.isVerified || null
      }
    })

  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}
// ─── LOGIN ───────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body

    // Validate role
    const Model = getModel(role)
    if (!Model) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    // Find user
    const user = await Model.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user._id, role)

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
        bloodType: user.bloodType || null,
        isVerified: user.isVerified || null
      }
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ─── GET CURRENT USER ────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    res.status(200).json({ user: req.user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}