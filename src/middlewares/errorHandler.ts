import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  status: number;
  constructor(message?: string, status: number = 500) {
    super(message);
    this.status = status;
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = err instanceof AppError ? err.status : 500;
  console.error(err);
  res.status(status).json({ message: err.message || 'Internal Server Error' });
};
