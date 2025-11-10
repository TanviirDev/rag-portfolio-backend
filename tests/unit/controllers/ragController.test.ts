import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { uploadRagFile } from '@/controllers/ragController.js';
import { AppError } from '@/middlewares/errorHandler.js';
import { ALLOWED_FILE_TYPES } from '@/constants/index.js';
import type { Request, Response, NextFunction } from 'express';
import * as documentService from '@/service/documentService.js';
import e from 'express';

describe('Rag Controller', () => {
  let mockRes: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    mockNext = jest.fn() as unknown as NextFunction;
  });

  describe('uploadRagFile', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should throw error and 400 if no file is uploaded', async () => {
      const mockReq = {
        file: undefined,
      } as unknown as Request;

      await uploadRagFile(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No file uploaded', 400),
      );
    });
    it('should throw error and 415 if file type is invalid', async () => {
      const mockReq = {
        file: {
          mimetype: 'invalid/type',
        },
      } as unknown as Request;
      await uploadRagFile(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const calledError = (mockNext as jest.Mock).mock
        .calls[0]?.[0] as AppError;
      expect(calledError.message).toBe('Invalid file type');
      expect(calledError.status).toBe(415);
    });
    it('should process the file and return success response', async () => {
      const file = {
        mimetype: ALLOWED_FILE_TYPES[0],
        filename: 'testfile.txt',
        originalname: 'original-file.txt',
        size: 1024,
      } as unknown as Express.Multer.File;
      const mockReq = {
        file,
      } as unknown as Request;
      const spyOnVectorStoreRagDoc = jest
        .spyOn(documentService, 'ingestRagFile')
        .mockResolvedValue(undefined);

      await uploadRagFile(mockReq, mockRes, mockNext);

      expect(spyOnVectorStoreRagDoc).toHaveBeenCalledWith(file);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'File uploaded and vector stored successfully',
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
      });
    });
    it('should call next with error if vectorStoreRagDoc throws error', async () => {
      const file = {
        mimetype: ALLOWED_FILE_TYPES[0],
        filename: 'testfile.txt',
      } as unknown as Express.Multer.File;
      const mockReq = {
        file,
      } as unknown as Request;

      const spyOnVectorStoreRagDoc = jest
        .spyOn(documentService, 'ingestRagFile')
        .mockRejectedValue(new Error('Service Error'));

      await uploadRagFile(mockReq, mockRes, mockNext);
      expect(spyOnVectorStoreRagDoc).toHaveBeenCalledWith(file);
      expect(mockNext).toHaveBeenCalledWith(new Error('Service Error'));
    });
  });
});
