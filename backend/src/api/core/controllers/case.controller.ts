import { Request } from 'express';
import { badRequest, notFound } from '@hapi/boom';
import { IResponse, ITokenOptions } from '@interfaces';
import { Safe } from '@decorators/safe.decorator';
import { CaseRepository } from '@repositories/case.repository';
import { Case } from '@prisma/client';

/**
 * Manage incoming requests from api/{version}/auth
 */
class CaseController {
  /**
   * @description
   */
  private static instance: CaseController;

  private constructor() {}

  /**
   * @description
   */
  static get(): CaseController {
    if (!CaseController.instance) {
      CaseController.instance = new CaseController();
    }
    return CaseController.instance;
  }

  @Safe()
  async createcase(req: Request, res: IResponse): Promise<void> {
    const caseData = await CaseRepository.createCase(req.body);
    res.locals.data = caseData ? caseData : {};
  }

  @Safe()
  async getAllCases(req: Request, res: IResponse): Promise<void> {
    const options = req.body;
    const cases = await CaseRepository.findAll();
    res.locals.data = cases ? cases : [];
  }

  @Safe()
  async updateCase(req: Request, res: IResponse): Promise<void> {
    const caseData = await CaseRepository.update(req.params.caseId, req.body as Partial<Case>);
    res.locals.data = caseData ? caseData : {};
  }

  @Safe()
  async getCaseById(req: Request, res: IResponse): Promise<void> {
    const fatchedCase = await CaseRepository.findById(req.params.caseId);
    res.locals.data = fatchedCase ? fatchedCase : {};
  }

  @Safe()
  async deactivateCase(req: Request, res: IResponse): Promise<void> {
    const deactivateCase = await CaseRepository.deactivateCase(req.params.caseId);
    res.locals.data = deactivateCase ? deactivateCase : {};
  }
  @Safe()
  async completeCase(req: Request, res: IResponse): Promise<void> {
    const deactivateCase = await CaseRepository.completeCase(req.params.caseId);
    res.locals.data = deactivateCase ? deactivateCase : {};
  }
  @Safe()
  async assignDoctor(req: Request, res: IResponse): Promise<void> {
    const deactivateCase = await CaseRepository.assignDoctor(req.params.caseId, req.body);
    res.locals.data = deactivateCase ? deactivateCase : {};
  }
  @Safe()
  async updateTreatmentPlan(req: Request, res: IResponse): Promise<void> {
    const deactivateCase = await CaseRepository.updateTreatmentPlan(req.params.caseId, req.body);
    res.locals.data = deactivateCase ? deactivateCase : {};
  }
  @Safe()
  async approveCost(req: Request, res: IResponse): Promise<void> {
    const deactivateCase = await CaseRepository.approveCost(req.params.caseId);
    res.locals.data = deactivateCase ? deactivateCase : {};
  }
}

const caseController = CaseController.get();

export { caseController as CaseController };
