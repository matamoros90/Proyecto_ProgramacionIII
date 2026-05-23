const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('../modules/auth/auth.routes');
const componentsRoutes = require('../modules/components/components.routes');
const compatibilityRoutes = require('../modules/compatibility/compatibility.routes');
const recommendationsRoutes = require('../modules/recommendations/recommendations.routes');
const buildsRoutes = require('../modules/builds/builds.routes');
const quotesRoutes = require('../modules/quotes/quotes.routes');
const ordersRoutes = require('../modules/orders/orders.routes');
const adminRoutes = require('../modules/admin/admin.routes');
const tutorialsRoutes = require('../modules/tutorials/tutorials.routes');
const { errorHandler } = require('../middleware/error.middleware');

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8081', 'http://localhost:19006'];

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas solicitudes, intenta de nuevo en 15 minutos' },
});

// Límite estricto solo para registro — evita creación masiva de cuentas
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Demasiados intentos de autenticación' },
});

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: (_origin, callback) => {
      if (!_origin || ALLOWED_ORIGINS.includes(_origin)) return callback(null, true);
      callback(new Error(`Origen no permitido por CORS: ${_origin}`));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use(globalLimiter);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', app: 'ZonaPc Builder API', version: '1.0.0' });
  });

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/components', componentsRoutes);
  app.use('/api/compatibility', compatibilityRoutes);
  app.use('/api/recommendations', recommendationsRoutes);
  app.use('/api/builds', buildsRoutes);
  app.use('/api/quotes', quotesRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/tutorials', tutorialsRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
