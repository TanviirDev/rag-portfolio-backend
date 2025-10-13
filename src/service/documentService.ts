import {
  addDocumentToVectorStore,
  loadDocument,
  splitDocument,
  storeVectorDocumentMetaData,
  type vectorFileMetaData,
} from './vectorService.js';
import type { Document } from 'langchain/document';
import crypto from 'crypto';

export const vectorStoreRagDoc = async (file: Express.Multer.File) => {
  if (!file) {
    throw new Error('No file provided for vector storage');
  }

  const docs = await loadDocument(file.path);
  const splitDocs = await splitDocument(docs);
  const ids = splitDocs.map(
    (_, i) => `${file.originalname}-${i}-${crypto.randomUUID()}`,
  );
  await addDocumentToVectorStore(splitDocs, ids);

  const vectorFileMetaData: vectorFileMetaData = {
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
    ids,
    uploadDate: new Date(),
  };
  await storeVectorDocumentMetaData(vectorFileMetaData);
};
