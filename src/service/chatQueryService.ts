import { Document } from 'langchain/document';
import vectorStore from '@/config/vectorStore.js';
import * as z from 'zod';
import { tool } from '@langchain/core/tools';

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

export const retrieveContext = async (
  userQuery: string,
): Promise<Document[]> => {
  try {
    const context = await vectorStore.similaritySearch(userQuery, 3);
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
