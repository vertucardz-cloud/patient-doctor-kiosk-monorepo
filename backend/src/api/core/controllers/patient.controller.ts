import { Request } from 'express';
import { badRequest, notFound } from '@hapi/boom';
import { IResponse, IUserRequest, ITokenOptions } from '@interfaces';
import { Patient } from '@prisma/client';
import { Safe } from '@decorators/safe.decorator';
import { EmailEmitter } from '@events';
import { PatientRepository } from '@repositories/patient.repository';

/**
 * Manage incoming requests from api/{version}/auth
 */
class PatientController {
  /**
   * @description
   */
  private static instance: PatientController;

  private constructor() { }

  /**
   * @description
   */
  static get(): PatientController {
    if (!PatientController.instance) {
      PatientController.instance = new PatientController();
    }
    return PatientController.instance;
  }

  /**
   * @description Creates and save new user
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
  */

  @Safe()
  async getPatients(req: Request, res: IResponse): Promise<void> {
    const repository = PatientRepository;
    const patient = await repository.patientList(req.body);
    res.locals.data = patient;
  }

  @Safe()
  async createPatient(req: Request, res: IResponse): Promise<void> {
    const repository = PatientRepository;
    const patient = await repository.createPatient(req.body as Partial<Patient>);
    res.locals.data = patient;
  }

  @Safe()
  async getPatient(req: Request, res: IResponse): Promise<void> {
    const repository = PatientRepository;
    const patient = await repository.getPatientDetails(req.params.patientId);
    res.locals.data = patient;
  }

  @Safe()
  async updatePatient(req: Request, res: IResponse): Promise<void> {
    const repository = PatientRepository;
    const patient = await repository.updatePatientAndCase(req.params.patientId, req.body);
    res.locals.data = patient;
  }

  @Safe()
  async deletePatient(req: Request, res: IResponse): Promise<void> {
    const repository = PatientRepository;
    const patient = await repository.findById(req.params.id);
    if (!patient) {
      throw notFound('Patient not found');
    }
    await repository.delete(req.params.id);
    res.locals.data = patient;
  }

  @Safe()
  async assignDoctor(req: Request, res: IResponse): Promise<void> {
    const repository = PatientRepository;
    const { patientId, caseId } = req.params;
    const { doctorId } = req.body;
    const updatedCase = await repository.assignDoctor(patientId, caseId, doctorId);
    res.locals.data = { case: updatedCase };
  }

  @Safe()
  async addTreatmentPlan(req: Request, res: IResponse): Promise<void> {
    const repository = PatientRepository;
    const { patientId, caseId } = req.params;
    const treatmentPlan = req.body;
    const updatedCase = await repository.addTreatmentPlan(patientId, caseId, treatmentPlan);
    res.locals.data = { case: updatedCase };
  }
}

const patientController = PatientController.get();

export { patientController as PatientController };
