import path from 'path';
import {
  addDocumentToVectorStore,
  loadDocument,
  splitDocuments,
  storeVectorDocumentMetaData,
  deleteVectorDocumentByIds,
  type vectorFileMetaData,
} from './vectorService.js';
import crypto from 'crypto';
import fs from 'fs/promises';

export const vectorStoreRagDoc = async (file: Express.Multer.File) => {
  let docs = await loadDocument(file.path);
  const contentCharLength = docs
    .map((doc) => doc.pageContent)
    .join('\n').length;
  docs = contentCharLength > 4000 ? await splitDocuments(docs) : docs;
  const ids = docs.map(
    (_, i) =>
      `${file.originalname}-${i}-${crypto.randomBytes(8).toString('base64url')}`,
  );
  await addDocumentToVectorStore(docs, ids);

  const vectorFileMetaData: vectorFileMetaData = {
    filename: file.filename,
    originalname: file.originalname,
    size: file.size,
    ids,
    uploadDate: new Date(),
  };
  try {
    await storeVectorDocumentMetaData(vectorFileMetaData);
  } catch (error) {
    await deleteVectorDocumentByIds(ids);
    console.log('Rolled back vector documents due to metadata storage failure');
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
    console.log(`File not found on server: ${fileName}`);
    return;
  }
};
