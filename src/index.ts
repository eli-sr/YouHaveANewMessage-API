import express from 'express'
import router from './routes'

const app = express()

// Middlewares
app.use(express.json())

// Routes
app.use('/api', router)

app.listen(3000, () => console.log('Server is running on port http://localhost:3000'))
