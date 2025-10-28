import vectorStore from './config/vectorStore.js';
import { client } from './config/mongoDb.js';
import type { Document } from '@langchain/core/documents';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { ChatOpenAI } from '@langchain/openai';
import {
  getVectorDocumentMetaData,
  deleteVectorDocumentByIds,
  deleteVectorDocumentMetaData,
} from './service/vectorService.js';
import { connectMongoDB } from './config/mongoDb.js';

// const testdoc: Document = {
//   pageContent: `The Lantern and the Wind

// On the edge of a quiet village, an old woman lit a paper lantern each night and set it on her porch. The children whispered that the lantern never went out, no matter how strong the wind blew. Curious, a boy once asked her why she bothered lighting it if it could not be extinguished.

// She smiled and said, “Because the wind still tries, and that makes the flame stronger.”

// The next morning, the boy left a small lantern of his own on his windowsill. And soon, others in the village did the same—tiny flames standing together against the endless wind.`,
//   metadata: { author: 'Tanvir', source: 'a random short story' },
// };

// await vectorStore.addDocuments([testdoc], { ids: ['1'] });

// console.log('Document added to vector store');

// await vectorStore.delete({ ids: ['1'] });

// console.log('Document deleted from vector store');
// const similaritySearchResults = await vectorStore.similaritySearch('wind', 5);

// for (const doc of similaritySearchResults) {
//   console.log(`* ${doc.pageContent} [${JSON.stringify(doc.metadata, null)}]`);
// }
// const loader = new PDFLoader('Tanvir_Resume.pdf');
// const docs = await loader.load();
// console.log(`Loaded ${docs.length} documents from PDF`);

// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 600,
//   chunkOverlap: 100,
//   separators: ['\n\n', '\n', '•', '.', ' ', ''],
// });
// const splitDocs = await splitter.splitDocuments(docs);
// console.log(`Split into ${splitDocs.length} chunks`);
// await vectorStore.addDocuments(splitDocs);
// console.log('Documents added to vector store');
// const result = await vectorStore.similaritySearch('Summary', 1);
// const result2 = await vectorStore.similaritySearch('skills', 5);

// console.log(result[0]);
// console.log(result2[0]);

// const promptTemplete = `You are a helpful assistant that helps people find information. Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
// {context}
// Question: {question}
// Answer:`;

// const question =
//   "Can you provide a brief summary of Tanvir's professional background and key skills?";
// const result = await vectorStore.similaritySearch(question, 3);

// const context = result
//   .map((doc, index) => `Context ${index + 1}:\n${doc.pageContent}\n`)
//   .join('\n');
// const message = promptTemplete
//   .replace('{context}', context)
//   .replace('{question}', question);

// const model = new ChatOpenAI({ model: 'gpt-4o-mini' });
// const reply = await model.invoke([{ role: 'user', content: message }]);
// console.log('Reply from Chat Model:', reply.text);

// await client.close();

// const loader = new PDFLoader('Payments - Universal Credit.pdf');
// const docs = await loader.load();
// const text = docs.map((doc) => doc.pageContent).join('\n');
// console.log(text.length);

//DELETE VECTOR DOCUMENTS AND METADATA BY FILENAME
await connectMongoDB();
try {
  const fileData = await getVectorDocumentMetaData(
    '1760797890769-Tanvir_resume.pdf',
  );
  if (fileData) {
    const ids = fileData!.ids || [];
    // await deleteVectorDocumentByIds(ids);
    // await deleteVectorDocumentMetaData('1760797890769-Tanvir_resume.pdf');
    // await deleteUploadedFileFromServer('1760797890769-Tanvir_resume.pdf');

    console.log('Deleted vector documents and metadata successfully');
  }
  console.log('done');
} catch (error) {
  console.error('Error fetching vector document metadata:', error);
}
