import { Router } from '@classes';
import { PatientController } from '@controllers/patient.controller';
import { Guard } from '@middlewares/guard.middleware';
import { Validator } from '@middlewares/validator.middleware';
import {
  createPatient,
  getPatientById,
  getAllPatient,
  updatePatient,
  listPatients
} from '@validations/patient.validation'

export class PatientRouter extends Router {
  constructor() {
    super();
  }

  define(): void {
    this.router.route('/list').post(Validator.check(listPatients), PatientController.getPatients);
    // this.router.route('/').get(Validator.check(getAllPatient), PatientController.getPatients);
    this.router.route('/').post(Validator.check(createPatient), PatientController.createPatient);
    this.router.route('/:patientId').get(Validator.check(getPatientById), PatientController.getPatient);
    this.router.route('/:patientId').patch(Validator.check(updatePatient), PatientController.updatePatient);
    this.router.route('/:patientId/cases/:caseId/assign-doctor').patch(Validator.check(updatePatient), PatientController.assignDoctor);
    // this.router.route('/:id/cases').post(PatientController.createCase);
    this.router.route('/:patientId/cases/:caseId/treatment-plan').post(Validator.check(updatePatient), PatientController.addTreatmentPlan);
  }
}
