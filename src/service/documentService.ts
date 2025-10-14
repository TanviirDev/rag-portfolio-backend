import {
  addDocumentToVectorStore,
  loadDocument,
  splitDocument,
  storeVectorDocumentMetaData,
  deleteVectorDocumentByIds,
  type vectorFileMetaData,
} from './vectorService.js';
import crypto from 'crypto';

export const vectorStoreRagDoc = async (file: Express.Multer.File) => {
  let docs = await loadDocument(file.path);
  const contentCharLength = docs
    .map((doc) => doc.pageContent)
    .join('\n').length;
  docs = contentCharLength > 4000 ? await splitDocument(docs) : docs;
  const ids = docs.map(
    (_, i) => `${file.originalname}-${i}-${crypto.randomUUID()}`,
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
    throw Error('Error storing vector file metadata');
  }
};
