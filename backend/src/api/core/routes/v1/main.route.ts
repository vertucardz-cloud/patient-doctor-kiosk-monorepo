import { Router } from '@classes';
import { MainController } from '@controllers/main.controller';

export class MainRouter extends Router {
  constructor() {
    super();
  }

  define(): void {
    this.router.route('/status').get(MainController.status);
    this.router.route('/seed').get(MainController.seed);
    this.router.route('/report-violation').post(MainController.report);
    this.router.route('/overview').get(MainController.overview);
  }
}
