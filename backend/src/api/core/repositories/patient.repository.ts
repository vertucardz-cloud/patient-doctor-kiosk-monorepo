import { BaseRepository } from '@repositories/base.repository';
import { Case, Patient, Prisma as PrismaClient, TreatmentPlan } from '@prisma/client';
import { Prisma } from '@services/prisma.service';
import { badRequest, conflict, notFound, unauthorized, badImplementation, internal } from '@hapi/boom';
import { whatsappService, TemplateComponent } from '@services/whatsapp.service';
import { extractFranchiseId } from '@utils/extractUuid.util';
import { FranchiseRepository } from '@repositories/franchise.repository';
import { FRONTEND_BASE_URL, TEMPLATE_IMAGE_URL, TEMPLATE_NAME } from '@config/environment.config';

type WhatsAppMessageType = 'text' | 'audio' | 'video' | 'document' | 'image' | 'location' | 'contacts' | 'unsupported';
type WhatsAppContentType = 'ATTACHMENT' | 'location' | 'text' | 'contacts' | 'unsupported';
interface MediaParameter {
  type: "image" | "video" | "document" | "audio";
  image?: { link: string };
  video?: { link: string };
  document?: { link: string; filename?: string };
  audio?: { link: string };
}
interface IWhatsAppWebhookPayload {
  channel: "WABA" | string;
  appDetails: {
    type: "LIVE" | "SANDBOX" | string;
  };
  recipient: Record<string, unknown>;
  events: {
    eventType: string;
    timestamp: string;
    date: string;
  };
  eventContent: {
    message: {
      from: string;
      id: string;
      text: {
        body: string;
      };
      to: string;
      contentType: WhatsAppContentType;
      messageType: WhatsAppMessageType;
      profileName: string;
    };
  };
  aCode: string;
}

interface IPatientFilter {
  firstname?: string;
  lastname?: string;
  fullname?: string;
  email?: string;
  phone?: string;
  ageMin?: number;
  ageMax?: number;
  franchiseId?: string;
  isActive?: boolean;
  includeFranchise?: boolean;
  createdAtStart?: string | Date;
  createdAtEnd?: string | Date;
}
interface IListOptions {
  page?: number;
  limit?: number;
  sort?: { name: string; order: 'asc' | 'desc' };
  filter?: IPatientFilter;
}

interface PatientCase {
  id: string;
  description: string;
  status: "Completed" | "Ongoing" | "Pending";
  date: string | Date; // ISO date format (YYYY-MM-DD)
  cost: number;
}

interface MedicalHistory {
  id: string;
  condition: string;
  treatment: string;
  date: string; // ISO date format
}

export interface IPatient {
  id: string;
  firstname: string;
  lastname: string;
  fullname: string;
  age: number;
  franchiseId: string;
  gender: string;
  dob: string;
  address: string;
  email: string;
  phone: string;
  status: string;
  updatedAt: string | Date;
  createdAt: string | Date;
  cases: PatientCase[];
  medicalHistory: MedicalHistory[];
}


class PatientRepository extends BaseRepository<Patient, string> {
  constructor() {
    super();
  }

  protected get model() {
    return this.prisma.patient;
  }

  private extractFranchiseAndLocation(text: string): { franchiseId: string | null; location: string | null } {

    const locationRegex = /Location:\s*([\w\s]+)/i;

    const locationMatch = text.match(locationRegex);

    const franchiseId = extractFranchiseId(text);
    const location = locationMatch ? locationMatch[1].trim() : null;

    return { franchiseId, location };
  }

  async handleIncomingWebhook(data: IWhatsAppWebhookPayload): Promise<void> {
    try {

      const message = data?.eventContent?.message || null;

      if (message) {
        const from = message.from;
        const to = message.to;
        const profileName = message.profileName || '';
        const messageType: WhatsAppMessageType = message.messageType;
        const contentType: WhatsAppContentType = message.contentType;
        const text = message.text ? message.text : '';
        // Handle different message types (text, image, video, etc.)
        // switch (messageType) {
        //   case 'text':
        //     console.log(`Text message from ${from} to ${to}: ${text}`);
        //     // Process text message
        //     break;
        //   case 'image':
        //     const imageUrl = message.image?.link || '';
        //     console.log(`Image message from ${from} to ${to}: ${imageUrl}`);
        //     // Process image message
        //     break;
        //   case 'video':
        //     const videoUrl = message.video?.link || '';
        //     console.log(`Video message from ${from} to ${to}: ${videoUrl}`);
        //     // Process video message
        //     break;
        //   // Handle other message types similarly
        //   default:
        //     console.log(`Unsupported message type: ${messageType}`);
        // }

        const existPatient = await this.findByPhone(from);

        //* If patient does not exist, create a new patient record
        if (!existPatient) {
          const { franchiseId, location } = this.extractFranchiseAndLocation(message.text.body);
          if (franchiseId) {
            const existFranchise = await FranchiseRepository.findById(franchiseId as string);
            if (existFranchise) {
              const newPatient = {
                phone: from,
                firstname: profileName || 'Unknown',
                lastname: '',
                email: '',
                age: 0,
                franchiseId,
              }
              const patienInfo = await this.createPatient(newPatient);
              if (patienInfo) {
                //* Send a template response back to the user
                const templateName = TEMPLATE_NAME
                const templateUrl = TEMPLATE_IMAGE_URL
                const landingPageUrl = `${FRONTEND_BASE_URL}/patient/update-info/${patienInfo?.newPatient?.id}/${patienInfo?.newCase?.id}`;
                console.log('----------------------landingPageUrl---------------------------', landingPageUrl);
                const components = [
                  {
                    type: "header",
                    parameters: [
                      {
                        type: "image",
                        image: {
                          link: templateUrl
                        }
                      }
                    ]
                  } as TemplateComponent,
                  {
                    type: "button",
                    parameters: [
                      {
                        type: "text",
                        text: landingPageUrl
                      }
                    ],
                    sub_type: "url",
                    index: "0"
                  } as TemplateComponent
                ]
                await whatsappService.sendTemplate(from, templateName, components);
              }
            }
          }
        }

        //* Save the message to the database if patient exists
        if (existPatient) {
          const caseExists = await Prisma.client.case.findFirst({ where: { franchiseId: existPatient.franchiseId } });

          const newMessage = {
            id: message.id,
            from,
            to,
            profileName,
            contentType,
            messageType,
            text,
            patientId: existPatient.id,
            franchiseId: existPatient.franchiseId,
            caseId: caseExists?.id || null,
            location: '',
          }
          await this.saveMessage(newMessage)
        }
      }

    } catch (e) {
      console.error('-----------------Webhook Data Error-------------------------', e);
    }
  }

  async patientList1(options: IListOptions): Promise<{ items: Patient[]; total: number }> {
    const { page = 1, limit = 10, sort = { name: "createdAt", order: "desc" }, filter = {} } = options;
    const skip = (page - 1) * limit;

    const where: PrismaClient.PatientWhereInput = {};

    const or: PrismaClient.PatientWhereInput[] = [];

    if (filter.firstname && filter.firstname.trim() !== "") {
      or.push({ firstname: { contains: filter.firstname, mode: 'insensitive' } });
    }
    if (filter.lastname && filter.lastname.trim() !== "") {
      or.push({ lastname: { contains: filter.lastname, mode: 'insensitive' } });
    }
    if (filter.fullname && filter.fullname.trim() !== "") {
      or.push({ fullname: { contains: filter.fullname, mode: 'insensitive' } });
    }
    if (filter.email && filter.email.trim() !== "") {
      or.push({ email: { contains: filter.email, mode: 'insensitive' } });
    }
    if (filter.phone && filter.phone.trim() !== "") {
      or.push({ phone: { contains: filter.phone, mode: 'insensitive' } });
    }

    if (or.length > 0) {
      where.OR = or;
    }

    // Age filtering
    if ((filter.ageMin && filter.ageMin > 0) || (filter.ageMax && filter.ageMax > 0)) {
      where.AND = [];
      if (filter.ageMin && filter.ageMin > 0) {
        where.AND.push({ age: { gte: filter.ageMin } });
      }
      if (filter.ageMax && filter.ageMax > 0) {
        where.AND.push({ age: { lte: filter.ageMax } });
      }
    }

    // Franchise filter
    if (filter.franchiseId && filter.franchiseId.trim() !== "") {
      where.franchiseId = filter.franchiseId;
    }

    console.log('-----------------Patient List Filter-------------------------', where);

    const [items, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort.name]: sort.order },
      }),
      this.model.count({ where }),
    ]);

    return { items, total };
  }

  async patientList(options: IListOptions): Promise<{
    result: Patient[];
    total: number
    page: number,
    limit: number,
    totalPages: number
  }> {
    const { page = 1, limit = 10, sort = { name: "createdAt", order: "desc" }, filter = {} } = options;


    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const skip = (validatedPage - 1) * validatedLimit;

    const where: PrismaClient.PatientWhereInput = {};


    const orConditions: PrismaClient.PatientWhereInput[] = [];

    if (filter.firstname?.trim()) {
      orConditions.push({ firstname: { contains: filter.firstname.trim(), mode: 'insensitive' } });
    }
    if (filter.lastname?.trim()) {
      orConditions.push({ lastname: { contains: filter.lastname.trim(), mode: 'insensitive' } });
    }
    if (filter.fullname?.trim()) {
      orConditions.push({ fullname: { contains: filter.fullname.trim(), mode: 'insensitive' } });
    }
    if (filter.email?.trim()) {
      orConditions.push({ email: { contains: filter.email.trim(), mode: 'insensitive' } });
    }
    if (filter.phone?.trim()) {
      orConditions.push({ phone: { contains: filter.phone.trim(), mode: 'insensitive' } });
    }

    // Add OR conditions to where clause if any exist
    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    // Age filtering with AND logic
    const ageConditions: PrismaClient.PatientWhereInput[] = [];

    if (filter.ageMin && filter.ageMin > 0) {
      ageConditions.push({ age: { gte: filter.ageMin } });
    }
    if (filter.ageMax && filter.ageMax > 0) {
      ageConditions.push({ age: { lte: filter.ageMax } });
    }

    // Add age conditions to where clause if any exist
    if (ageConditions.length > 0) {
      where.AND = Array.isArray(where.AND) ? [...where.AND, ...ageConditions] : [...ageConditions];
    }

    // Franchise filter
    if (filter.franchiseId?.trim()) {
      where.franchiseId = filter.franchiseId.trim();
    }

    // CreatedAt date range filtering
    const dateConditions: PrismaClient.PatientWhereInput[] = [];

    if (filter.createdAtStart) {
      const startDate = new Date(filter.createdAtStart);
      startDate.setHours(0, 0, 0, 0); // Start of day
      dateConditions.push({ createdAt: { gte: startDate } });
    }

    if (filter.createdAtEnd) {
      const endDate = new Date(filter.createdAtEnd);
      endDate.setHours(23, 59, 59, 999); // End of day
      dateConditions.push({ createdAt: { lte: endDate } });
    }

    // Add date conditions to where clause if any exist
    if (dateConditions.length > 0) {
      where.AND = Array.isArray(where.AND) ? [...where.AND, ...dateConditions] : dateConditions;
    }

    // Handle other potential filters
    if (filter.isActive !== undefined) {
      // where.isActive = filter.isActive;
    }

    try {
      const [items, total] = await Promise.all([
        this.model.findMany({
          where,
          skip,
          take: validatedLimit,
          orderBy: { [sort.name]: sort.order },
          include: {
            franchise: filter.includeFranchise || false,
          }
        }),
        this.model.count({ where }),
      ]);

      return {
        result: items,
        total,
        page: validatedPage,
        limit: validatedLimit,
        totalPages: Math.ceil(total / validatedLimit)
      };
    } catch (error) {
      console.error('-------------------Error fetching patient list:---------------', error);
      throw internal('Interal Server Error');
    }
  }

  async createPatient(data: Record<string, any>, isAPI = false): Promise<{ newPatient: Patient, newCase: Case } | null> {
    try {
      data.fullname = data.firstNname + ' ' + data.lastName;
      data.createdAt = new Date();
      data.updatedAt = new Date();

      if (isAPI) {
        const existPhone = await this.findByPhone(data.phone);

        if (existPhone) {
          throw conflict('Contact number already exist');
        }
      }

      const newPatient = await this.model.create({ data: data as Patient });
      const existQr = await Prisma.client.qRCode.findFirst({ where: { franchiseId: data.franchiseId } });

      if (existQr) {
        const newData: Partial<Case> = {
          qrCodeId: existQr.id,
          franchiseId: data.franchiseId,
          patientId: newPatient.id,
          description: "",
          status: "NEW",
          doctorNotes: "",
          medicationCost: 0,
          followUpDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const newCase = await this.createCase(newData);
        if (newCase) {
          return { newPatient, newCase };
        }
      }

      return null;

    } catch (e) {
      console.error('-----------------Created Patient- Error------------------------', e);
      return null
    }
  }

  async getPatientDetails1(patientId: string): Promise<Patient | null> {
    try {
      if (!patientId) {
        throw badRequest('Patient ID is required');
      }
      const patient = await this.model.findUnique({
        where: { id: patientId },
        include: {
          cases: true,
        },
      });
      if (!patient) {
        throw notFound('Patient not found');
      }
      return patient;
    } catch (error) {
      console.error('Error getting patient details:', error);
      return null
    }
  }

 async getPatientDetails(patientId: string): Promise<Record<string, any> | null> {
  try {
    if (!patientId) {
      throw badRequest("Patient ID is required");
    }

    const patient = await this.model.findUnique({
      where: { id: patientId },
      include: {
        cases: {
          include: {
            treatmentPlan: {
              include: {
                payments: true,
              },
            },
          },
        },
        messages: true,
        medicalHistory: true,
      },
    });

    if (!patient) {
      throw notFound("Patient not found");
    }

    // If you want to recompute fullname dynamically
    const fullPatient = {
      ...patient,
      fullname: `${patient.firstname} ${patient.lastname}`,
    };

    return fullPatient;
  } catch (error) {
    console.error("Error getting patient details:", error);
    return null;
  }
}


  async findByPhone(phone: string): Promise<Patient | null> {
    try {
      if (!phone) {
        return null;
      }
      const patient = await this.model.findFirst({ where: { phone } });
      return patient;
    } catch (error) {
      console.error('Error finding patient by phone:', error);
      return null
    }
  }

  async createCase(data: Partial<Case>): Promise<Case | null> {
    try {
      if (data.franchiseId && data.patientId && data.qrCodeId) {
        const newCase = await Prisma.client.case.create({
          data: {
            qrCodeId: data.qrCodeId,
            franchiseId: data.franchiseId,
            patientId: data.patientId,
            description: data.description ?? "",
            status: data.status ?? "NEW",
            doctorNotes: data.doctorNotes ?? "",
            medicationCost: data.medicationCost ?? 0,
            followUpDate: data.followUpDate ?? null,
            createdAt: data.createdAt ?? new Date(),
            updatedAt: data.updatedAt ?? new Date(),
          },
        });
        return newCase;
      }
      return null;
    } catch (error) {
      console.error("Error creating case:", error);
      return null;
    }
  }


  async updatePatientAndCase(patientId: string, data: Record<string, any>): Promise<{ patient: Patient; case: Case } | null> {
    try {

      const { caseId, ...updatedData } = data;

      if (!patientId || !caseId) {
        return null;
      }
      const patient = await this.model.findFirst({ where: { id: patientId } });
      if (!patient) {
        throw notFound('Patient not Found');
      }

      let patientData: Partial<Patient> = {};
      const caseData: Partial<Case> = {};

      if (updatedData.description) {
        caseData.description = updatedData.description;
        caseData.updatedAt = new Date();
      }

      delete updatedData.description;
      const fullname = `${updatedData.firstname || ''} ${updatedData.lastname || ''}`.trim();
      if (fullname) {
        updatedData.fullname = fullname;
      }
      patientData = { ...updatedData, updatedAt: new Date() };

      const [updatedPatient, updatedCase] = await Prisma.client.$transaction([
        Prisma.client.patient.update({
          where: { id: patientId },
          data: { ...patientData, updatedAt: new Date() },
        }),
        Prisma.client.case.update({
          where: { id: caseId },
          data: { ...caseData, updatedAt: new Date() },
        }),
      ]);
      const templateName = 'doctor_1'
      const components: [] = []

      const template = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": "{{Recipient-Phone-Number}}",
        "type": "template",
        "template": {
          "name": "doctor_1",
          "language": {
            "code": "en"
          },
          "components": []
        }
      }
      await whatsappService.sendTemplate(patient.phone, templateName, components);
      return { patient: updatedPatient, case: updatedCase };
    } catch (error) {
      console.error("Error updating patient and case:", error);
      return null;
    }
  }


  async updatePatient(patientId: string, data: Partial<Patient>): Promise<Patient | null> {
    try {
      const updatedPatient = await this.model.update({
        where: { id: patientId },
        data: { ...data, updatedAt: new Date() },
      });
      return updatedPatient;
    } catch (error) {
      console.error('Error updating patient:', error);
      return null;
    }
  }

  async saveMessage(message: any) {
    try {
      const exampleMessage = {
        "messageId": "msg-001-xyz",
        "from": "userA@demo.com",
        "to": "support@clinic.com",
        "profileName": "John Doe",
        "contentType": "text/plain",
        "messageType": "INCOMING",
        "body": "Hello, I have an issue at Franchise ID: 673cb525-b0d9-4792-bb86-8c3a06eb143a, Location: Neharu Nager near Atal dwar Indore, Indore, Madhya Pradesh, 452011, India.",
        "franchiseId": "673cb525-b0d9-4792-bb86-8c3a06eb143a",
        "patientId": "f15edbea-42c7-4f6c-b781-b9f4cf58d4f0",
        "caseId": "a3a7c5f3-6713-4a0e-91b7-01948c021db4",
        "location": "Neharu Nager near Atal dwar Indore, Indore, Madhya Pradesh, India"
      }

      const { franchiseId, location } = this.extractFranchiseAndLocation(message.text.body);

      const createdMessage = await Prisma.client.message.create({
        data: {
          messageId: message.id,
          from: message.from,
          to: message.to,
          profileName: message.profileName,
          contentType: message.contentType,
          messageType: message.messageType,
          body: message.text.body,
          franchiseId,
          patientId: message.patientId || null,
          caseId: message.caseId || null,
          location,
        },
      });

      return createdMessage;

    } catch (error) {
      console.error('Error saving message:', error);
      throw badImplementation('Failed to save message');
    }
  }


  async assignDoctor(patientId: string, caseId: string, doctorId: string): Promise<Case> {
    const existPatient = await this.findById(patientId);
    if (!existPatient) {
      throw notFound('Patient not found');
    }

    const existCase = await Prisma.client.case.findUnique({ where: { id: caseId } });
    if (!existCase) {
      throw notFound('Case not found');
    }

    const updatedCase = await Prisma.client.case.update({
      where: { id: caseId },
      data: { doctorId, updatedAt: new Date() },
    });

    return updatedCase;
  }

  async addTreatmentPlan1(patiientId: string, caseId: string, treatmentPlan: Partial<TreatmentPlan>): Promise<Case> {
    const existPatient = await this.findById(patiientId);
    if (!existPatient) {
      throw notFound('Patient not found');
    }

    const existCase = await Prisma.client.case.findUnique({ where: { id: caseId } });
    if (!existCase) {
      throw notFound('Case not found');
    }

    // const updatedCase = await Prisma.client.case.update({
    //   where: { id: caseId },
    //   data: { treatmentPlan, updatedAt: new Date() },
    // });

    // return updatedCase;
    return existCase;
  }

  async addTreatmentPlan(patientId: string, caseId: string, treatmentPlan: Omit<Partial<TreatmentPlan>, "id" | "caseId">): Promise<Case> {

    const existPatient = await this.findById(patientId);
    if (!existPatient) {
      throw notFound("Patient not found");
    }


    const existCase = await Prisma.client.case.findUnique({
      where: { id: caseId },
    });
    if (!existCase) {
      throw notFound("Case not found");
    }


    if (!treatmentPlan?.doctorId) {
      throw badRequest("doctorId is required to create a treatment plan");
    }


    await Prisma.client.treatmentPlan.create({
      data: {
        summary: treatmentPlan.summary ?? "",
        medication: treatmentPlan.medication ?? null,
        estimatedCost: treatmentPlan.estimatedCost ?? 0,
        status: treatmentPlan.status ?? "PLANNED",
        doctor: { connect: { id: treatmentPlan.doctorId } },
        case: { connect: { id: caseId } },
      },
    });


    const updatedCase = await Prisma.client.case.findUnique({
      where: { id: caseId },
      include: { treatmentPlan: true },
    });

    if (!updatedCase) {
      throw notFound("Case not found after treatment plan creation");
    }

    return updatedCase;
  }

}

const patientRepository = new PatientRepository();
export { patientRepository as PatientRepository };
