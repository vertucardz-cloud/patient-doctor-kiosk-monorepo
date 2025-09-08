import { readFileSync } from 'fs';
import { createServer, Server as HTTPServer } from 'https';
import { Server as HTTPSServer, RequestListener } from 'http';
import { Application } from 'express';

import { ENV, SSL, PORT } from '@config/environment.config';
import { Logger } from '@services/logger.service';

interface ServerOptions {
  credentials: {
    key: string | null;
    cert: string | null;
  };
  port: number;
}

/**
 * Server configuration
 */
export class ServerConfiguration {
  private static instance: ServerConfiguration;
  private options: ServerOptions;
  private server!: Application | HTTPServer;

  private constructor() {
    this.options = {
      credentials: {
        key: SSL.IS_ACTIVE ? readFileSync(SSL.KEY, 'utf8') : null,
        cert: SSL.IS_ACTIVE ? readFileSync(SSL.CERT, 'utf8') : null,
      },
      port: PORT,
    };
  }

  static get(): ServerConfiguration {
    if (!ServerConfiguration.instance) {
      ServerConfiguration.instance = new ServerConfiguration();
    }
    return ServerConfiguration.instance;
  }

  init(app: Application): ServerConfiguration {
    if (!this.server) {
      this.server = SSL.IS_ACTIVE
        ? createServer(
            this.options.credentials as Record<string, any>,
            app as RequestListener
          )
        : app;
    }
    return this;
  }

  listen(): HTTPServer | HTTPSServer {
    const port = SSL.IS_ACTIVE ? 443 : this.options.port;
    const protocol = SSL.IS_ACTIVE ? 'HTTPS' : 'HTTP';

    return this.server.listen(port, () => {
      Logger.log(
        'info',
        `${protocol} server is now running on port ${port} (${ENV})`
      );
    }) as HTTPServer | HTTPSServer;
  }
}

const Server = ServerConfiguration.get();
export { Server };
