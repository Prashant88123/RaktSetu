import BloodRequest from '../models/BloodRequest.js'
import BloodBank from '../models/BloodBank.js'
import Hospital from '../models/Hospital.js'
import { io } from '../index.js'

// POST /api/hospital/request
// Hospital raises a new blood request
export const createRequest = async (req, res) => {
  try {
    const { bloodType, unitsRequired, urgencyLevel, patientDetails } = req.body

    const request = await BloodRequest.create({
      requestedBy: req.user._id,
      bloodType,
      unitsRequired,
      urgencyLevel,
      patientDetails
    })

    // Find nearest blood banks that have sufficient stock
    const hospital = await Hospital.findById(req.user._id)
    const nearbyBanks = await BloodBank.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: hospital.location.coordinates
          },
          $maxDistance: 20000
        }
      },
      [`inventory.${bloodType}`]: { $gte: unitsRequired }
    }).limit(5)

    // Notify nearby matching banks in real-time
    nearbyBanks.forEach((bank) => {
      io.emit(`bank-${bank._id}-request`, {
        requestId:    request._id,
        bloodType,
        unitsRequired,
        urgencyLevel,
        hospitalName: hospital.name,
        hospitalAddress: hospital.location.address
      })
    })

    res.status(201).json({ message: 'Request created', request })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/hospital/requests
// Hospital fetches all its own requests
export const getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requestedBy: req.user._id })
      .populate('fulfilledBy', 'name location')
      .sort({ createdAt: -1 })

    res.status(200).json({ requests })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}