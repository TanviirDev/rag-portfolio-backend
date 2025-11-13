import { createAgent } from 'langchain';
import { retrieveContext } from './tools/index.js';
import model from '@/config/gptModel.js';

const tools = [retrieveContext];
const systemPrompt = `You are an AI assistant that helps users by providing accurate and concise information about Tanvir based on the retrieved context. Use the provided context to answer user queries effectively. If the context does not contain relevant information, respond with "I'm sorry, I don't have the information you're looking for."`;
const queryAgent = createAgent({ model, tools, systemPrompt });

export default queryAgent;
