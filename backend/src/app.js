const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const { env } = require('./config/env');
const routes = require('./routes');
const openapi = require('./docs/openapi');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: env.clientOrigin === '*' ? true : env.clientOrigin.split(',').map((value) => value.trim()),
  credentials: true,
}));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buf) => {
    if (req.originalUrl.includes('/api/v1/payments/webhook')) {
      req.rawBody = buf;
    }
  },
}));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, {
  customSiteTitle: 'CampusHub API',
  swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
}));
app.get('/api/docs.json', (req, res) => {
  res.json(openapi);
});
app.use('/api/v1', routes);
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', errorCode: 'NOT_FOUND' });
});
app.use(errorHandler);

module.exports = app;
