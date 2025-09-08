import { Router } from '@classes';
import { TreatmentPlanController } from '@controllers/treatmentPlan.controller';
import { Validator } from '@middlewares/validator.middleware';

import {
  createTreatmentPlan,
  updateTreatmentPlan,
  getTreatmentPlanById,
  deleteTreatmentPlan,
  listTreatmentPlans,
  getAllTreatmentPlans,
} from '@validations/treatmentPlan.validation';

export class TreatmentPlanRouter extends Router {
  constructor() {
    super();
  }

  define(): void {
    this.router.route('/create').post(Validator.check(createTreatmentPlan), TreatmentPlanController.createTreatmentPlan);
    this.router.route('/list').post( Validator.check(listTreatmentPlans), TreatmentPlanController.getTreatmentPlans);
    this.router.route('/:treatmentPlanId')
    .get(Validator.check(getTreatmentPlanById), TreatmentPlanController.getTreatmentPlan)
    .put(Validator.check(updateTreatmentPlan), TreatmentPlanController.updateTreatmentPlan)
    .delete(Validator.check(deleteTreatmentPlan), TreatmentPlanController.deleteTreatmentPlan);
  }
}
