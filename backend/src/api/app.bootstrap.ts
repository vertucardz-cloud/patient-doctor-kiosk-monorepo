require('module-alias/register');

import { ENV } from './config/environment.config';
import { Logger } from '@services/logger.service';
import { Server } from './config/server.config';

import { Prisma } from '@services/prisma.service';

// Connect to database
Prisma.connect()
  .then(() => Logger.log('info', 'Connected to PostgreSQL via Prisma'))
  .catch((err) => Logger.log('error', `Connection error: ${err}`));

import { Application } from '@config/app.config';

const application = Application;
const server = Server.init(application).listen() as unknown;

process.on('uncaughtException', (err) => {
  Logger.log('error', `Uncaught Exception: ${err.message}`);
});
process.on('unhandledRejection', (reason, promise) => {
  Logger.log('error', `Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Cleanup on shutdown
process.on('SIGINT', async () => {
  await Prisma.disconnect();
  process.exit();
});

export { application, server };
