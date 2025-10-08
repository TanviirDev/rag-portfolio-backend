import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { OpenAIembeddings as embeddings } from './embeddings.js';
import { collection } from './mongoDb.js';

const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
  collection: collection,
  indexName: 'vector_index',
  textKey: 'text',
  embeddingKey: 'embedding',
});

export default vectorStore;
