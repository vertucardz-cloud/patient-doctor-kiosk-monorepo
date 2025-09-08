import { Router } from '@classes';
import { FranchiseController } from '@controllers/franchise.controller';
import { Guard } from '@middlewares/guard.middleware';
import { Validator } from '@middlewares/validator.middleware';
import { RequestHandler } from 'express';
import { ROLE } from '@enums';
import {
  createFranchise,
  getFranchiseById,
  updateFranchise,
  getAllFranchises,
  deactivateFranchise,
} from '@validations/franchise.validation';

export class FranchiseRouter extends Router {
  constructor() {
    super();
  }

  define(): void {
    this.router
      .route('/')
      .post(
        Guard.authorize([ROLE.admin]),
        Validator.check(createFranchise),
        FranchiseController.createFranchise as RequestHandler
      );
    this.router
      .route('/')
      .get(
        Guard.authorize([ROLE.admin]),
        Validator.check(getAllFranchises),
        FranchiseController.getAllFranchises as RequestHandler
      );
    this.router
      .route('/:franchiseId')
      .get(
        Guard.authorize([ROLE.admin]),
        Validator.check(getFranchiseById),
        FranchiseController.getFranchiseById as RequestHandler
      );
    this.router
      .route('/:franchiseId')
      .put(
        Guard.authorize([ROLE.admin]),
        Validator.check(updateFranchise),
        FranchiseController.updateFranchise as RequestHandler
      );
    this.router
      .route('/:franchiseId')
      .delete(
        Guard.authorize([ROLE.admin]),
        Validator.check(deactivateFranchise),
        FranchiseController.deactivateFranchise as RequestHandler
      );
  }
}
