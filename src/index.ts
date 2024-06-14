import express from 'express'
import router from './routes'
import cors from 'cors'

const app = express()

// CORS
const corsOptions = {
  origin: 'localhost',
  methods: ['GET', 'POST'],
  allowHeaders: ['Content-Type']
}

// Middlewares
app.use(express.json())
app.use(cors(corsOptions))

// Routes
app.use('/api', router)

app.listen(3000, () => console.log('Server is running on port http://localhost:3000'))
