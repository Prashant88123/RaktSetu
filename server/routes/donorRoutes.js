import express from 'express'
import { getProfile, toggleAvailability, logDonation, getAllDonors } from '../controllers/donorController.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/profile',          protect, restrictTo('donor'),     getProfile)
router.put('/availability',     protect, restrictTo('donor'),     toggleAvailability)
router.post('/log-donation',    protect, restrictTo('bloodbank'), logDonation)
router.get('/all',              protect, restrictTo('bloodbank'), getAllDonors)

export default router;