import { loadDocument } from '@/service/vectorService.js';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { splitDocuments } from '@/service/vectorService.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { mock } from 'node:test';

const mockLoad = jest.fn();
const mockSplitDocuments = jest.fn();

jest.mock('@langchain/community/document_loaders/fs/pdf', () => {
  return {
    PDFLoader: jest
      .fn()
      .mockImplementation((filePath: string) => ({ load: mockLoad })),
  };
});

jest.mock('langchain/text_splitter', () => {
  return {
    RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => ({
      splitDocuments: mockSplitDocuments,
    })),
  };
});

// jest.mock('langchain/text_splitter', () => {
//   const mockSplitDocuments = jest.fn();
//   return {
//     RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => ({
//       splitDocuments: mockSplitDocuments,
//     })),
//     mockSplitDocuments,
//   };
// });

// const { mockSplitDocuments } = jest.requireMock('langchain/text_splitter');

let consoleErrorSpy: jest.SpyInstance;
beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('loadDocument', () => {
  beforeEach(() => {
    mockLoad.mockReset();
  });
  it('should load and return documents from a PDF file', async () => {
    const filePath = 'path/to/test.pdf';
    const mockDocuments = [
      { pageContent: 'Test content', metadata: {} },
      { pageContent: 'More content', metadata: {} },
    ];
    mockLoad.mockResolvedValue(mockDocuments);

    const documents = await loadDocument(filePath);

    expect(PDFLoader).toHaveBeenCalledWith(filePath);
    expect(mockLoad).toHaveBeenCalled();
    expect(documents).toEqual(mockDocuments);
  });
  it('should handle errors during document loading', async () => {
    const filePath = 'path/to/invalid.pdf';
    const mockError = new Error('Error loading document');
    mockLoad.mockRejectedValue(mockError);

    await expect(loadDocument(filePath)).rejects.toThrow(mockError);
    expect(PDFLoader).toHaveBeenCalledWith(filePath);
    expect(mockLoad).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error loading document:',
      mockError,
    );
  });
});

describe('splitDocument', () => {
  const mockDocs = [
    {
      pageContent: 'This is a long document that needs splitting.',
      metadata: {},
    },
  ];
  const mockSplitDocs = [
    { pageContent: 'This is a long document', metadata: {} },
    { pageContent: 'that needs splitting.', metadata: {} },
  ];
  beforeEach(() => {
    jest.clearAllMocks();
    mockSplitDocuments.mockImplementation(async (docs: any[]) => mockSplitDocs);
  });
  afterEach(() => {});

  it('should split documents using the default splitter', async () => {
    const splitDocs = await splitDocuments(mockDocs);
    expect(RecursiveCharacterTextSplitter).toHaveBeenCalled();
    expect(mockSplitDocuments).toHaveBeenCalledWith(mockDocs);
    expect(splitDocs).toEqual(mockSplitDocs);
  });
  it('should split documents using a provided splitter', async () => {
    const customSplitter = { splitDocuments: mockSplitDocuments } as any;
    const splitDocs = await splitDocuments(mockDocs, customSplitter);
    expect(mockSplitDocuments).toHaveBeenCalledWith(mockDocs);
    expect(RecursiveCharacterTextSplitter).not.toHaveBeenCalled();
    expect(splitDocs).toEqual(mockSplitDocs);
  });
  it('should handle errors during document splitting', async () => {
    const mockError = new Error('Error splitting document');
    mockSplitDocuments.mockRejectedValueOnce(mockError);
    await expect(splitDocuments(mockDocs)).rejects.toThrow(mockError);
    expect(mockSplitDocuments).toHaveBeenCalledWith(mockDocs);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error splitting document:',
      mockError,
    );
  });
});

describe('addDocumentToVectorStore', () => {});
describe('storeVectorDocumentMetaData', () => {});
describe('getVectorDocumentMetaDataByFilename', () => {});
describe('deleteVectorDocumentMetaDataByFilename', () => {});
describe('deleteVectorDocumentByIds', () => {});
