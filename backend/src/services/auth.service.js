const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const refreshModel = require('../models/refreshToken.model');
const tokenService = require('./token.service');
const { HttpError } = require('../middleware/error.middleware');

const BCRYPT_COST = 12;

const register = async ({ email, password, name }) => {
  const existing = await userModel.findByEmail(email);
  if (existing) throw new HttpError(409, 'EMAIL_TAKEN', 'Email already registered');
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const user = await userModel.create({ email, passwordHash, name });
  const session = await issueSession(user.id);
  return { user: userModel.publicUser(user), ...session };
};

const login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);
  if (!user) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  const session = await issueSession(user.id);
  return { user: userModel.publicUser(user), ...session };
};

const refresh = async (rawRefresh) => {
  if (!rawRefresh) throw new HttpError(401, 'NO_REFRESH', 'No refresh token');
  const tokenHash = tokenService.hashRefresh(rawRefresh);
  const stored = await refreshModel.findActive(tokenHash);
  if (!stored) throw new HttpError(401, 'INVALID_REFRESH', 'Refresh token invalid or expired');
  await refreshModel.revoke(stored.id);
  const session = await issueSession(stored.userId);
  return session;
};

const logout = async (rawRefresh) => {
  if (!rawRefresh) return;
  const tokenHash = tokenService.hashRefresh(rawRefresh);
  const stored = await refreshModel.findActive(tokenHash);
  if (stored) await refreshModel.revoke(stored.id);
};

const issueSession = async (userId) => {
  const accessToken = tokenService.signAccessToken(userId);
  const { raw, tokenHash, expiresAt } = tokenService.generateRefreshToken();
  await refreshModel.create({ userId, tokenHash, expiresAt });
  return { accessToken, refreshToken: raw, refreshExpiresAt: expiresAt };
};

const getMe = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpError(404, 'NOT_FOUND', 'User not found');
  return userModel.publicUser(user);
};

module.exports = { register, login, refresh, logout, getMe };
