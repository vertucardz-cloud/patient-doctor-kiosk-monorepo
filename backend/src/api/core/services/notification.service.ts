import { whatsappService } from '@services/whatsapp.service';
import { Prisma } from '@services/prisma.service';
const prisma = Prisma.client;
export const notifyDoctor = async (doctorId: string, message: string) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new Error(`Doctor with ID ${doctorId} not found`);
    }

    if (doctor && doctor.phone) {
      await whatsappService.sendMessage(doctor.phone, 'text', { text: message, preview_url: false });
    }
  } catch (error) {
    console.error('Error notifying doctor:', error);
    throw error;
  }
};

export const notifyPatient = async (patientPhone: string, message: string) => {
  try {
    await whatsappService.sendMessage(patientPhone, 'text', { text: message, preview_url: false });
  } catch (error) {
    console.error('Error notifying patient:', error);
    throw error;
  }
};

export const notifySupportTeam = async (message: string) => {
  try {
    if (process.env.SUPPORT_TEAM_PHONE) {
      await whatsappService.sendMessage(process.env.SUPPORT_TEAM_PHONE, 'text', { text: message, preview_url: false });
    }
  } catch (error) {
    console.error('Error notifying support team:', error);
    throw error;
  }
};
