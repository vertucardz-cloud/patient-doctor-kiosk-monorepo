import { Router } from '@classes';
import { QRCodeController } from '@controllers/qr.controller';
import { Guard } from '@middlewares/guard.middleware';
import { Validator } from '@middlewares/validator.middleware';
import { ROLE } from '@enums';
import {
  createQRCode,
  getAllQRCodes,
  getQRCodeById,
  getQRCodeByCode,
  updateQRCode,
  deactivateQRCode,
  list,
} from '@validations/qrcode.validation';

export class QrCodeRouter extends Router {
  constructor() {
    super();
  }

  define(): void {
    this.router
      .route('/')
      .post(Guard.authorize([ROLE.admin]), Validator.check(createQRCode), QRCodeController.createQRCode);
    this.router
      .route('/')
      .get(Guard.authorize([ROLE.admin]), Validator.check(getAllQRCodes), QRCodeController.getAllQRCodes);
    this.router
      .route('/:qrcodeId')
      .get(Guard.authorize([ROLE.admin]), Validator.check(getQRCodeById), QRCodeController.getQRCodeById);
    this.router
      .route('/code/:code')
      .get(Guard.authorize([ROLE.admin]), Validator.check(getQRCodeByCode), QRCodeController.getQRCodeByCode);
    this.router
      .route('/:qrcodeId')
      .put(Guard.authorize([ROLE.admin]), Validator.check(updateQRCode), QRCodeController.updateQRCode);
    this.router
      .route('/:qrcodeId')
      .delete(Guard.authorize([ROLE.admin]), Validator.check(deactivateQRCode), QRCodeController.deactivateQRCode);
  }
}
