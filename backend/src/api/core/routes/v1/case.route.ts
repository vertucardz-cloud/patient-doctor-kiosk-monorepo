import { Router } from '@classes';
import { CaseController } from '@controllers/case.controller';

export class CaseRouter extends Router {
  constructor() {
    super();
  }

  define(): void {
    this.router.route('/').post(CaseController.createcase);
    this.router.route('/').get(CaseController.getAllCases);
    this.router.route('/:caseId').get(CaseController.getCaseById);
    this.router.route('/:caseId').put(CaseController.updateCase);
    this.router.route('/:caseId/assign-doctor').put(CaseController.assignDoctor);
    this.router.route('/:caseId/treatment-plan').put(CaseController.updateTreatmentPlan);
    this.router.route('/:caseId/approve-cost').put(CaseController.approveCost);
    this.router.route('/:caseId/complete').put(CaseController.completeCase);
  }
}
