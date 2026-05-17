const prisma = require('../config/prisma');

const listByUser = ({ userId, page, pageSize }) =>
  prisma.$transaction([
    prisma.savedArticle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.savedArticle.count({ where: { userId } })
  ]);

const findOwned = ({ userId, id }) =>
  prisma.savedArticle.findFirst({ where: { id, userId } });

const create = (data) => prisma.savedArticle.create({ data });

const updateNotes = ({ id, userId, notes }) =>
  prisma.savedArticle.updateMany({ where: { id, userId }, data: { notes } });

const remove = ({ id, userId }) =>
  prisma.savedArticle.deleteMany({ where: { id, userId } });

module.exports = { listByUser, findOwned, create, updateNotes, remove };
