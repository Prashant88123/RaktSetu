import mongoose from 'mongoose'

const bloodRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  unitsRequired: {
    type: Number,
    required: true,
    min: 1
  },
  urgencyLevel: {
    type: String,
    enum: ['critical', 'moderate', 'low'],
    default: 'moderate'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  fulfilledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodBank',
    default: null
  },
  patientDetails: {
    age: Number,
    condition: String    // optional, for context
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24hrs
  }
}, { timestamps: true })

export default mongoose.model('BloodRequest', bloodRequestSchema)
