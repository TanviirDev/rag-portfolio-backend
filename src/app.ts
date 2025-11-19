import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectMongoDB } from './config/mongoDb.js';
import ragRouter from './routes/ragRoutes.js';
import userChatQueryRouter from './routes/userChatQueryRoutes.js';

const app = express();

await connectMongoDB();

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }),
);

app.use(express.json());

app.use(ragRouter);
app.use(userChatQueryRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('API is running');
});
// app.get('/stream', (req: Request, res: Response) => {
//   res.setHeader('Content-Type', 'text/event-stream');
//   res.setHeader('Cache-Control', 'no-cache');
//   res.setHeader('Connection', 'keep-alive');
//   res.flushHeaders();
//   res.write('data: Hello, this is a stream!\n\n');
//   res.write('data: Another message!\n\n');
//   res.write('data: Final message!\n\n');
//   res.end();
// });

app.use(errorHandler);

export default app;
