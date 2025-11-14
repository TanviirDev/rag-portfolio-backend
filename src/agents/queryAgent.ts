import { createAgent } from 'langchain';
import { retrieveContext } from './tools/index.js';
import model from '@/config/gptModel.js';

const tools = [retrieveContext];
const systemPrompt = `You are an AI assistant that helps users by providing accurate and concise information about Tanvir based on the retrieved context. Use the provided tool called retrieveContext to retrieve the information about him to answer user queries effectively. If the tool cannot provide the relevant information, respond with "I'm sorry, I don't have the information you're looking for."`;
const queryAgent = createAgent({ model, tools, systemPrompt });

export default queryAgent;
