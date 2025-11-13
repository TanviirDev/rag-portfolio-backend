import * as z from 'zod';
import { tool } from '@langchain/core/tools';
import { retrieveDocs } from '@/service/chatQueryService.js';

const retrieveSchema = z.object({ query: z.string() });

const retrieveContext = tool(
  async ({ query }) => {
    const retrievedDocs = await retrieveDocs(query, 3);
    const serialized = retrievedDocs
      .map(
        (doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`,
      )
      .join('\n');
    return [serialized, retrievedDocs];
  },
  {
    name: 'retrieveContext',
    description: 'Retrieve information about Tanvir related to a query.',
    schema: retrieveSchema,
    responseFormat: 'content_and_artifact',
  },
);

export default retrieveContext;
