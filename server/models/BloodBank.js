import mongoose from 'mongoose'

const bloodBankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Blood bank name is required'],
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    default: 'bloodbank'
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
  inventory: {
    'A+':  { type: Number, default: 0 },
    'A-':  { type: Number, default: 0 },
    'B+':  { type: Number, default: 0 },
    'B-':  { type: Number, default: 0 },
    'AB+': { type: Number, default: 0 },
    'AB-': { type: Number, default: 0 },
    'O+':  { type: Number, default: 0 },
    'O-':  { type: Number, default: 0 },
  },
  usageHistory: [{
    date: { type: Date, default: Date.now },
    bloodType: String,
    unitsUsed: Number
  }],
  urgencyScore: {
    type: Number,
    default: 0   // calculated dynamically
  },
  isVerified: {
    type: Boolean,
    default: false  // admin verifies institutions
  },
  operatingHours: {
    type: String,
    default: '24/7'
  }
}, { timestamps: true })

bloodBankSchema.index({ location: '2dsphere' })

export default mongoose.model('BloodBank', bloodBankSchema)