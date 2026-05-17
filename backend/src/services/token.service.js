const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_DAYS = 30;
const REFRESH_BYTES = 64;

const signAccessToken = (userId) =>
  jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL_SECONDS });

const generateRefreshToken = () => {
  const raw = crypto.randomBytes(REFRESH_BYTES).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  return { raw, tokenHash, expiresAt };
};

const hashRefresh = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

module.exports = {
  signAccessToken,
  generateRefreshToken,
  hashRefresh,
  ACCESS_TTL_SECONDS,
  REFRESH_TTL_DAYS
};
