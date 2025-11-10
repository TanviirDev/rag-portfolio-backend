import type { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError } from '@/middlewares/errorHandler.js';

let consoleErrorMock: jest.SpyInstance;
beforeAll(() => {
  consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  consoleErrorMock.mockRestore();
});
describe('Error Handler Middleware', () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction;
  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {} as unknown as Request;
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    mockNext = jest.fn() as unknown as NextFunction;
  });

  it('should respond with the correct status and message for AppError', () => {
    const appError = new AppError('Not Found', 404);
    errorHandler(appError, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not Found' });
    expect(consoleErrorMock).toHaveBeenCalledWith(appError);
  });
  it('should respond with 500 status and generic message for non-AppError', () => {
    const genericError = new Error('Some error occurred');
    errorHandler(genericError, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Some error occurred',
    });
    expect(consoleErrorMock).toHaveBeenCalledWith(genericError);
  });
});
