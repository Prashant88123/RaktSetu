import express from 'express'
import { protect, restrictTo } from '../middleware/authMiddleware.js'
import { getNearbyBanks, getBankById, updateInventory, getMyInventory, getPendingRequests, handleRequest, logUsage } from '../controllers/bankController.js'


const router = express.Router()

router.get('/nearby', getNearbyBanks)
router.put('/inventory', protect, restrictTo('bloodbank'), updateInventory)
router.get('/inventory', protect, restrictTo('bloodbank'), getMyInventory)
router.get('/requests',     protect, restrictTo('bloodbank'), getPendingRequests)
router.put('/requests/:id', protect, restrictTo('bloodbank'), handleRequest)
router.post('/usage', protect, restrictTo('bloodbank'), logUsage)
router.get('/:id', protect, getBankById)

export default router