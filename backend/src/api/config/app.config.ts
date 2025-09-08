import express, { Application } from 'express';
import hpp from 'hpp';
import cors from 'cors';
import compression from 'compression';
import helmet, { HelmetOptions } from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Options as RateLimitOptions } from 'express-rate-limit';
import morgan from 'morgan';

import { notAcceptable } from '@hapi/boom';
import { ENVIRONMENT } from '@enums/environment.enum';
import { API_VERSION, AUTHORIZED, DOMAIN, ENV } from '@config/environment.config';
import { Authentication } from '@config/authentication.config';
import { LoggerConfiguration } from '@config/logger.config';
import { ProxyRouter } from '@services/proxy-router.service';
import { Cors as Kors } from '@middlewares/cors.middleware';
import { Resolve } from '@middlewares/resolve.middleware';
import { Catch } from '@middlewares/catch.middleware';
import { Sanitize } from '@middlewares/sanitize.middleware';
import { Cache } from '@middlewares/cache.middleware';

interface AppOptions {
  cors: Parameters<typeof cors>[0];
  helmet: HelmetOptions;
  rate: Partial<RateLimitOptions>;
}

export class ExpressConfiguration {
  private static instance: ExpressConfiguration;
  application!: Application;
  private options: AppOptions;

  private constructor() {
    this.options = {
      cors: {
        origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
          if (!origin || AUTHORIZED.includes(origin)) {
            callback(null, true);
          } else {
            callback(notAcceptable('Domain not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Accept', 'Content-Type', 'Authorization', 'Origin', 'From'],
      },
      helmet: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'", DOMAIN],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            sandbox: ['allow-forms', 'allow-scripts'],
            reportUri: '/report-violation',
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        },
        hidePoweredBy: true,
        noSniff: true,
        referrerPolicy: { policy: 'no-referrer' },
      },
      rate: {
        windowMs: 60 * 60 * 1000,
        max: 2500,
        message: 'Too many requests from this IP, please try again after an hour',
        statusCode: 429,
        standardHeaders: true,
        legacyHeaders: false,
      },
    };
  }

  static get(): ExpressConfiguration {
    if (!ExpressConfiguration.instance) {
      ExpressConfiguration.instance = new ExpressConfiguration();
    }
    return ExpressConfiguration.instance;
  }

  init(): ExpressConfiguration {
    if (!this.application) {
      this.application = express();
    }
    return this;
  }

  plug(): ExpressConfiguration {
    this.application.use(Kors.validate);
    this.application.use(express.urlencoded({ extended: false }));
    this.application.use(express.json());

    this.application.use(hpp({ checkBody: false }));
    this.application.use(compression());
    this.application.use(helmet(this.options.helmet));
    this.application.use(cors(this.options.cors));

    this.application.use(Authentication.initialize());
    Authentication.plug();

    // this.application.enable('trust proxy');

    // Optional logging
    this.application.use(LoggerConfiguration.writeStream());

    this.application.use(
      `/api/${API_VERSION}`,
      rateLimit(this.options.rate),
      Cache.read,
      ProxyRouter.map(),
      Sanitize.sanitize,
      Resolve.write
    );

    this.application.use(Catch.factory, Catch.log, Catch.exit, Catch.notFound);

    return this;
  }
}

const Application = ExpressConfiguration.get().init().plug().application;

export { Application };
