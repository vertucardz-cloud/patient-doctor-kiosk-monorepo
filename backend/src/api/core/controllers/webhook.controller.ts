import { Request } from 'express';
import { badRequest, notFound } from '@hapi/boom';
import { IResponse, IUserRequest } from '@interfaces';
import { Safe } from '@decorators/safe.decorator';
import { Axios } from '@services/axios.service';
import { PatientRepository } from '@repositories/patient.repository';
import { whatsappService } from '@services/whatsapp.service';

class WebhookController {
  private static instance: WebhookController;

  private constructor() { }

  static get(): WebhookController {
    if (!WebhookController.instance) {
      WebhookController.instance = new WebhookController();
    }
    return WebhookController.instance;
  }

  @Safe()
  async sendMessage(req: Request, res: IResponse): Promise<void> {
    const { to, message } = req.body;
    const response = await whatsappService.sendMessage(to, 'text', { text: message, preview_url: false });
    res.locals.data = response;
  }

  @Safe()
  async sendTempate(req: Request, res: IResponse): Promise<void> {
    const { to, templateName, components } = req.body;
    const result = await whatsappService.sendTemplate(to, templateName, components);
    res.locals.data = result;
  }

  @Safe()
  async verifyWhatsappToken(req: Request, res: IResponse): Promise<void> {
    const VERIFY_TOKEN = '<YOUR_VERIFY_TOKEN>';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // res.locals.data = challenge;
    } else {
      res.locals.data = {};
    }
  }

  @Safe()
  async receiveWhatsappMessage(req: Request, res: IResponse): Promise<void> {
    await PatientRepository.handleIncomingWebhook(req.body);
    res.locals.data = {};
  }
}

const webhookController = WebhookController.get();

export { webhookController as WebhookController };
