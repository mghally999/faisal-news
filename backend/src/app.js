const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const { generalLimiter } = require('./middleware/rateLimit.middleware');

const buildApp = () => {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
    })
  );
  app.use(express.json({ limit: '128kb' }));
  app.use(cookieParser());
  app.use(generalLimiter);

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = buildApp;
