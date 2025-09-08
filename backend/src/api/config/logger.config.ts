import { createWriteStream } from 'fs';
import morgan, { StreamOptions } from 'morgan';
import winston, { format, Logger as WinstonLogger, transports } from 'winston';
import { Request, Response } from 'express'; // Import Express types
import { ENV, LOGS } from '@config/environment.config';
import { ENVIRONMENT } from '@enums';

type MorganRequestHandler = ReturnType<typeof morgan>;

class LoggerConfiguration {
  private static instance: LoggerConfiguration;
  logger!: WinstonLogger;

  private stream: StreamOptions = {
    write: (message: string) => {
      this.logger.info(message.substring(0, message.lastIndexOf('\n')));
    },
  };

  private formatter = format.printf(({ level, message, timestamp }) => {
    return `${timestamp as string} [${level}] ${message as string}`;
  });

  private options = {
    error: {
      level: 'error',
      format: format.combine(format.timestamp(), this.formatter),
      filename: `${LOGS.PATH}/error.log`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880,
      maxFiles: 5,
      colorize: false,
    },
    info: {
      level: 'info',
      format: format.combine(format.timestamp(), this.formatter),
      filename: `${LOGS.PATH}/combined.log`,
      handleExceptions: false,
      json: true,
      maxsize: 5242880,
      maxFiles: 5,
      colorize: false,
    },
    console: {
      format: format.simple(),
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
  };

  private constructor() {}

  static get(): LoggerConfiguration {
    if (!LoggerConfiguration.instance) {
      LoggerConfiguration.instance = new LoggerConfiguration();
    }
    return LoggerConfiguration.instance;
  }

  init(): LoggerConfiguration {
    if (LoggerConfiguration.instance && this.logger) {
      return this;
    }

    this.logger = winston.createLogger({
      level: 'info',
      transports: [
        new transports.File(this.options.error),
        new transports.File(this.options.info),
      ],
      exitOnError: false,
    });

    if (!['production', 'test'].includes(ENV)) {
      this.logger.add(new transports.Console(this.options.console));
    }

    return this;
  }

  writeStream(): MorganRequestHandler {
    return morgan(LOGS.TOKEN, {
      stream:
        ENV === ENVIRONMENT.production
          ? createWriteStream(`${LOGS.PATH}/access.log`, { flags: 'a+' })
          : this.stream,
    });
  }
}

const config = LoggerConfiguration.get().init();
export { config as LoggerConfiguration };
