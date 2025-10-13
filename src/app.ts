import express from 'express';
import bookRoutes from './routes/bookRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import { connectMongoDB } from './config/mongoDb.js';

const app = express();

await connectMongoDB();

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }),
);

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('API is running');
});

// app.post(
//   '/upload',
//   upload.single('rag-file'),
//   (req: Request, res: Response, next: NextFunction) => {
//     console.log('Uploaded file:', req.file);
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }
//     res.status(200).json({
//       message: 'File uploaded successfully',
//       filename: req.file.filename,
//       originalname: req.file.originalname,
//       size: req.file.size,
//     });
//   },
// );

app.use('/books', bookRoutes);
app.use(errorHandler);

export default app;
