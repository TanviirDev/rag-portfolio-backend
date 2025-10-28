/**
 * tests/unit/services/vectorService.test.ts
 *
 * Unit tests for loadDocument in src/service/vectorService.ts
 *
 * Assumes a Jest test runner.
 */

const mockLoad = jest.fn();

jest.mock('@langchain/community/document_loaders/fs/pdf', () => {
  return {
    PDFLoader: jest.fn().mockImplementation((filePath: string) => ({
      load: mockLoad,
      // expose filePath if needed for debugging; constructor call is asserted via mock
      _filePath: filePath,
    })),
  };
});

describe('vectorService.loadDocument', () => {
  beforeEach(() => {
    jest.resetModules();
    mockLoad.mockReset();
  });

  test('calls PDFLoader with provided filePath and returns loaded documents', async () => {
    const fakeDocs = [{ pageContent: 'page1' }, { pageContent: 'page2' }];
    mockLoad.mockResolvedValueOnce(fakeDocs);

    const { loadDocument } = await import('../../../src/service/vectorService');
    const filePath = 'path/to/test.pdf';

    const docs = await loadDocument(filePath);

    // ensure the mocked load was called and returned the docs
    expect(mockLoad).toHaveBeenCalledTimes(1);
    expect(docs).toBe(fakeDocs);

    // ensure PDFLoader constructor was called with the correct argument
    const pdfModule = jest.requireMock(
      '@langchain/community/document_loaders/fs/pdf',
    ) as { PDFLoader: jest.Mock };
    expect(pdfModule.PDFLoader).toHaveBeenCalledWith(filePath);
  });

  test('propagates errors thrown by the PDFLoader.load method', async () => {
    const err = new Error('failed to load PDF');
    mockLoad.mockRejectedValueOnce(err);

    const { loadDocument } = await import('../../../src/service/vectorService');

    await expect(loadDocument('some/other.pdf')).rejects.toThrow(
      'failed to load PDF',
    );
    expect(mockLoad).toHaveBeenCalledTimes(1);
  });
});
