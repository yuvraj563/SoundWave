const mongoose = require('mongoose')

/**
 * Connect to MongoDB Atlas.
 * Exits the process on failure so the error is visible immediately.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
