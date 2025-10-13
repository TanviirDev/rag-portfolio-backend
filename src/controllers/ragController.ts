import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler.js';
import { ALLOWED_FILE_TYPES } from '../constants/index.js';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export const uploadRagFile = (
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
  } catch (error) {
    next(error);
  }
};
