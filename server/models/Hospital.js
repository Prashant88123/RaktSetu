import mongoose from 'mongoose'

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
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
    default: 'hospital'
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
  activeRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest'
  }],
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

hospitalSchema.index({ location: '2dsphere' })

export default mongoose.model('Hospital', hospitalSchema)