import dotenv from 'dotenv'
import { createApp } from './app.js'
import { connectDatabase } from './config/database.js'

dotenv.config()

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

const bootstrap = async () => {
  try {
    await connectDatabase(MONGO_URI)
    const app = createApp()
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server', error)
    process.exit(1)
  }
}

bootstrap()
