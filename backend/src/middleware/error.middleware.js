const logger = require('../utils/logger');

const notFound = (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` } });
};

const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
  const message = status >= 500 ? 'Internal server error' : err.message || 'Request failed';
  if (status >= 500) logger.error(err);
  res.status(status).json({ error: { code, message } });
};

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = { notFound, errorHandler, HttpError };
