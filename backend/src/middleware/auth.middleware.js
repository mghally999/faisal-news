const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { HttpError } = require('./error.middleware');

const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header'));
  }
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch {
    next(new HttpError(401, 'UNAUTHORIZED', 'Invalid or expired token'));
  }
};

module.exports = { requireAuth };
