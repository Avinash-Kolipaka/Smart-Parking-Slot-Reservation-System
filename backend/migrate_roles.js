const mongoose = require('mongoose');

// Assuming standard local MongoDB connection for this script
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-parking';

async function runMigration() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find and update all users where role is 'CUSTOMER' or 'customer'
    const result = await mongoose.connection.db.collection('users').updateMany(
      { role: { $regex: /^customer$/i } },
      { $set: { role: 'USER' } }
    );

    console.log(`Migration complete. Successfully updated ${result.modifiedCount} user(s).`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

runMigration();
