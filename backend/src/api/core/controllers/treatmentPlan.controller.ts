import { Request } from 'express';
import { badRequest, notFound } from '@hapi/boom';
import { IResponse, IUserRequest, ITokenOptions } from '@interfaces';
import { Patient } from '@prisma/client';
import { Safe } from '@decorators/safe.decorator';
import { EmailEmitter } from '@events';
import { TreatmentPlanRepository } from '@repositories/treatmentPlan.repository';

/**
 * Manage incoming requests from api/{version}/auth
 */
class TreatmentPlanController {
  /**
   * @description
   */
  private static instance: TreatmentPlanController;

  private constructor() { }

  /**
   * @description
   */
  static get(): TreatmentPlanController {
    if (!TreatmentPlanController.instance) {
      TreatmentPlanController.instance = new TreatmentPlanController();
    }
    return TreatmentPlanController.instance;
  }

  /**
   * @description Creates and save new user
   *
   * @param req Express request object derived from http.incomingMessage
   * @param res Express response object
  */

  @Safe()
  async getTreatmentPlans(req: Request, res: IResponse): Promise<void> {
    const repository = TreatmentPlanRepository;
    console.log('----------req.body----------------', req.body)
    const treatmentPlan = await repository.list(req.body);
    res.locals.data = treatmentPlan;
  }

  @Safe()
  async createTreatmentPlan(req: Request, res: IResponse): Promise<void> {
    const repository = TreatmentPlanRepository;
    const treatmentPlan = await repository.createTreatmentPlan(req.body);
    res.locals.data = treatmentPlan;
  }

  @Safe()
  async getTreatmentPlan(req: Request, res: IResponse): Promise<void> {
    const repository = TreatmentPlanRepository;
    const treatmentPlan = await repository.getTreatmentPlanDetails(req.params.treatmentPlanId);
    res.locals.data = treatmentPlan;
  }

  @Safe()
  async updateTreatmentPlan(req: Request, res: IResponse): Promise<void> {
    const repository = TreatmentPlanRepository;
    const treatmentPlan = await repository.updateTreatmentPlan(req.params.treatmentPlanId, req.body);
    res.locals.data = treatmentPlan;
  }

  @Safe()
  async deleteTreatmentPlan(req: Request, res: IResponse): Promise<void> {
    const repository = TreatmentPlanRepository;
    await repository.removeTreatmentPlan(req.params.treatmentPlanId);
    res.locals.data = {};
  }

}

const treatmentPlanController = TreatmentPlanController.get();

export { treatmentPlanController as TreatmentPlanController };

