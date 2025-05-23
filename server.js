const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
let dbConnection = null;
(async () => {
  dbConnection = await connectDB();
})();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route untuk health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running...', dbStatus: dbConnection ? 'connected' : 'disconnected' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Jangan crash server, hanya log error
});

// Server dengan fallback port
const PORT = process.env.PORT || 3001;
let server;

const startServer = (port) => {
  server = app.listen(port, '127.0.0.1', () => {
    console.log(`Server berjalan di http://127.0.0.1:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} sudah digunakan. Mencoba port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});