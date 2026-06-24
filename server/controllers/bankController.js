import BloodRequest from '../models/BloodRequest.js'
import BloodBank from '../models/BloodBank.js'
import Hospital from '../models/Hospital.js'
import { io } from '../index.js'
import { predictShortage, generateDonorAlert } from '../utils/aiService.js'
import User from '../models/User.js'

// GET /api/banks/nearby
// Finds nearest blood banks based on donor's coordinates & blood type
export const getNearbyBanks = async (req, res) => {
  try {
    const { lng, lat, bloodType } = req.query

    if (!lng || !lat) {
      return res.status(400).json({ message: 'Location coordinates are required' })
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 15000 // 15km radius
        }
      }
    }

    // Filter by blood type if provided
    if (bloodType) {
      query[`inventory.${bloodType}`] = { $gte: 0 }
    }

    const banks = await BloodBank.find(query).select('-password')

    // Calculate urgency score for each bank dynamically
    const banksWithUrgency = banks.map((bank) => {
      const stock = bank.inventory[bloodType] ?? 0
      let urgencyScore = 0

      if (stock < 5)       urgencyScore = 100  // critical
      else if (stock < 15) urgencyScore = 60   // low
      else                 urgencyScore = 20   // stable

      return { ...bank.toObject(), urgencyScore }
    })

    // Sort by urgency — most urgent first
    banksWithUrgency.sort((a, b) => b.urgencyScore - a.urgencyScore)

    res.status(200).json({ banks: banksWithUrgency })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/banks/:id
// Get a single blood bank by ID
export const getBankById = async (req, res) => {
  try {
    const bank = await BloodBank.findById(req.params.id).select('-password')
    if (!bank) return res.status(404).json({ message: 'Blood bank not found' })
    res.status(200).json({ bank })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/banks/inventory
// Blood bank updates its own inventory
export const updateInventory = async (req, res) => {
  try {
    const { inventory } = req.body

    const bank = await BloodBank.findByIdAndUpdate(
      req.user._id,
      { inventory },
      { new: true }
    ).select('-password')

    // Broadcast live inventory update to all connected clients
    io.emit('inventory-changed', {
      bankId:    bank._id,
      bankName:  bank.name,
      inventory: bank.inventory
    })

    // shortage prediction for each blood type
    const predictions = {}
    for (const [bloodType, units] of Object.entries(inventory)) {
      const prediction = predictShortage(bloodType, units, bank.usageHistory)
      predictions[bloodType] = prediction

      // If predicted critical, generate personalized GPT alert for matched donors
      if (prediction.critical) {
        const availableDonors = await User.find({
          role:        'donor',
          bloodType,
          isAvailable: true
        })

        for (const donor of availableDonors) {
          const daysSince = donor.lastDonated
            ? Math.floor((Date.now() - new Date(donor.lastDonated)) / (1000 * 60 * 60 * 24))
            : 90

          // Generate personalized message via GPT
          const message = await generateDonorAlert({
            donorName:            donor.name,
            bloodType,
            bankName:             bank.name,
            bankAddress:          bank.location.address,
            daysSinceLastDonation: daysSince
          })

          // Send personalized alert to that donor's socket room
          io.to(bloodType).emit('urgent-request', {
            bankId:    bank._id,
            bankName:  bank.name,
            address:   bank.location.address,
            bloodType,
            units,
            message, 
            aiPredicted: true
          })
        }
      }
    }

    res.status(200).json({ message: 'Inventory updated', bank, predictions })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/banks/inventory
// Returns the authenticated blood bank's current inventory
export const getMyInventory = async (req, res) => {
  try {
    const bank = await BloodBank.findById(req.user._id).select('-password')
    if (!bank) return res.status(404).json({ message: 'Blood bank not found' })
    res.status(200).json({ inventory: bank.inventory, name: bank.name })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/banks/requests
// Blood bank fetches all pending blood requests nearby
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: 'pending' })
      .populate('requestedBy', 'name location')
      .sort({ urgencyLevel: 1, createdAt: -1 })

    res.status(200).json({ requests })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/banks/requests/:id
// Blood bank accepts or rejects a blood request
export const handleRequest = async (req, res) => {
  try {
    const { action } = req.body // 'accepted' or 'rejected'

    const request = await BloodRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ message: 'Request not found' })

    request.status      = action
    request.fulfilledBy = action === 'accepted' ? req.user._id : null
    await request.save()

    // Deduct units from bank inventory if accepted
    if (action === 'accepted') {
      await BloodBank.findByIdAndUpdate(req.user._id, {
        $inc: { [`inventory.${request.bloodType}`]: -request.unitsRequired }
      })
    }

    // Notify the hospital of the status change in real-time
    io.emit(`hospital-${request.requestedBy}-update`, {
      requestId: request._id,
      status:    action,
      bankName:  req.user.name
    })

    res.status(200).json({ message: `Request ${action}`, request })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// POST /api/banks/usage
// Blood bank logs daily blood usage to feed the prediction engine
export const logUsage = async (req, res) => {
  try {
    const { bloodType, unitsUsed } = req.body

    await BloodBank.findByIdAndUpdate(req.user._id, {
      $push: {
        usageHistory: {
          date: new Date(),
          bloodType,
          unitsUsed
        }
      }
    })

    res.status(200).json({ message: 'Usage logged' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}