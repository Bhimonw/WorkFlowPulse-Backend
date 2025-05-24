const mongoose = require('mongoose');

// Set strictQuery option untuk menghindari deprecation warning
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout setelah 5 detik
      socketTimeoutMS: 45000, // Tutup socket setelah 45 detik tidak aktif
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('MongoDB connection error. Please make sure MongoDB is running.');
    // Jangan exit process, biarkan aplikasi tetap berjalan
    // process.exit(1);
    return null;
  }
};

module.exports = connectDB;