import { Document } from 'langchain/document';
import vectorStore from '@/config/vectorStore.js';
import * as z from 'zod';
import queryAgent from '@/agents/queryAgent.js';

const retrieveSchema = z.object({ query: z.string() });
// const retrieveTool = tool({});
export interface Chat {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const getChatResponse = async (
  userQuery: string,
  chatHistory: Chat[],
): Promise<string> => {};

export const retrieveDocs = async (
  userQuery: string,
  results?: number,
): Promise<Document[]> => {
  try {
    const context = await vectorStore.similaritySearch(userQuery, results);
    return context;
  } catch (error) {
    throw new Error('Error retrieving context from vector store: ' + error);
  }
};

export const saveChatHistory = async (
  query: Chat,
  response: Chat,
  interactionID: string,
): Promise<void> => {};
