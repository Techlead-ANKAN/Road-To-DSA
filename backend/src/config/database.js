import mongoose from 'mongoose'

let cachedConnection = null

export const connectDatabase = async (mongoUri) => {
  if (cachedConnection) {
    return cachedConnection
  }

  if (!mongoUri) {
    throw new Error('Missing MongoDB connection string')
  }

  mongoose.set('strictQuery', false)

  const connection = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 30000
  })

  cachedConnection = connection
  return connection
}

export const disconnectDatabase = async () => {
  if (!cachedConnection) {
    return
  }

  await mongoose.disconnect()
  cachedConnection = null
}
