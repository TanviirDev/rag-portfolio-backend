import type { Request, Response, NextFunction } from 'express';
import {
  getChatResponse,
  streamChatResponse,
} from '../service/chatQueryService.js';
import e from 'express';
import { AIMessageChunk } from 'langchain';

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
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
      const stream = await streamChatResponse(userQuery, interactionID);
      for await (const chunk of stream) {
        // console.log(chunk);
        if (chunk && Array.isArray(chunk) && chunk.length > 0) {
          const aiMessage =
            chunk[0] instanceof AIMessageChunk ? chunk[0].content : null;
          if (aiMessage && typeof aiMessage === 'string') {
            res.write(JSON.stringify({ message: aiMessage }) + '\n');
          }
        }
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
