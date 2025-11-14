import { Document } from 'langchain';
import vectorStore from '@/config/vectorStore.js';
import * as z from 'zod';
import queryAgent from '@/agents/queryAgent.js';

const retrieveSchema = z.object({ query: z.string() });
export interface Chat {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const getChatResponse = async (
  userQuery: string,
  chatHistory: Chat[],
) => {
  try {
    const result = await queryAgent.invoke(
      {
        messages: [{ role: 'user', content: userQuery }],
      },
      // { streamMode: 'messages' },
    );
    return result;
  } catch (error) {
    throw new Error('Error getting chat response: ' + error);
  }
};

export const streamChatResponse = async (
  userQuery: string,
  chatHistory: Chat[],
): Promise<AsyncIterable<unknown>> => {
  try {
    const stream = await queryAgent.stream({
      messages: [{ role: 'user', content: userQuery }],
    });
    return stream as AsyncIterable<unknown>;
  } catch (error) {
    throw new Error(
      'Streaming not supported by current agent/model. ' +
        'Ensure your LangChain version and model support .stream(): ' +
        error,
    );
  }
};

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
