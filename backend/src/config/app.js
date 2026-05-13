const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', app: 'ZonaPc Builder API', version: '1.0.0' });
  });

  app.use('/api/auth', authRoutes);
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
