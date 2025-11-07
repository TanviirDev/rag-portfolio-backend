import {
  ingestRagFile,
  deleteUploadedFileFromServer,
} from '@/service/documentService.js';
import type { VectorFileMetaData } from '@/service/vectorService.js';

jest.mock('@/service/vectorService.js', () => ({
  _esModule: true,
  loadDocument: jest.fn(),
  splitDocuments: jest.fn(),
  addDocumentToVectorStore: jest.fn(),
  storeVectorDocumentMetaData: jest.fn(),
  deleteVectorDocumentByIds: jest.fn(),
}));
const vectorService = require('@/service/vectorService.js');

let consoleLogSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

describe('documentService', () => {
  describe('ingestRagFile', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });
    const mockFile = {
      filename: 'large_test.pdf',
      originalname: 'original_large_test.pdf',
      path: 'uploads/large_test.pdf',
      size: 2048,
    };
    it('should store the vector document and its metadata successfully without splitting the document if the document character is less than MAX_CONTENT_CHARS ', async () => {
      const mockDocs = [{ pageContent: 'Short content' }];
      (vectorService.loadDocument as jest.Mock).mockResolvedValue(mockDocs);
      (vectorService.addDocumentToVectorStore as jest.Mock).mockResolvedValue(
        undefined,
      );
      (
        vectorService.storeVectorDocumentMetaData as jest.Mock
      ).mockResolvedValue(undefined);
      await expect(
        ingestRagFile(mockFile as Express.Multer.File),
      ).resolves.toBeUndefined();
      expect(vectorService.loadDocument).toHaveBeenCalledWith(mockFile.path);
      expect(vectorService.splitDocuments).not.toHaveBeenCalled();
      expect(vectorService.addDocumentToVectorStore).toHaveBeenCalledWith(
        mockDocs,
        expect.any(Array),
      );
      expect(vectorService.storeVectorDocumentMetaData).toHaveBeenCalledWith(
        expect.any(Object) as VectorFileMetaData,
      );
    });
    it('should store the vector document and its metadata successfully with splitting the document if the document character is more than MAX_CONTENT_CHARS ', async () => {
      const mockDocs = [{ pageContent: 'A'.repeat(6000) }]; // Large content
      const splitDocs = [
        { pageContent: 'A'.repeat(2000) },
        { pageContent: 'A'.repeat(2000) },
        { pageContent: 'A'.repeat(2000) },
      ];
      (vectorService.loadDocument as jest.Mock).mockResolvedValue(mockDocs);
      (vectorService.splitDocuments as jest.Mock).mockResolvedValue(splitDocs);
      (vectorService.addDocumentToVectorStore as jest.Mock).mockResolvedValue(
        undefined,
      );
      (
        vectorService.storeVectorDocumentMetaData as jest.Mock
      ).mockResolvedValue(undefined);
      await expect(
        ingestRagFile(mockFile as Express.Multer.File),
      ).resolves.toBeUndefined();
      expect(vectorService.loadDocument).toHaveBeenCalledWith(mockFile.path);
      expect(vectorService.splitDocuments).toHaveBeenCalledWith(mockDocs);
      expect(vectorService.addDocumentToVectorStore).toHaveBeenCalledWith(
        splitDocs,
        expect.any(Array),
      );
      expect(vectorService.storeVectorDocumentMetaData).toHaveBeenCalledWith(
        expect.any(Object) as VectorFileMetaData,
      );
    });
    it('should rollback vector document storage if metadata storage fails and throw error', async () => {
      const deleteUploadedFileFromServerSpy = jest.spyOn(
        require('@/service/documentService.js'),
        'deleteUploadedFileFromServer',
      );
      const mockDocs = [{ pageContent: 'Short content' }];
      (vectorService.loadDocument as jest.Mock).mockResolvedValue(mockDocs);
      (vectorService.addDocumentToVectorStore as jest.Mock).mockResolvedValue(
        undefined,
      );
      (
        vectorService.storeVectorDocumentMetaData as jest.Mock
      ).mockRejectedValue(new Error('Metadata storage failed'));
      (vectorService.deleteVectorDocumentByIds as jest.Mock).mockResolvedValue(
        undefined,
      );
      deleteUploadedFileFromServerSpy.mockResolvedValueOnce(undefined);

      await expect(
        ingestRagFile(mockFile as Express.Multer.File),
      ).rejects.toThrow('Error storing vector file metadata');
      expect(vectorService.loadDocument).toHaveBeenCalledWith(mockFile.path);
      expect(vectorService.addDocumentToVectorStore).toHaveBeenCalledWith(
        mockDocs,
        expect.any(Array),
      );
      expect(vectorService.storeVectorDocumentMetaData).toHaveBeenCalledWith(
        expect.any(Object) as VectorFileMetaData,
      );
    });
  });
  describe('deleteUploadedFileFromServer', () => {
    const mockFileName = 'testfile_to_delete.pdf';
    const fs = require('fs/promises');
    const path = require('path');

    let fsAccessSpy: jest.SpyInstance;
    let fsUnlinkSpy: jest.SpyInstance;
    const mockPath = 'uploads/' + mockFileName;
    beforeEach(() => {
      fsAccessSpy = jest.spyOn(fs, 'access');
      fsUnlinkSpy = jest.spyOn(fs, 'unlink');
      jest.spyOn(path, 'join').mockReturnValue(`uploads/${mockPath}`);
      jest.spyOn(process, 'cwd');
    });

    afterEach(() => {
      jest.clearAllMocks();
      fsAccessSpy.mockRestore();
      fsUnlinkSpy.mockRestore();
    });
    it('should delete the uploaded file from server ', async () => {
      fsAccessSpy.mockResolvedValueOnce(undefined);
      fsUnlinkSpy.mockResolvedValueOnce(undefined);
      await deleteUploadedFileFromServer(mockFileName);
      expect(path.join).toHaveBeenCalledWith(
        process.cwd(),
        'uploads',
        mockFileName,
      );
      expect(fsAccessSpy).toHaveBeenCalled();
      expect(fsUnlinkSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `Deleted file from server: ${mockFileName}`,
      );
    });
    it('should handle error if file does not exist', async () => {
      fsAccessSpy.mockRejectedValueOnce(new Error('File not found'));
      await expect(deleteUploadedFileFromServer(mockFileName)).rejects.toThrow(
        'File not found',
      );
      expect(fsAccessSpy).toHaveBeenCalled();
      expect(fsUnlinkSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `File not found on server: ${mockFileName}`,
      );
    });
  });
});
