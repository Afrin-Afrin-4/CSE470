const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database
const connectDB = require('./config/db');
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Middleware to handle raw body for Stripe webhooks
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS
app.use(cors());

// Set security headers with YouTube embed permissions
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://www.youtube.com", "https://s.ytimg.com"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com"],
      imgSrc: ["'self'", "data:", "https:", "https://source.unsplash.com", "https://via.placeholder.com"],
      connectSrc: ["'self'", "https://www.google-analytics.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for YouTube embeds
}));

// File uploading
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/users', require('./routes/users'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications')); // Add notifications route
app.use('/api/categories', require('./routes/categories')); // Add categories route
app.use('/api/badges', require('./routes/badges')); // Add badges route
app.use('/api/certificates', require('./routes/certificates')); // Add certificates route
app.use('/api/reviews', require('./routes/reviews')); // Add reviews route
app.use('/api/quizzes', require('./routes/quizzes')); // Add standalone quizzes route
app.use('/api/assignments', require('./routes/assignments')); // Add standalone assignments route

// Error handler
app.use(require('./middleware/error'));

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});