import { Prisma } from '@services/prisma.service';
import { QRCode, Franchise } from '@prisma/client';
import { notFound,conflict, badImplementation } from '@hapi/boom';
import { BaseRepository } from './base.repository';
import { FranchiseRepository } from './franchise.repository';
import { generateQRCodeData } from '@utils/helper.util';
import { generateQRImage } from '@utils/qr.util';
import { formatFullAddress } from '@utils/location.util';
import { WHATS_APP } from '@config/environment.config';

class QrcodeRepository extends BaseRepository<QRCode, string> {
  protected get model() {
    return this.prisma.qRCode;
  }

  async createQrCode(franchiseId: string) {
    try {
      
      const franchise = await FranchiseRepository.findById(franchiseId);
      if (!franchise) {
        throw notFound('Franchise not found');
      }
  
      const existQrCode = await this.model.findFirst({where: {franchiseId}});
      if(existQrCode) throw conflict(`QR code already exist for ${franchiseId} franchise`);
  
      const qrData = generateQRCodeData(franchiseId) as string;
      
      const location = formatFullAddress(franchise) || '';
      
      const qrImageUrl = await generateQRImage({ id: franchiseId, location });
      if(!qrImageUrl) badImplementation('Failed to generate QR code.')
  
      const whatsappLink =  `https://wa.me/${WHATS_APP.WHATSAPP_NUMBER}?text=QRCODE:${qrData}`;
  
      const qrCode = await this.model.create({
        data: {
          code: qrData,
          franchiseId,
          qrImageUrl,
          whatsappLink
        },
        include: { franchise: true },
      });
  
      if (!qrCode) {
        throw badImplementation('Failed to create QR code');
      }
  
      return {
        ...qrCode,
        qrImageUrl,
        whatsappLink
      };
    } catch (error) {
      throw badImplementation('Failed to create QR code');
    }
  }

  async deactivateQRCode(id: string): Promise<QRCode> {
    try {
      return await this.model.update({
        where: { id },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      throw new Error(`QRCode deactivate failed: ${error}`);
    }
  }

  async findById(id: string): Promise<QRCode> {
    try {
      const QRCode = await this.model.findUnique({ where: { id } });
      if (!QRCode) throw notFound('QRCode not found');
      return QRCode;
    } catch (error) {
      throw new Error(`QRCode findById failed: ${error}`);
    }
  }

  async getQRCodeByCode(code: string): Promise<QRCode> {
    try {
      const QRCode = await this.model.findUnique({ where: { code } });
      if (!QRCode) throw notFound('QRCode not found');
      return QRCode;
    } catch (error) {
      throw new Error(`QRCode findById failed: ${error}`);
    }
  }

  async findAll(): Promise<QRCode[]> {
    try {
      return await this.model.findMany({ where: { isActive: true } });
    } catch (error) {
      throw new Error(`QRCode findAll failed: ${error}`);
    }
  }
}

const qrcodeRepository = new QrcodeRepository();
export { qrcodeRepository as QrcodeRepository };
