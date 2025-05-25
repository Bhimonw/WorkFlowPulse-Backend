const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const environment = {
  // Database
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Email (Optional)
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  
  // Printer (Optional)
  PRINTER_NAME: process.env.PRINTER_NAME,
  PRINTER_TYPE: process.env.PRINTER_TYPE,
  
  // CORS Configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : 
    ['http://localhost:3000'],
  
  // CORS Settings
  CORS_ENABLED: process.env.CORS_ENABLED === 'true' || true,
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true' || true,
  CORS_MAX_AGE: parseInt(process.env.CORS_MAX_AGE) || 86400,
  
  // Security
  ADMIN_ORIGINS: process.env.ADMIN_ORIGINS ? 
    process.env.ADMIN_ORIGINS.split(',').map(origin => origin.trim()) : 
    ['http://localhost:3000'],
};

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_URL'
];

requiredEnvVars.forEach(envVar => {
  if (!environment[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

module.exports = environment;