import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import bankRoutes from './routes/bankRoutes.js'
import hospitalRoutes from './routes/hospitalRoutes.js'
import donorRoutes from './routes/donorRoutes.js'


dotenv.config()
const app = express()
const httpServer = createServer(app)

// Socket.io setup
export const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
})

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

// DB Connection
connectDB()

app.get('/', (req, res) => res.send('RaktSetu API Running ✅'))

//Routes
app.use('/api/auth', authRoutes)
app.use('/api/banks', bankRoutes)
app.use('/api/hospital', hospitalRoutes)
app.use('/api/donors', donorRoutes)


io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Donor joins a room based on their blood type
  // This allows targeted alerts to only relevant donors
  socket.on('join-blood-type-room', (bloodType) => {
    socket.join(bloodType)
    console.log(`Socket ${socket.id} joined room: ${bloodType}`)
  })

  // Blood bank broadcasts inventory update to all connected clients
  socket.on('inventory-update', (data) => {
    io.emit('inventory-changed', data)
  })

  socket.on('leave-blood-type-room', (bloodType) => {
    socket.leave(bloodType)
    console.log(`Socket ${socket.id} left room: ${bloodType}`)
  })

  // Blood bank triggers emergency alert to a specific blood type room
  socket.on('emergency-alert', (data) => {
    io.to(data.bloodType).emit('urgent-request', data)
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})


// Socket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id))
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))