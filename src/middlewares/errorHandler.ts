import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  status: number;
  constructor(message?: string, status: number = 500) {
    super(message);
    this.status = status;
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);
  res
    .status(err.status)
    .json({ message: err.message || 'Internal Server Error' });
};
