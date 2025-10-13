import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { MongoClient } from 'mongodb';
import { OpenAIembeddings as embeddings } from './embeddings.js';
import dotenv from 'dotenv';
import type { Db } from 'mongodb';

export const client = new MongoClient(process.env.MONGODB_ATLAS_URI || '');
let myMongoDb: Db;

export const connectMongoDB = async () => {
  try {
    await client.connect();
    myMongoDb = client.db(process.env.MONGODB_ATLAS_DB_NAME);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
  }
};

export const getDb = (): Db => {
  if (!myMongoDb) {
    throw new Error('Database not connected. Please connect first.');
  }
  return myMongoDb;
};

export const disconnectMongoDB = async () => {
  try {
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  } catch (error) {
    console.error('Error disconnecting from MongoDB Atlas:', error);
  }
};

export const collection = client
  .db(process.env.MONGODB_ATLAS_DB_NAME)
  .collection(process.env.MONGODB_ATLAS_COLLECTION_NAME || '');
