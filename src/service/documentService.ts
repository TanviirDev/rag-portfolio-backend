import path from 'path';
import {
  addDocumentToVectorStore,
  loadDocument,
  splitDocuments,
  storeVectorDocumentMetaData,
  deleteVectorDocumentByIds,
  type VectorFileMetaData,
} from './vectorService.js';
import crypto from 'crypto';
import fs from 'fs/promises';
import { MAX_CONTENT_CHARS } from '../constants/index.js';

export const ingestRagFile = async (file: Express.Multer.File) => {
  const docs = await loadDocument(file.path);
  const contentCharLength = docs.reduce(
    (acc, doc) => acc + doc.pageContent.length,
    0,
  );

  const processedDocs =
    contentCharLength > MAX_CONTENT_CHARS ? await splitDocuments(docs) : docs;
  const ids = processedDocs.map(
    (_, i) =>
      `${file.originalname}-${i}-${crypto.randomBytes(8).toString('base64url')}`,
  );
  await addDocumentToVectorStore(processedDocs, ids);

  const vectorFileMetaData: VectorFileMetaData = {
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
    ids,
    uploadDate: new Date(),
  };
  try {
    await storeVectorDocumentMetaData(vectorFileMetaData);
  } catch (error) {
    await deleteVectorDocumentByIds(ids).catch((err) => {
      console.error('Error deleting vector documents during rollback:', err);
      throw err;
    });
    await deleteUploadedFileFromServer(file.filename).catch((err) => {
      console.error('Error deleting uploaded file during rollback:', err);
      throw err;
    });
    console.error(
      'Rolled back vector documents due to metadata storage failure',
    );
    throw new Error('Error storing vector file metadata');
  }
};

export const deleteUploadedFileFromServer = async (fileName: string) => {
  const filePath = path.join(process.cwd(), 'uploads', fileName);
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log(`Deleted file from server: ${fileName}`);
  } catch (error) {
    console.error(`File not found on server: ${fileName}`);
    throw error;
  }
};
