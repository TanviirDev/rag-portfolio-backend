import { error } from 'console';
import type { Request, Response, NextFunction } from 'express';

export const uploadRagFile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }
  } catch (error) {
    next(error);
  }
};
