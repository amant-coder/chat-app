import { Router } from 'express';
import chatController from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', chatController.getConversations);
router.post('/', chatController.getOrCreateConversation);
router.get('/:conversationId', chatController.getConversation);

export default router;
