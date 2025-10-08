import { OpenAIEmbeddings } from '@langchain/openai';

export const OpenAIembeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
});
