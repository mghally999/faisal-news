const prisma = require('../config/prisma');

const create = ({ userId, tokenHash, expiresAt }) =>
  prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });

const findActive = (tokenHash) =>
  prisma.refreshToken.findFirst({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } }
  });

const revoke = (id) =>
  prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });

const revokeAllForUser = (userId) =>
  prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });

module.exports = { create, findActive, revoke, revokeAllForUser };
