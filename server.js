import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

import aiRoutes from './aiRoutes.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

// Mount AI routes
app.use(aiRoutes)


// Serve uploaded images as static files
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
app.use('/uploads', express.static(uploadsDir))

// ── File-based fallback storage ──
const dataFile = path.join(__dirname, 'uploads', 'incidents.json')
let inMemoryIncidents = []

const loadFileIncidents = () => {
  try {
    if (fs.existsSync(dataFile)) {
      inMemoryIncidents = JSON.parse(fs.readFileSync(dataFile, 'utf8'))
    }
  } catch (e) {
    inMemoryIncidents = []
  }
}
const saveFileIncidents = () => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(inMemoryIncidents, null, 2))
  } catch (e) {}
}
loadFileIncidents()

// ── Serverless-ready MongoDB Connection Caching ──────────────
let cachedDb = null

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb
  }

  const mongoUri = process.env.MONGODB_URI || ''
  const isPlaceholder = !mongoUri || mongoUri.includes('USERNAME:PASSWORD') || mongoUri.includes('<password>')

  if (!isPlaceholder) {
    try {
      const db = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        family: 4,
      })
      cachedDb = db
      console.log('✅ MongoDB Atlas Connected!')
      return db
    } catch (e) {
      console.error('MongoDB Atlas connection error:', e.message)
    }
  }
  return null
}

// ── Incident Schema & Model ──────────────────────────────────
const incidentSchema = new mongoose.Schema({
  userId:            { type: String, required: true },
  userName:          { type: String, default: 'Anonymous' },
  userEmail:         { type: String, default: '' },
  userPhone:         { type: String, default: '' },
  userImage:         { type: String, default: '' },
  emergencyType:     { type: String, required: true },
  lat:               { type: Number, required: true },
  lng:               { type: Number, required: true },
  description:       { type: String, required: true },
  imageUrl:          { type: String, default: '' },
  status:            { type: String, default: 'pending', enum: ['pending', 'assigned', 'in_progress', 'resolved'] },
  aiPriority:        { type: String, default: 'Medium', enum: ['Critical', 'High', 'Medium', 'Low'] },
  aiReason:          { type: String, default: '' },
  aiRecommendedTeam: { type: String, default: 'General Rescue Unit' },
  assignedUnit:      { type: String, default: '' },
}, { timestamps: true })

const Incident = mongoose.model('Incident', incidentSchema)

// ── Multer (image upload) ───────────────────────────────────
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } })

// ── Routes ──────────────────────────────────────────────────

// GET all incidents (sorted newest first)
app.get('/api/incidents', async (req, res) => {
  try {
    await connectToDatabase()
    if (mongoose.connection.readyState === 1) {
      const incidents = await Incident.find().sort({ createdAt: -1 }).lean()
      const mapped = incidents.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }))
      return res.json(mapped)
    }
    const sorted = [...inMemoryIncidents].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    res.json(sorted)
  } catch (err) {
    const sorted = [...inMemoryIncidents].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    res.json(sorted)
  }
})

// GET single incident
app.get('/api/incidents/:id', async (req, res) => {
  try {
    await connectToDatabase()
    if (mongoose.connection.readyState === 1) {
      const doc = await Incident.findById(req.params.id).lean()
      if (!doc) return res.status(404).json({ error: 'Not found' })
      const { _id, ...rest } = doc
      return res.json({ id: _id.toString(), ...rest })
    }
    const item = inMemoryIncidents.find((i) => i.id === req.params.id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create incident
app.post('/api/incidents', async (req, res) => {
  try {
    await connectToDatabase()
    if (mongoose.connection.readyState === 1) {
      const doc = await Incident.create(req.body)
      return res.status(201).json({ id: doc._id.toString(), ...doc.toObject({ versionKey: false }) })
    }
    // Fallback
    const newItem = {
      id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...req.body,
      createdAt: new Date().toISOString(),
    }
    inMemoryIncidents.unshift(newItem)
    saveFileIncidents()
    res.status(201).json(newItem)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PATCH update incident
app.patch('/api/incidents/:id', async (req, res) => {
  try {
    await connectToDatabase()
    if (mongoose.connection.readyState === 1) {
      const doc = await Incident.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).lean()
      if (!doc) return res.status(404).json({ error: 'Not found' })
      const { _id, ...rest } = doc
      return res.json({ id: _id.toString(), ...rest })
    }
    // Fallback
    const idx = inMemoryIncidents.findIndex((i) => i.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    inMemoryIncidents[idx] = { ...inMemoryIncidents[idx], ...req.body, updatedAt: new Date().toISOString() }
    saveFileIncidents()
    res.json(inMemoryIncidents[idx])
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// POST upload image for an incident
app.post('/api/incidents/:id/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const imageUrl = `/uploads/${req.file.filename}`

    if (isMongoConnected) {
      await Incident.findByIdAndUpdate(req.params.id, { imageUrl })
    } else {
      const index = inMemoryIncidents.findIndex((i) => i.id === req.params.id)
      if (index !== -1) {
        inMemoryIncidents[index].imageUrl = imageUrl
        saveFileIncidents()
      }
    }
    res.json({ imageUrl })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE incident
app.delete('/api/incidents/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      await Incident.findByIdAndDelete(req.params.id)
    } else {
      inMemoryIncidents = inMemoryIncidents.filter((i) => i.id !== req.params.id)
      saveFileIncidents()
    }
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── 50km Emergency Broadcast Alert Endpoints ──────────────────
let activeBroadcasts = []

// Admin creates a 50km Emergency Broadcast Alert
app.post('/api/broadcasts', (req, res) => {
  const { title, message, lat, lng, radiusKm = 50 } = req.body
  const newBroadcast = {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: title || '🚨 EMERGENCY SITUATION CHECK ALERT',
    message: message || 'Rescue Command requested an immediate safety status check within a 50km radius of your area.',
    lat: Number(lat) || 19.0760,
    lng: Number(lng) || 72.8777,
    radiusKm: Number(radiusKm) || 50,
    createdAt: new Date().toISOString(),
    responses: [],
  }
  // Store as active broadcast (replace or prepend)
  activeBroadcasts.unshift(newBroadcast)
  res.status(201).json(newBroadcast)
})

// Get active broadcasts for citizens
app.get('/api/broadcasts/active', (req, res) => {
  res.json(activeBroadcasts)
})

// Citizen responds to broadcast alert (Safe or SOS)
app.post('/api/broadcasts/:id/respond', (req, res) => {
  const { id } = req.params
  const { status, userName, userEmail, lat, lng } = req.body
  const broadcast = activeBroadcasts.find((b) => b.id === id)
  if (!broadcast) return res.status(404).json({ error: 'Broadcast not found' })

  const responseObj = {
    id: `resp_${Date.now()}`,
    status: status || 'safe', // 'safe' | 'sos'
    userName: userName || 'Citizen',
    userEmail: userEmail || '',
    lat: Number(lat),
    lng: Number(lng),
    timestamp: new Date().toISOString(),
  }

  // Prevent duplicate responses from same user/email
  broadcast.responses = broadcast.responses.filter((r) => r.userEmail !== userEmail || !userEmail)
  broadcast.responses.push(responseObj)

  res.json({ success: true, broadcast })
})


// Root handler — redirects directly to Vite web application
app.get('/', (req, res) => {
  res.redirect('http://localhost:3000')
})


// Health check
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  storageMode: isMongoConnected ? 'mongodb' : 'local-file-storage',
}))


if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 ResQAI server listening permanently on port ${PORT}`)
  })
}

export default app

