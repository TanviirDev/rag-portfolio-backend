import { Router } from 'express';
import { uploadRagFile } from '../controllers/ragController.js';
import upload from '../config/multer.js';

const router = Router();

router.post('/uploads', upload.single('rag-file'), uploadRagFile);

export default router;
