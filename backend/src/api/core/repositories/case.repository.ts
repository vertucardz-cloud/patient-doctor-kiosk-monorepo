import { Franchise, Case } from '@prisma/client';
import { notFound, badImplementation } from '@hapi/boom';
import { Request, Response } from 'express';
import { BaseRepository } from './base.repository';
import { whatsappService } from '../services/whatsapp.service';
import { notifyDoctor, notifyPatient } from '../services/notification.service';
import { WHATS_APP } from '@config/environment.config';

class CaseRepository extends BaseRepository<Case, string> {
  protected get model() {
    return this.prisma.case;
  }

  async createCase(data: Record<string, any>): Promise<Case> {
    try {
      const {
        qrCodeId,
        description,
        patientId,
        doctorId,
        doctorNotes,
        treatmentPlan,
        medicationCost,
        followUpDate,
        mediaFiles,
      } = data;

      // Get QR code and franchise info
      const qrCode = await this.prisma.qRCode.findUnique({
        where: { id: qrCodeId },
        include: { franchise: true },
      });

      if (!qrCode) {
        throw notFound('QR code not found');
      }

      // Create the case (single create call)
      const newCase = await this.model.create({
        data: {
          qrCodeId,
          franchiseId: qrCode.franchiseId,
          patientId: patientId ?? null,
          doctorId: doctorId ?? null,
          description: description ?? null,
          status: 'NEW',
          doctorNotes: doctorNotes ?? null,
          treatmentPlan: treatmentPlan ?? null,
          medicationCost: medicationCost ?? null,
          followUpDate: followUpDate ?? null,
          medias: mediaFiles?.length
            ? {
                create: mediaFiles.map((file: any) => ({
                  kind: file.kind,
                  url: file.url,
                  mimeType: file.mimeType,
                })),
              }
            : undefined,
        },
        include: {
          medias: true,
          patient: true,
          assignedTo: true,
        },
      });

      // Send WhatsApp notification to support team
      await whatsappService.sendMessage(WHATS_APP.SUPPORT_TEAM_PHONE, 'text', {
        text: `New case created at ${qrCode.franchise.name}. Case ID: ${newCase.id}`,
        preview_url: false,
      });

      return newCase;
    } catch (error) {
      throw notFound('Failed to create case');
    }
  }

  async getCaseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const caseData = await this.model.findUnique({
        where: { id },
        // include: { qrCode: true, franchise: true },
      });

      if (!caseData) {
        throw notFound('Case not found');
      }

      return caseData;
    } catch (error) {
      throw notFound('Failed to get case');
    }
  }

  async getAllCases(query: Record<string, any>) {
    try {
      const { status } = query;
      const where = status ? { status: status as any } : {};

      const cases = await this.model.findMany({
        // where,
        // include: { qrCode: true, franchise: true },
        orderBy: { createdAt: 'desc' },
      });
      return cases;
    } catch (error) {
      throw notFound('Failed to get cases');
    }
  }

  async updateCase(caseId: string, data: Record<string, any>) {
    try {
      const caseData = await this.model.update({
        where: { id: caseId },
        data: data,
      });
      return caseData;
    } catch (error) {
      throw notFound('Failed to update case');
    }
  }

  async assignDoctor(caseId: string, data: Record<string, any>) {
    try {
      const { doctorId } = data;

      const caseData = await this.model.update({
        where: { id: caseId },
        data: {
          // status: 'DOCTOR_ASSIGNED',
          // doctor: { connect: { id: doctorId } },
        },
        // include: { doctor: true },
      });

      // Notify doctor
      // if (caseData.doctor) {
      //   await notifyDoctor(caseData.doctor.id, `You have been assigned to case ${caseData.id}`);
      // }

      return caseData;
    } catch (error) {
      throw notFound('Failed to assign doctor');
    }
  }

  async updateTreatmentPlan(caseId: string, data: Record<string, any>) {
    try {
      const { treatmentPlan, medicationCost } = data;

      const caseData = await this.model.update({
        where: { id: caseId },
        data: {
          // status: 'TREATMENT_PLANNED',
          // treatmentPlan,
          // medicationCost,
        },
      });

      // Notify support team
      await whatsappService.sendMessage(process.env.SUPPORT_TEAM_PHONE!, 'text', {
        text: `Treatment plan ready for case ${caseData.id}. Cost: ${medicationCost}`,
        preview_url: false,
      });

      return caseData;
    } catch (error) {
      throw notFound('Failed to update treatment plan');
    }
  }

  async approveCost(caseId: string) {
    try {
      const caseData = await this.model.update({
        where: { id: caseId },
        data: {
          // status: 'COST_APPROVED',s
        },
      });

      // Notify patient
      // if (caseData.patientPhone) {
      //   await notifyPatient(
      //     caseData.patientPhone,
      //     `Your treatment plan is ready. Total cost: ${caseData.medicationCost}. Please contact us for more details.`
      //   );
      // }

      return caseData;
    } catch (error) {
      throw notFound('Failed to approve cost');
    }
  }

  async completeCase(caseId: string) {
    try {
      const caseData = await this.model.update({
        where: { id: caseId },
        data: {
          // status: 'COMPLETED',/
        },
      });

      return caseData;
    } catch (error) {
      throw notFound('Failed to complete case');
    }
  }
  async deactivateCase(caseId: string) {
    try {
      const caseData = await this.model.update({
        where: { id: caseId },
        data: {
          // status: 'DEACTIVE',
        },
      });

      return caseData;
    } catch (error) {
      throw notFound('Failed to complete case');
    }
  }
}

const caseRepository = new CaseRepository();
export { caseRepository as CaseRepository };
// import { Request, Response } from 'express';
// import { prisma } from '../app';
// import { CaseRepository } from '../repositories/case.repository';
// import { QRCodeRepository } from '../repositories/qrcode.repository';
// import { FranchiseRepository } from '../repositories/franchise.repository';
// import { WhatsAppService } from '../services/whatsapp.service';

// const caseRepository = new CaseRepository();
// const qrCodeRepository = new QRCodeRepository();
// const franchiseRepository = new FranchiseRepository();
// const whatsappService = new WhatsAppService();

// export const createCaseFromQR = async (req: Request, res: Response) => {
//   const { qrCodeId, description, mediaIds } = req.body;

//   try {
//     // Verify QR code exists and is active
//     const qrCode = await qrCodeRepository.findById(qrCodeId);
//     if (!qrCode || !qrCode.isActive) {
//       return res.status(404).json({ error: 'Invalid QR code' });
//     }

//     // Get franchise details
//     const franchise = await franchiseRepository.findById(qrCode.franchiseId);
//     if (!franchise) {
//       return res.status(404).json({ error: 'Franchise not found' });
//     }

//     // Create new case
//     const newCase = await caseRepository.create({
//       qrCodeId,
//       franchiseId: franchise.id,
//       description,
//       status: 'NEW',
//     });

//     // Associate media if provided
//     if (mediaIds && mediaIds.length > 0) {
//       await prisma.media.updateMany({
//         where: { id: { in: mediaIds } },
//         data: { caseId: newCase.id },
//       });
//     }

//     // Notify admin team via WhatsApp
//     await whatsappService.sendMessage(
//       'admin_whatsapp_number',
//       `New case created at ${franchise.name} (${franchise.city}). Case ID: ${newCase.id}`
//     );

//     res.status(201).json(newCase);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create case' });
//   }
// };

// export const assignCaseToDoctor = async (req: Request, res: Response) => {
//   const { caseId } = req.params;
//   const { doctorId } = req.body;

//   try {
//     const updatedCase = await caseRepository.update(caseId, {
//       doctorId,
//       status: 'DOCTOR_ASSIGNED',
//     });

//     if (!updatedCase) {
//       return res.status(404).json({ error: 'Case not found' });
//     }

//     res.json(updatedCase);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to assign case' });
//   }
// };

// export const submitTreatmentPlan = async (req: Request, res: Response) => {
//   const { caseId } = req.params;
//   const { treatmentPlan, medicationCost, notes } = req.body;

//   try {
//     const updatedCase = await caseRepository.update(caseId, {
//       treatmentPlan,
//       medicationCost,
//       doctorNotes: notes,
//       status: 'TREATMENT_PLANNED',
//     });

//     if (!updatedCase) {
//       return res.status(404).json({ error: 'Case not found' });
//     }

//     // Notify patient about treatment plan
//     if (updatedCase.patientId) {
//       const patient = await prisma.patient.findUnique({
//         where: { id: updatedCase.patientId },
//       });

//       if (patient) {
//         await whatsappService.sendMessage(
//           patient.phone,
//           `Your treatment plan is ready. Cost: ${medicationCost}. Please contact us for details.`
//         );
//       }
//     }

//     res.json(updatedCase);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to submit treatment plan' });
//   }
// };

// export const completeCase = async (req: Request, res: Response) => {
//   const { caseId } = req.params;

//   try {
//     const updatedCase = await caseRepository.update(caseId, {
//       status: 'COMPLETED',
//     });

//     if (!updatedCase) {
//       return res.status(404).json({ error: 'Case not found' });
//     }

//     res.json(updatedCase);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to complete case' });
//   }
// };
