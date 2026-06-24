import express from 'express'
import { createRequest, getMyRequests } from '../controllers/hospitalController.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/request', protect, restrictTo('hospital'), createRequest)
router.get('/requests', protect, restrictTo('hospital'), getMyRequests)

export default router