import {
  loadDocument,
  splitDocuments,
  addDocumentToVectorStore,
  storeVectorDocumentMetaData,
  getVectorDocumentMetaDataByFileName,
  deleteVectorDocumentMetaDataByFileName,
} from '@/service/vectorService.js';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { get } from 'http';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

//LOADER MOCK
const mockLoad = jest.fn();
jest.mock('@langchain/community/document_loaders/fs/pdf', () => {
  return {
    PDFLoader: jest
      .fn()
      .mockImplementation((filePath: string) => ({ load: mockLoad })),
  };
});

//SPLITTER MOCK
const mockSplitDocuments = jest.fn();
jest.mock('langchain/text_splitter', () => {
  return {
    RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => ({
      splitDocuments: mockSplitDocuments,
    })),
  };
});

//VECTOR STORE MOCK
jest.mock('@/config/vectorStore.js', () => {
  return {
    __esModule: true,
    default: { addDocuments: jest.fn() },
  };
});
const vectorStore = require('@/config/vectorStore.js').default;

//MONGODB MOCK
jest.mock('@/config/mongoDb.js', () => {
  return {
    __esModule: true,
    getDb: jest.fn(),
  };
});
const { getDb } = require('@/config/mongoDb.js');

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

describe('addDocumentToVectorStore', () => {
  const mockDocs = [
    { pageContent: 'Doc 1 content', metadata: {} },
    { pageContent: 'Doc 2 content', metadata: {} },
  ];
  const mockIds = ['doc1-id', 'doc2-id'];
  it('should add documents to the vector store with given IDs', async () => {
    await addDocumentToVectorStore(mockDocs, mockIds);
    expect(vectorStore.addDocuments).toHaveBeenCalledWith(mockDocs, {
      ids: mockIds,
    });
  });
  it('should handle errors during adding documents to vector store', async () => {
    const mockError = new Error('Error adding documents');
    vectorStore.addDocuments.mockRejectedValueOnce(mockError);
    await expect(addDocumentToVectorStore(mockDocs, mockIds)).rejects.toThrow(
      mockError,
    );
    expect(vectorStore.addDocuments).toHaveBeenCalledWith(mockDocs, {
      ids: mockIds,
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error adding documents to vector store:',
      mockError,
    );
  });
});
describe('storeVectorDocumentMetaData', () => {
  let mockCollection: any;
  let mockDb: any;

  beforeEach(() => {
    mockCollection = { insertOne: jest.fn() };
    mockDb = { collection: jest.fn().mockReturnValue(mockCollection) };
    getDb.mockReturnValue(mockDb);
  });

  const vectorFileMeta = {
    filename: 'testfile.pdf',
    originalname: 'original_testfile.pdf',
  } as any;

  it('should store vector document metadata in the database', async () => {
    await storeVectorDocumentMetaData(vectorFileMeta);
    expect(getDb).toHaveBeenCalled();
    expect(mockDb.collection).toHaveBeenCalledWith('vectorFileMetadata');
    expect(mockCollection.insertOne).toHaveBeenCalledWith(vectorFileMeta);
  });
  it('should handle database errors during metadata storage', async () => {
    const mockError = new Error('Database Error');
    mockCollection.insertOne.mockRejectedValueOnce(mockError);
    await expect(storeVectorDocumentMetaData(vectorFileMeta)).rejects.toThrow(
      mockError,
    );
    expect(getDb).toHaveBeenCalled();
    expect(mockDb.collection).toHaveBeenCalledWith('vectorFileMetadata');
    expect(mockCollection.insertOne).toHaveBeenCalledWith(vectorFileMeta);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Database Error:', mockError);
  });
});
describe('getVectorDocumentMetaDataByFilename', () => {
  let mockCollection: any;
  let mockDb: any;
  beforeEach(() => {
    getDb.mockClear();
    mockCollection = { findOne: jest.fn() };
    mockDb = { collection: jest.fn().mockReturnValue(mockCollection) };
    getDb.mockReturnValue(mockDb);
  });
  const filename = 'testfile.pdf';

  it('should retrieve vector document metadata by filename from mongodb', async () => {
    const mockFileData = {
      filename: 'testfile.pdf',
      originalname: 'original_testfile.pdf',
    };
    mockCollection.findOne.mockResolvedValueOnce(mockFileData);
    const result = await getVectorDocumentMetaDataByFileName(filename);
    expect(getDb).toHaveBeenCalled();
    expect(mockDb.collection).toHaveBeenCalledWith('vectorFileMetadata');
    expect(mockCollection.findOne).toHaveBeenCalledWith({ filename });
    expect(result).toEqual(mockFileData);
  });
  it('should return null if no metadata found for the filename', async () => {
    mockCollection.findOne.mockResolvedValueOnce(null);
    const result = await getVectorDocumentMetaDataByFileName(filename);
    expect(getDb).toHaveBeenCalled();
    expect(mockDb.collection).toHaveBeenCalledWith('vectorFileMetadata');
    expect(mockCollection.findOne).toHaveBeenCalledWith({ filename });
    expect(result).toBeNull();
  });
  it('should handle database errors during metadata retrieval', async () => {
    const mockError = new Error('Database Error');
    mockCollection.findOne.mockRejectedValueOnce(mockError);
    await expect(getVectorDocumentMetaDataByFileName(filename)).rejects.toThrow(
      mockError,
    );
    expect(getDb).toHaveBeenCalled();
    expect(mockDb.collection).toHaveBeenCalledWith('vectorFileMetadata');
    expect(mockCollection.findOne).toHaveBeenCalledWith({ filename });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Database Error:', mockError);
  });
});
describe('deleteVectorDocumentMetaDataByFilename', () => {
  let mockCollection: any;
  let mockDb: any;
  beforeEach(() => {
    getDb.mockClear();
    mockCollection = { deleteOne: jest.fn() };
    mockDb = { collection: jest.fn().mockReturnValue(mockCollection) };
    getDb.mockReturnValue(mockDb);
  });
  const filename = 'testfile.pdf';
  it('should delete vector document metadata by filename from mongodb', async () => {
    await deleteVectorDocumentMetaDataByFileName(filename);
    expect(getDb).toHaveBeenCalled();
    expect(mockDb.collection).toHaveBeenCalledWith('vectorFileMetadata');
    expect(mockCollection.deleteOne).toHaveBeenCalledWith({ filename });
  });
});
describe('deleteVectorDocumentByIds', () => {});
