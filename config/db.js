import mongoose from 'mongoose';

/**
 * Connect to MongoDB.
 * – Uses MONGO_URI from .env
 * – Prints colored console messages
 * – Gracefully closes on SIGINT
 */
const connectDB = async () => {
  try {
    // optional, removes “strictQuery” warning in Mongoose 8+
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // add any connection options you need here
    });

    console.log(
      `🌿  MongoDB connected: ${conn.connection.host} (${conn.connection.name})`
    );

    mongoose.connection.on('error', (err) =>
      console.error(`MongoDB connection error: ${err}`)
    );

    // Close nicely on Ctrl‑C
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (err) {
    console.error(`❌  MongoDB error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
