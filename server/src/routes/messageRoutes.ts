import { Router } from 'express';
import messageController from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/:conversationId', messageController.getMessages);
router.post('/:conversationId/read', messageController.markAsRead);

export default router;
