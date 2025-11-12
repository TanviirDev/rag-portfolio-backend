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
): Promise<string[]> => {};
export const constructPrompt = (
  context: string[],
  userQuery: string,
): string => {};
export const saveChatHistory = async (
  userQuery: string,
  chatResponse: string,
): Promise<void> => {};
