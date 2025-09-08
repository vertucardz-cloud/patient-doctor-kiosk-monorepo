import { Axios } from './axios.service';
import { WHATS_APP } from '@config/environment.config';

type ComponentType = "header" | "body" | "footer" | "button";
type WhatsAppMessageType = "text" | "audio" | "video" | "document" | "image" | "location" | "contact";

type TextParameter = {
  type: "text";
  text: string;
};

type ImageParameter = {
  type: "image";
  image: {
    link: string;
  };
};

type HeaderComponent = {
  type: "header";
  parameters: (ImageParameter | TextParameter)[];
};

type BodyComponent = {
  type: "body";
  parameters: TextParameter[];
};

type FooterComponent = {
  type: "footer";
  text: string;
};

type ButtonComponent = {
  type: "button";
  sub_type: string;
  index: string;
  parameters: TextParameter[];
};

export type TemplateComponent =
  | HeaderComponent
  | BodyComponent
  | FooterComponent
  | ButtonComponent;

interface TemplatePayload {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  template: {
    name: string;
    language: { code: string };
    components?: TemplateComponent[];
  };
}


class WhatsAppService {
  private options = {
    whatsappNumber: WHATS_APP.NUMBER,
    channelNumber: '91' + WHATS_APP.NUMBER.trim(),
    apiKey: WHATS_APP.API_KEY,
    apiUrl: WHATS_APP.API_URL,
    apiVersion: WHATS_APP.API_VERSION,
  };

  constructor() {
    Axios.createInstance('whatsapp', {
      baseURL: this.options.apiUrl,
      timeout: 10000,
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
    });
    Axios.setAuthToken('whatsapp', this.options.apiKey);
  }

  async sendMessage(to: string, type: WhatsAppMessageType, content: any): Promise<any> {
    if (!to || !type || !content) {
      throw new Error('Recipient, type, and content are required');
    }

    const typeEndpointMap: Record<WhatsAppMessageType, string> = {
      text: 'send-text',
      audio: 'send-audio',
      video: 'send-video',
      document: 'send-document',
      image: 'send-image',
      location: 'send-location',
      contact: 'send-contact'
    };

    const endpoint = typeEndpointMap[type];
    if (!endpoint) {
      throw new Error(`Unsupported message type: ${type}`);
    }

    const url = `api/${this.options.apiVersion}/messages/${endpoint}/${this.options.channelNumber}`;

    const subBody = {
      ...(content.url ? { link: content.url } : {}),
      ...(content.caption ? { caption: content.caption } : {}),
      ...(content.location
        ? {
          latitude: content.location.latitude,
          longitude: content.location.longitude,
          name: content.location.name,
          address: content.location.address,
        }
        : {}),
      ...(content.text
        ? {
          preview_url: content.preview_url,
          body: content.text,
        }
        : {}),
    };
    const body: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type,
      [type]: subBody,
    };
    body[type] = content;

    const response = (await Axios.post('whatsapp', url, body)) as any;
    console.log('--------------------WhatsApp API response:----------------------------', response);
    return response?.data;
  }

  async sendTemplate(to: string, templateName: string, components: TemplateComponent[] | []): Promise<any> {
    try {

      const url = `api/${this.options.apiVersion}/messages/send-template/${this.options.channelNumber}`;

      const payload: TemplatePayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components,
        },
      };
      const response = (await Axios.post('whatsapp', url, payload)) as any;
      return response?.data || {};
    } catch (e) {
      console.error("---------------------Error sending WhatsApp template:----------------", e);
      return null;
    }
  }

  verifyWebhook(query: any) {
    const VERIFY_TOKEN = 'my_verify_token';
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
      return true;
    } else {
      return false;
    }
  }

  handleIncomingWebhook(data: any) {
    const message = data?.entityChange?.message || null;
    console.info('-----------------WhatsApp Incoming Message-------------------------', message);
    if (message) {
      const from = message.from;
      const to = message.to;
      const profileName = message.profile?.name || '';
      const messageType = message.type;
      const contentType = message[messageType]?.type || '';
      const text = message[messageType]?.text || '';
      // Handle different message types (text, image, video, etc.)
      switch (messageType) {
        case 'text':
          console.log(`Text message from ${from} to ${to}: ${text}`);
          // Process text message
          break;
        case 'image':
          const imageUrl = message.image?.link || '';
          console.log(`Image message from ${from} to ${to}: ${imageUrl}`);
          // Process image message
          break;
        case 'video':
          const videoUrl = message.video?.link || '';
          console.log(`Video message from ${from} to ${to}: ${videoUrl}`);
          // Process video message
          break;
        // Handle other message types similarly
        default:
          console.log(`Unsupported message type: ${messageType}`);
      }

      // Example: Send a template response back to the user
      // this.sendTemplate(from, content);
    }
  }
}

export const whatsappService = new WhatsAppService();
