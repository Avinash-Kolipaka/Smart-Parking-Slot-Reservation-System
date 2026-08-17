const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not configured');
    }

    // Guard against localhost URIs on hosted environments.
    // Render/Heroku/Railway containers have no local MongoDB — use MongoDB Atlas.
    const isLocalhost = /localhost|127\.0\.0\.1|::1/.test(process.env.MONGO_URI);
    if (isLocalhost && process.env.NODE_ENV === 'production') {
      throw new Error(
        'MONGO_URI points to localhost, which is not available on Render. ' +
        'Set MONGO_URI to a MongoDB Atlas connection string in the Render Dashboard → Environment tab. ' +
        'Example: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority'
      );
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
