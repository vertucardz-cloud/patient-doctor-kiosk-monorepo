import { Request } from 'express';
import { FileFilterCallback } from 'multer';
import { StorageEngine } from 'multer';

// export interface IUploadMulterOptions {
//   storage: StorageEngine | any;
//   limits: { fileSize: number };
//   fileFilter: (
//     req: Request,
//     file: Express.Multer.File,
//     callback: FileFilterCallback
//   ) => void;
// }

export interface IUploadMulterOptions {
  storage: StorageEngine;
  limits: { fileSize: number };
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    next: (error: Error | null, acceptFile: boolean) => void
  ) => void;
}
