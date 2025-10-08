import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { MongoClient } from 'mongodb';
import { OpenAIembeddings as embeddings } from './embeddings.js';
import dotenv from 'dotenv';
dotenv.config();

export const client = new MongoClient(process.env.MONGODB_ATLAS_URI || '');

export const collection = client
  .db(process.env.MONGODB_ATLAS_DB_NAME)
  .collection(process.env.MONGODB_ATLAS_COLLECTION_NAME || '');
