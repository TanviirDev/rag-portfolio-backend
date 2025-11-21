import type { Request, Response, NextFunction } from 'express';
import {
  getChatResponse,
  streamChatResponse,
} from '../service/chatQueryService.js';
import e from 'express';

export const handleChatQuery = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isStream = req.query.stream === 'true';
    const userQuery = req.body.userQuery;
    const interactionID = req.body.interactionID;
    if (isStream) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
      const stream = await streamChatResponse(userQuery, interactionID);
      for await (const chunk of stream) {
        const lastMessage = chunk.messages.at(-1);
        if (lastMessage?.content && typeof lastMessage.content === 'string') {
          res.write(JSON.stringify({ message: lastMessage.content }) + '\n');
        }
        // else if (lastMessage?.tool_calls) {
        //   const toolCallNames = lastMessage.tool_calls.map(
        //     (tc: any) => tc.tool_name,
        //   );
        //   res.write(JSON.stringify({ tool_calls: toolCallNames }) + '\n');
        // }
      }
      res.end();
    } else {
      const assistantResponse = await getChatResponse(userQuery, interactionID);
      res.status(200).json({
        message:
          assistantResponse.messages[assistantResponse.messages.length - 1]
            ?.content,
      });
    }
  } catch (error) {
    next(error);
  }
};
