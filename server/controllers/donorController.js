import User from '../models/User.js'

// GET /api/donors/profile
// Returns the logged-in donor's full profile
export const getProfile = async (req, res) => {
  try {
    const donor = await User.findById(req.user._id).select('-password')
    if (!donor) return res.status(404).json({ message: 'Donor not found' })
    res.status(200).json({ donor })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/donors/availability
// Donor toggles their availability to donate
export const toggleAvailability = async (req, res) => {
  try {
    const donor = await User.findById(req.user._id)
    donor.isAvailable = !donor.isAvailable
    await donor.save()
    res.status(200).json({ isAvailable: donor.isAvailable })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// POST /api/donors/log-donation
// Blood bank logs a donation for a donor — updates count, badges, lastDonated
export const logDonation = async (req, res) => {
  try {
    const { donorId } = req.body

    const donor = await User.findById(donorId)
    if (!donor) return res.status(404).json({ message: 'Donor not found' })

    donor.donationCount += 1
    donor.lastDonated    = new Date()

    // Award badges based on donation milestones
    if (donor.donationCount >= 1  && !donor.badges.includes('Life Starter'))
      donor.badges.push('Life Starter')
    if (donor.donationCount >= 5  && !donor.badges.includes('Regular Hero'))
      donor.badges.push('Regular Hero')
    if (donor.donationCount >= 10 && !donor.badges.includes('Blood Warrior'))
      donor.badges.push('Blood Warrior')

    await donor.save()
    res.status(200).json({ message: 'Donation logged', donor })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/donors/all
// Blood bank fetches all available donors (for logging donations)
export const getAllDonors = async (req, res) => {
  try {
    const donors = await User.find({ role: 'donor', isAvailable: true }).select('-password')
    res.status(200).json({ donors })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}