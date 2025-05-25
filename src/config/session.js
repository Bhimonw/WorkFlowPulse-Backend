const session = require('express-session');
const MongoStore = require('connect-mongo');
const { MONGODB_URI, SESSION_SECRET } = require('./environment');

const sessionConfig = {
  secret: SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    touchAfter: 24 * 3600, // lazy session update
    ttl: 7 * 24 * 60 * 60 // 7 days session expiry
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'strict'
  },
  name: 'wfp.session.id' // Custom session name
};

module.exports = sessionConfig;