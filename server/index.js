import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

import { initDB } from './database/init.js'
import authRoutes from './routes/auth.js'
import categoryRoutes from './routes/categories.js'
import productRoutes from './routes/products.js'
import hamperRoutes from './routes/hampers.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import queryRoutes from './routes/queries.js'
import userRoutes from './routes/users.js'
import paymentRoutes from './routes/payments.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/hampers', hamperRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/queries', queryRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payments', paymentRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Shree Dryfruits API is running' })
})

app.use(express.static(join(__dirname, '../client/dist')))

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../client/dist/index.html'))
})

const startServer = async () => {
  try {
    await initDB()
    console.log('Database initialized')
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
