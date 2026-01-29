import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root FIRST
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY', 'JWT_SECRET', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

import couponRoutes from './routes/couponRoutes.js';
import { verifyEmailConfig } from './utils/emailService.js';

import { verifySMSConfig } from './utils/smsService.js';

const app = express();

// ✅ SECURITY: Set trust proxy for deployment
app.set('trust proxy', 1);

// ✅ SECURITY: Helmet for secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }
}));

// ✅ SECURITY: CORS with restricted origins (relaxed for development)
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['https://yourdomain.com'])
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production') {
      // In development, allow all origins
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// ✅ SECURITY: Rate limiting (relaxed for development)
const limiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 60 * 1000, // 15 min prod, 1 hour dev
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 prod, 1000 dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 requests per 15 minutes for auth endpoints
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// ✅ SECURITY: Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Explicitly add CORS headers for image uploads
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cache-Control', 'public, max-age=3600');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// ✅ SECURITY: Supabase Connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Key is missing in .env file');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test Supabase Connection
supabase.auth.getSession()
  .then(() => {
    console.log('✅ Supabase connected successfully');
  })
  .catch(err => {
    console.warn('⚠️ Supabase connection test:', err.message);
  });

// ✅ SECURITY: Email Service Verification
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  verifyEmailConfig().catch(err => {
    console.warn('⚠️ Email service verification failed:', err.message);
  });

} else {
  console.warn('⚠️ Email credentials not configured. OTP emails will not be sent.');
}

// ✅ SECURITY: SMS Service Verification
verifySMSConfig().catch(err => {
  console.warn('⚠️ SMS service verification failed:', err.message);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);

// ✅ IMAGE SERVING ENDPOINT with proper CORS headers
app.get('/api/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'uploads', filename);

  // Security: prevent directory traversal
  if (!filePath.startsWith(path.join(__dirname, 'public', 'uploads'))) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cache-Control', 'public, max-age=3600');

  // Send file
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving image:', err);
      res.status(404).json({ message: 'Image not found' });
    }
  });
});

// ✅ SECURITY: Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ✅ SECURITY: 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// ✅ SECURITY: Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Don't expose sensitive error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on port ${PORT} (${process.env.NODE_ENV})`);
});
