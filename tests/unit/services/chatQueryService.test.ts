import {
  getChatResponse,
  streamChatResponse,
  retrieveContextDocs,
  saveChatHistory,
} from '@/service/chatQueryService.js';
import type { Chat } from '@/service/chatQueryService.js';
import vectorStore from '@/config/vectorStore.js';
import queryAgent from '@/agents/queryAgent.js';

jest.mock('@/config/vectorStore', () => ({
  __esModule: true,
  default: {
    similaritySearch: jest.fn(),
  },
}));

jest.mock('@/agents/queryAgent', () => ({
  __esModule: true,
  default: {
    invoke: jest.fn(),
    stream: jest.fn(),
  },
}));

describe('chatQueryService', () => {
  describe('getChatResponse', () => {
    it('should take the user query and send to chat model and return response', async () => {
      const userQuery = "what is Tanvir's favorite programming language?";
      const mockResponse = {
        messages: [
          {
            content: 'Tanvir loves programming in TypeScript.',
          },
        ],
      };
      (queryAgent.invoke as jest.Mock).mockResolvedValue(mockResponse);
      const response = await getChatResponse(userQuery);
      expect(queryAgent.invoke).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: userQuery }],
      });
      expect(response).toEqual(mockResponse);
    });
    it('should throw error if chat model fails to respond', async () => {
      const userQuery = 'Tell me about Tanvir.';
      const error = new Error('Chat model error');
      (queryAgent.invoke as jest.Mock).mockRejectedValue(error);
      await expect(getChatResponse(userQuery)).rejects.toThrow(
        'Error getting chat response: ' + error,
      );
    });
  });
  describe('streamChatResponse', () => {
    it('should stream chat response chunks from the chat model', async () => {
      const userQuery = 'What are Tanvir’s hobbies?';
      const mockStream = {
        [Symbol.asyncIterator]: function* () {
          yield {
            messages: [{ content: 'Tanvir enjoys hiking and photography.' }],
          };
          yield {
            messages: [{ content: 'He also likes to travel.' }],
          };
        },
      };
      (queryAgent.stream as jest.Mock).mockResolvedValue(mockStream);
      const stream = await streamChatResponse(userQuery);
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      expect(queryAgent.stream).toHaveBeenCalledWith(
        {
          messages: [{ role: 'user', content: userQuery }],
        },
        { streamMode: 'values' },
      );
      expect(chunks).toEqual([
        { messages: [{ content: 'Tanvir enjoys hiking and photography.' }] },
        { messages: [{ content: 'He also likes to travel.' }] },
      ]);
    });

    describe('retrieveContext', () => {
      it('should retrieve relevant context from vector store based on user query', async () => {
        const userQuery = 'what is your contact information?';
        const mockContactDocs = [
          { pageContent: 'You can reach me at tets@gmail.com' },
          { pageContent: 'My phone number is 123-456-7890' },
          { pageContent: 'Feel free to connect on LinkedIn' },
        ];
        const results = 3;
        (vectorStore.similaritySearch as jest.Mock).mockResolvedValue(
          mockContactDocs,
        );
        const context = await retrieveContextDocs(userQuery, results);
        expect(vectorStore.similaritySearch).toHaveBeenCalledWith(
          userQuery,
          results,
        );
        expect(context).toEqual(mockContactDocs);
      });
      it('should return empty context if no relevant documents found', async () => {});
      it('should throw error if vector store retrieval fails', async () => {});
    });
    describe('saveChatHistory', () => {
      it('should save user query and chat response to database', async () => {});
      it('should throw error if database save fails', async () => {});
    });
  });
});
