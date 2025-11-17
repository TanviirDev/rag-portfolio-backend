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
    const userQuery = req.body.query;
    const interactionID = req.body.interactionID;
    if (isStream) {
      const stream = await streamChatResponse(userQuery, interactionID);
      res.status(200);
      for await (const chunk of stream) {
        res.write(JSON.stringify(chunk));
      }
      res.end();
    } else {
      const response = await getChatResponse(userQuery, interactionID);
      res.status(200).json({ response });
    }
  } catch (error) {
    next(error);
  }
};
