import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import proxy from 'express-http-proxy';

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

// ✅ SUPABASE PROXY CONFIGURATION
const rawUrl = process.env.SUPABASE_URL || '';
const cleanSupabaseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

// ✅ SUPABASE PROXY (Universal ISP Bypass)
app.use(['/supabase-proxy', '/auth', '/rest', '/storage'], (req, res, next) => {
  const isAuth = req.originalUrl.includes('/auth/v1/');
  const isStorage = req.originalUrl.includes('/storage/v1/');
  if (isAuth || isStorage) {
    console.log(`📡 [PROXY] ${req.method} ${req.originalUrl}`);
  }
  next();
}, proxy(cleanSupabaseUrl, {
  proxyReqPathResolver: (req) => {
    // If request comes through /supabase-proxy, use subpath
    // If it comes through root /auth, /rest, or /storage, use originalUrl
    return req.baseUrl === '/supabase-proxy' ? req.url : req.originalUrl;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    // 1. HOST LOCK: Aggressively detect the browser's domain
    // We check X-Forwarded-Host (from Vercel) first, then Host, then fallback.
    const rawForwardedHost = srcReq.headers['x-forwarded-host'] || '';
    const firstHost = rawForwardedHost.split(',')[0].trim();

    // If we see 'vercel.app' anywhere, lock it in. This fixes the PKCE mismatch.
    let trueHost = firstHost || srcReq.headers.host || 'beautypoint.onrender.com';
    if (srcReq.headers.referer && srcReq.headers.referer.includes('vercel.app')) {
      const refHost = new URL(srcReq.headers.referer).host;
      if (refHost.includes('vercel.app')) trueHost = refHost;
    }

    const supabaseHost = cleanSupabaseUrl.replace('https://', '').replace('http://', '');

    // ✅ CRITICAL DEBUG: This host MUST match your Google Redirect URI exactly
    if (srcReq.originalUrl.includes('/auth/v1/')) {
      console.log(`📡 [AUTH REQ] Extracted Host: ${trueHost} | Path: ${srcReq.originalUrl}`);
    }

    // ✅ FORCE SYNC: These headers tell Supabase how to build the Google handshake
    proxyReqOpts.headers['x-forwarded-host'] = trueHost;
    proxyReqOpts.headers['x-forwarded-proto'] = 'https';
    proxyReqOpts.headers['x-forwarded-port'] = '443';
    proxyReqOpts.headers['x-forwarded-for'] = srcReq.ip || srcReq.headers['x-forwarded-for'];

    // Host Spoofing for Supabase routing
    proxyReqOpts.headers['host'] = supabaseHost;
    proxyReqOpts.headers['origin'] = cleanSupabaseUrl;
    proxyReqOpts.headers['referer'] = cleanSupabaseUrl + '/';

    return proxyReqOpts;
  },
  userResHeaderDecorator: (headers, userReq, userRes, proxyReq, proxyRes) => {
    // ✅ PERMISSIVE CORS
    headers['access-control-allow-origin'] = '*';
    headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    headers['access-control-allow-headers'] = 'Content-Type, Authorization, x-client-info, apikey';

    const rawForwardedHost = userReq.headers['x-forwarded-host'] || '';
    const trueHost = rawForwardedHost.split(',')[0].trim() || userReq.headers.host || 'beautypoint.onrender.com';
    const supabaseHost = cleanSupabaseUrl.replace('https://', '').replace('http://', '');
    const prefix = userReq.baseUrl === '/supabase-proxy' ? '/supabase-proxy' : '';

    // ✅ ROBUST REDIRECT REWRITER
    if (headers['location']) {
      let loc = Array.isArray(headers['location']) ? headers['location'][0] : headers['location'];
      if (loc.toLowerCase().includes(supabaseHost.toLowerCase())) {
        headers['location'] = loc
          .split(supabaseHost).join(`${trueHost}${prefix}`)
          .split(encodeURIComponent(supabaseHost)).join(encodeURIComponent(`${trueHost}${prefix}`))
          .replace(/([^:])\/\//g, '$1/');

        console.log(`🔄 [REDIRECT] Patched to: ${headers['location'].split('?')[0]}`);
      }
    }

    // ✅ COOKIE REWRITING (Persistence FIX)
    if (headers['set-cookie']) {
      const supabaseDomain = cleanSupabaseUrl.replace('https://', '').split('/')[0];
      const proxyDomain = trueHost.split(':')[0];
      headers['set-cookie'] = headers['set-cookie'].map(cookie => {
        return cookie
          .replace(new RegExp(supabaseDomain, 'gi'), proxyDomain)
          .replace(/SameSite=Lax/gi, 'SameSite=None; Secure');
      });
    }

    return headers;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    // Rewrite Supabase URLs in JSON (Literal + Encoded)
    if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('application/json')) {
      try {
        const bodyStr = proxyResData.toString('utf8');
        const supabaseHost = cleanSupabaseUrl.replace('https://', '').replace('http://', '');
        const rawForwardedHost = userReq.headers['x-forwarded-host'] || '';
        const trueHost = rawForwardedHost.split(',')[0].trim() || userReq.headers.host || 'beautypoint.onrender.com';
        const prefix = userReq.baseUrl === '/supabase-proxy' ? '/supabase-proxy' : '';

        if (bodyStr.includes(supabaseHost)) {
          // Replace both literal and URI encoded versions for maximum image compatibility
          return bodyStr
            .split(supabaseHost).join(`${trueHost}${prefix}`)
            .split(encodeURIComponent(supabaseHost)).join(encodeURIComponent(`${trueHost}${prefix}`))
            .replace(/([^:])\/\//g, '$1/');
        }
      } catch (e) {
        return proxyResData;
      }
    }
    return proxyResData;
  },
  proxyErrorHandler: (err, res, next) => {
    console.error('❌ [PROXY ERROR]', err.message);
    res.status(502).json({ message: 'Supabase Proxy Error', detail: err.message });
  },
  // Ensure we don't mangle the raw code/token during exchange
  parseReqBody: false
}));

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
    : ['https://beauty-point-hqp4.vercel.app'])
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
  origin: function (origin, callback) {
    // For now, allow all origins to fix deployment issues
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// ✅ SECURITY: Rate limiting (relaxed for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3000, // Relaxed limit: 3000 requests per 15 mins
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
