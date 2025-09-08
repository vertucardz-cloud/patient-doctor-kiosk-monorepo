import { Request } from 'express';
import { badRequest, notFound } from '@hapi/boom';
import { IResponse, IUserRequest, ITokenOptions } from '@interfaces';
import { Safe } from '@decorators/safe.decorator';
import { FranchiseRepository } from '@repositories/franchise.repository';
import { Franchise } from '@prisma/client';

/**
 * Manage incoming requests from api/{version}/auth
 */
class FranchiseController {
  /**
   * @description
   */
  private static instance: FranchiseController;

  private constructor() {}

  /**
   * @description
   */
  static get(): FranchiseController {
    if (!FranchiseController.instance) {
      FranchiseController.instance = new FranchiseController();
    }
    return FranchiseController.instance;
  }

  @Safe()
  async createFranchise(req: Request, res: IResponse): Promise<void> {
    const repository = FranchiseRepository;
    const franchise = await repository.createFranchise(req.body);
    res.locals.data = franchise ? franchise : {};
  }

  @Safe()
  async getAllFranchises(req: IUserRequest, res: IResponse): Promise<void> {
    const repository = FranchiseRepository;
    const options = req.body;
    const franchise = await repository.findAll();
    res.locals.data = franchise ? franchise : [];
  }

  @Safe()
  async updateFranchise(req: IUserRequest, res: IResponse): Promise<void> {
    const repository = FranchiseRepository;
    const franchise = await repository.update(req.params.franchiseId, req.body as Partial<Franchise>);
    res.locals.data = franchise ? franchise : {};
  }

  @Safe()
  async getFranchiseById(req: Request, res: IResponse): Promise<void> {
    const repository = FranchiseRepository;
    const franchise = await repository.findById(req.params.franchiseId);
    res.locals.data = franchise ? franchise : {};
  }

  @Safe()
  async deactivateFranchise(req: IUserRequest, res: IResponse): Promise<void> {
    const repository = FranchiseRepository;
    const franchise = await repository.deactivate(req.params.franchiseId);
    res.locals.data = franchise ? franchise : {};
  }
}

const franchiseController = FranchiseController.get();

export { franchiseController as FranchiseController };
