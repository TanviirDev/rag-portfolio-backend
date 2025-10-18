import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { uploadRagFile } from '../../../src/controllers/ragController.js';
import { AppError } from '../../../src/middlewares/errorHandler.js';
import { ALLOWED_FILE_TYPES } from '../../../src/constants/index.js';
import type { Request, Response, NextFunction } from 'express';
import * as documentService from '../../../src/service/documentService.js';

describe('Rag Controller', () => {
  const mockRes = {
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;
  const mockNext = jest.fn();

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
      expect((mockNext.mock.calls[0]?.[0] as AppError).message).toBe(
        'Invalid file type',
      );
      expect((mockNext.mock.calls[0]?.[0] as AppError).status).toBe(415);
    });
    it('should process the file and return success response', async () => {
      const file = {
        mimetype: ALLOWED_FILE_TYPES[0],
        filename: 'testfile.txt',
      } as unknown as Express.Multer.File;
      const mockReq = {
        file,
      } as unknown as Request;
      const spyOnVectorStoreRagDoc = jest
        .spyOn(documentService, 'vectorStoreRagDoc')
        .mockResolvedValue(undefined);

      await uploadRagFile(mockReq, mockRes, mockNext);
      expect(spyOnVectorStoreRagDoc).toHaveBeenCalledWith(file);
      expect(mockRes.status).toHaveBeenCalledWith(200);
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
        .spyOn(documentService, 'vectorStoreRagDoc')
        .mockRejectedValue(new Error('Service Error'));

      await uploadRagFile(mockReq, mockRes, mockNext);
      expect(spyOnVectorStoreRagDoc).toHaveBeenCalledWith(file);
      expect(mockNext).toHaveBeenCalledWith(new Error('Service Error'));
    });
  });
});
