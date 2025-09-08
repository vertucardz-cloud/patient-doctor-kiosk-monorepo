import { Request } from 'express';
import { badRequest, notFound } from '@hapi/boom';
import { IResponse, IUserRequest } from '@interfaces';
import { Safe } from '@decorators/safe.decorator';
import { QrcodeRepository } from '@repositories/qrcode.repository';

class QRCodeController {
  private static instance: QRCodeController;

  private constructor() {}

  static get(): QRCodeController {
    if (!QRCodeController.instance) {
      QRCodeController.instance = new QRCodeController();
    }
    return QRCodeController.instance;
  }

  @Safe()
  async createQRCode(req: Request, res: IResponse): Promise<void> {
    const qrcodeRepository = QrcodeRepository;
    const qr = await qrcodeRepository.createQrCode(req.body.franchiseId);
    res.locals.data = qr || {};
  }

  @Safe()
  async getAllQRCodes(req: Request, res: IResponse): Promise<void> {
    const qrcodeRepository = QrcodeRepository;
    const qrList = await qrcodeRepository.findAll();
    res.locals.data = qrList || [];
  }

  @Safe()
  async getQRCodeById(req: Request, res: IResponse): Promise<void> {
    const qrcodeRepository = QrcodeRepository;
    const qr = await qrcodeRepository.findById(req.params.qrcodeId);
    res.locals.data = qr || {};
  }

  @Safe()
  async getQRCodeByCode(req: Request, res: IResponse): Promise<void> {
    const qrcodeRepository = QrcodeRepository;
    const qr = await qrcodeRepository.getQRCodeByCode(req.params.qrCode);
    res.locals.data = qr || {};
  }

  @Safe()
  async updateQRCode(req: Request, res: IResponse): Promise<void> {
    const qrcodeRepository = QrcodeRepository;
    const qr = await qrcodeRepository.update(req.params.qrcodeId, req.body);
    res.locals.data = qr || {};
  }

  @Safe()
  async deactivateQRCode(req: Request, res: IResponse): Promise<void> {
    const qrcodeRepository = QrcodeRepository;
    const qr = await qrcodeRepository.deactivateQRCode(req.params.qrcodeId);
    res.locals.data = qr || {};
  }
}

const qrCodeController = QRCodeController.get();

export { qrCodeController as QRCodeController };
