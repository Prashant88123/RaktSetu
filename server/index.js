import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import connectDB from './config/db.js'

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

// Routes (we'll add these next)
app.get('/', (req, res) => res.send('RaktSetu API Running ✅'))

// Socket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id))
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))