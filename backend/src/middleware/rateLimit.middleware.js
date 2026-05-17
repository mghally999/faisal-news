const TokenBucket = require('../utils/tokenBucket');

const generalBucket = new TokenBucket({ capacity: 60, refillPerSecond: 1 });
const authBucket = new TokenBucket({ capacity: 5, refillPerSecond: 0.1 });

const clientKey = (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown';

const limit = (bucket) => (req, res, next) => {
  if (!bucket.tryConsume(clientKey(req))) {
    return res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
  }
  next();
};

module.exports = {
  generalLimiter: limit(generalBucket),
  authLimiter: limit(authBucket)
};
