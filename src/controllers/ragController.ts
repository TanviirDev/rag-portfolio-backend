import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler.js';
import { ALLOWED_FILE_TYPES } from '../constants/index.js';
import { vectorStoreRagDoc } from '../service/documentService.js';

export const uploadRagFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }
    if (!ALLOWED_FILE_TYPES.includes(req.file.mimetype)) {
      throw new AppError('Invalid file type', 400);
    }

    await vectorStoreRagDoc(req.file);
    res
      .status(200)
      .json({ message: 'File uploaded and vector stored successfully' });
  } catch (error) {
    next(error);
  }
};
