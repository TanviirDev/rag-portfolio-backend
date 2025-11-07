import type { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import vectorStore from '../config/vectorStore.js';
import { getDb } from '../config/mongoDb.js';

export interface VectorFileMetaData {
  filename: string;
  originalname: string;
  size: number;
  ids: string[];
  uploadDate: Date;
}

let defaultSplitter: RecursiveCharacterTextSplitter | undefined;

const getDefaultSplitter = () => {
  if (!defaultSplitter) {
    defaultSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 600,
      chunkOverlap: 100,
      separators: ['\n\n', '\n', '•', '.', ' ', ''],
    });
  }
  return defaultSplitter;
};
export const loadDocument = async (filePath: string) => {
  try {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    return docs;
  } catch (error) {
    console.error('Error loading document:', error);
    throw error;
  }
};

export const splitDocuments = async (
  doc: Document[],
  splitter?: RecursiveCharacterTextSplitter,
) => {
  splitter = splitter ?? getDefaultSplitter();
  try {
    const splitDocs = await splitter.splitDocuments(doc);
    return splitDocs;
  } catch (error) {
    console.error('Error splitting document:', error);
    throw error;
  }
};

export const addDocumentToVectorStore = async (
  docs: Document[],
  ids: string[],
) => {
  try {
    await vectorStore.addDocuments(docs, { ids });
  } catch (error) {
    console.error('Error adding documents to vector store:', error);
    throw error;
  }
};

export const storeVectorDocumentMetaData = async (
  vectorFileMeta: VectorFileMetaData,
) => {
  try {
    const db = getDb();
    const vectorFileMetaCollection =
      db.collection<VectorFileMetaData>('vectorFileMetadata');
    await vectorFileMetaCollection.insertOne(vectorFileMeta);
    console.log('Vector file metadata stored successfully');
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
};

export const getVectorDocumentMetaDataByFileName = async (filename: string) => {
  try {
    const db = getDb();
    const vectorFileMetaCollection =
      db.collection<VectorFileMetaData>('vectorFileMetadata');
    const fileData = await vectorFileMetaCollection.findOne({ filename });
    return fileData;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
};

export const deleteVectorDocumentMetaDataByFileName = async (
  filename: string,
) => {
  try {
    const db = getDb();
    const vectorFileMetaCollection =
      db.collection<VectorFileMetaData>('vectorFileMetadata');
    await vectorFileMetaCollection.deleteOne({ filename });
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
};

export const deleteVectorDocumentByIds = async (ids: string[]) => {
  try {
    await vectorStore.delete({ ids });
  } catch (error) {
    console.error('Error deleting documents from vector store:', error);
    throw error;
  }
};
