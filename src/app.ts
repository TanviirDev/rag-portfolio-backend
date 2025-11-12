import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectMongoDB } from './config/mongoDb.js';
import ragRouter from './routes/ragRoutes.js';

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

app.get('/', (req: Request, res: Response) => {
  res.send('API is running');
});

app.use(errorHandler);

export default app;
