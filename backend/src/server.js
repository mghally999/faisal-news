const env = require('./config/env');
const prisma = require('./config/prisma');
const buildApp = require('./app');
const logger = require('./utils/logger');

const app = buildApp();

const server = app.listen(env.PORT, () => {
  logger.ready(`backend on :${env.PORT}`);
});

const shutdown = async (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => logger.error('unhandledRejection', err));
process.on('uncaughtException', (err) => {
  logger.error('uncaughtException', err);
  shutdown('uncaughtException');
});
