import express, { Router as ExpressRouterType } from 'express';

/**
 * Router base class
 */
export abstract class Router {
  /**
   * @description Wrapped Express.Router
   */
  router: ExpressRouterType;

  constructor() {
    this.router = express.Router();
    this.define();
  }

  define(): void {}
}
