import { Router } from 'express';
import { handleChatQuery } from '@/controllers/chatQueryController.js';

const router = Router();

router.post('/chats', handleChatQuery);

export default router;
