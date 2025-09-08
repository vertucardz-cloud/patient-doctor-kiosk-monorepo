import { Request, Response, NextFunction } from 'express';
import { IStorage } from '@interfaces';

/**
 * @description Upload interface
 */
export interface IUpload {
  diskStorage: (params: { destination: string; filename: string }) => IStorage;
  any: () => (req: Request, res: Response, next: NextFunction) => void;
}
