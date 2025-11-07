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

beforeAll(() => {
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
    it('should store the vector document and its metadata successfully without splitting the document if the document character is less than MAX_CONTENT_CHARS ', async () => {
      const mockFile = {
        filename: 'test.pdf',
        originalname: 'original_test.pdf',
        path: 'uploads/test.pdf',
        size: 1024,
      };
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
      const mockFile = {
        filename: 'large_test.pdf',
        originalname: 'original_large_test.pdf',
        path: 'uploads/large_test.pdf',
        size: 2048,
      };
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
    it('should rollback vector document storage if metadata storage fails and throw error', async () => {});
  });
  describe('deleteUploadedFileFromServer', () => {
    it('should delete the uploaded file from server ', async () => {});
  });
});
