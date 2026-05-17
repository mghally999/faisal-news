const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

const REFRESH_COOKIE = 'refresh_token';

const cookieOptions = (expiresAt) => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth',
  expires: expiresAt
});

const setRefreshCookie = (res, token, expiresAt) => {
  res.cookie(REFRESH_COOKIE, token, cookieOptions(expiresAt));
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions(new Date(0)), expires: undefined });
};

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken, refreshExpiresAt } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  res.status(201).json({ data: { user, accessToken } });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken, refreshExpiresAt } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  res.status(200).json({ data: { user, accessToken } });
});

const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies[REFRESH_COOKIE];
  const { accessToken, refreshToken, refreshExpiresAt } = await authService.refresh(raw);
  setRefreshCookie(res, refreshToken, refreshExpiresAt);
  res.status(200).json({ data: { accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  const raw = req.cookies[REFRESH_COOKIE];
  await authService.logout(raw);
  clearRefreshCookie(res);
  res.status(204).end();
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.status(200).json({ data: { user } });
});

module.exports = { register, login, refresh, logout, me };
