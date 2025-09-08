import { Router } from '@classes';
import { WebhookController } from '@controllers/webhook.controller';
import { Guard } from '@middlewares/guard.middleware';
import { Validator } from '@middlewares/validator.middleware';
import { ROLE } from '@enums';

export class WebhookRouter extends Router {
  constructor() {
    super();
  }

  define(): void {
    this.router
      .route('/')
      .get(Guard.authorize([ROLE.admin]), WebhookController.verifyWhatsappToken)
      .post(WebhookController.receiveWhatsappMessage);
    this.router.route('/message').post(Guard.authorize([ROLE.admin]), WebhookController.sendMessage);
    this.router.route('/template').post(Guard.authorize([ROLE.admin]), WebhookController.sendTempate);
  }
}
