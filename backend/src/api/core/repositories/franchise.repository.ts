import { Prisma } from '@services/prisma.service';
import { Franchise } from '@prisma/client';
import { notFound, conflict, badImplementation } from '@hapi/boom';
import { BaseRepository } from './base.repository';
import { QrcodeRepository } from './qrcode.repository';

class FranchiseRepository extends BaseRepository<Franchise, string> {
  protected get model() {
    return this.prisma.franchise;
  }
  async createFranchise(
    data: Partial<Franchise>
  ): Promise<{ franchise: Franchise; qrImageUrl: string; whatsappLink: string }> {
    const existFranchiseName = await this.findByName(data.name as string);
    if (existFranchiseName) throw conflict('Franchise name already exists');

    const existFranchiseEmail = await this.findByEmail(data.email as string);
    if (existFranchiseEmail) throw conflict('Franchise email already exists');

    const existFranchisePhone = await this.findByPhone(data.phone as string);
    if (existFranchisePhone) throw conflict('Franchise contact already exists');

    const franchise = await this.create(data);
    if (!franchise) throw badImplementation('Franchise creation failed');

    const qrCode = await QrcodeRepository.createQrCode(franchise.id);
    if (!qrCode) throw badImplementation('QR Code creation failed');

    return { franchise, qrImageUrl: qrCode.qrImageUrl, whatsappLink: qrCode.whatsappLink };
  }
  async deactivate(id: string): Promise<Franchise> {
    try {
      return await this.model.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date()
        },
        include: { qrCodes: true }
      });
    } catch (error) {
      throw new Error(`Franchise deactivate failed: ${error}`);
    }
  }

  async findById(id: string): Promise<Franchise> {
    try {
      const franchise = await this.model.findUnique({ where: { id } , include: { qrCodes: true }});
      if (!franchise) throw notFound('Franchise not found');
      return franchise;
    } catch (error) {
      throw notFound('Franchise not found');
    }
  }

  async findByName(name: string): Promise<Franchise | null> {
    try {
      return await this.model.findFirst({ where: { name } , include: { qrCodes: true }});
    } catch (error) {
      throw new Error(`Franchise findByName failed: ${error}`);
    }
  }
  async findByPhone(phone: string): Promise<Franchise | null> {
    try {
      return await this.model.findFirst({ where: { phone }, include: { qrCodes: true } });
    } catch (error) {
      throw new Error(`Franchise findByName failed: ${error}`);
    }
  }

  async findByEmail(email: string): Promise<Franchise | null> {
    try {
      return await this.model.findFirst({ where: { email } , include: { qrCodes: true }});
    } catch (error) {
      throw new Error(`Franchise findByEmail failed: ${error}`);
    }
  }

  async findAll(): Promise<Franchise[]> {
    try {
      return await this.model.findMany({ where: { isActive: true }, include: { qrCodes: true } });
    } catch (error) {
      throw new Error(`Franchise findAll failed: ${error}`);
    }
  }
}

const franchiseRepository = new FranchiseRepository();
export { franchiseRepository as FranchiseRepository };
