import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['donor', 'bloodbank', 'hospital'],
    default: 'donor'
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: function () { return this.role === 'donor' }
  },
  phone: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: { type: String }
  },
  lastDonated: {
    type: Date,
    default: null
  },
  donationCount: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String,
    enum: ['Life Starter', 'Regular Hero', 'Blood Warrior']
  }],
  isAvailable: {
    type: Boolean,
    default: true   // donor is available to donate
  }
}, { timestamps: true })

// Index for geolocation queries
userSchema.index({ location: '2dsphere' })

export default mongoose.model('User', userSchema)