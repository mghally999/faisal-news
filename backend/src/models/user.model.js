const prisma = require('../config/prisma');

const publicUser = (u) => (u ? { id: u.id, email: u.email, name: u.name, createdAt: u.createdAt } : null);

const findByEmail = (email) => prisma.user.findUnique({ where: { email } });

const findById = (id) => prisma.user.findUnique({ where: { id } });

const create = ({ email, passwordHash, name }) =>
  prisma.user.create({ data: { email, passwordHash, name: name || null } });

module.exports = { findByEmail, findById, create, publicUser };
