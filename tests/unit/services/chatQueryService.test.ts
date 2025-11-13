import {
  getChatResponse,
  retrieveContext,
  constructPrompt,
  saveChatHistory,
} from '@/service/chatQueryService.js';
import type { Chat } from '@/service/chatQueryService.js';
import vectorStore from '@/config/vectorStore.js';

// Vector store mock
jest.mock('@/config/vectorStore', () => ({
  __esModule: true,
  default: {
    similaritySearch: jest.fn(),
  },
}));

describe('chatQueryService', () => {
  describe.skip('getChatResponse', () => {
    it('should take the user query and send to chat model and return response', async () => {
      const userQuery = "what is Tanvir's favorite programming language?";
      const chatHistory: Chat[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there! How can I help you?' },
      ];
      const response = await getChatResponse(userQuery, chatHistory);
    });
    it('should throw error if chat model fails to respond', async () => {});
  });
  describe('retrieveContext', () => {
    it('should retrieve relevant context from vector store based on user query', async () => {
      const userQuery = 'what is your contact information?';
      const mockContactDocs = [
        { pageContent: 'You can reach me at tets@gmail.com' },
        { pageContent: 'My phone number is 123-456-7890' },
        { pageContent: 'Feel free to connect on LinkedIn' },
      ];
      (vectorStore.similaritySearch as jest.Mock).mockResolvedValue(
        mockContactDocs,
      );
      const context = await retrieveContext(userQuery);
      expect(vectorStore.similaritySearch).toHaveBeenCalledWith(userQuery, 3);
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
