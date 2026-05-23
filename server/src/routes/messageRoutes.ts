import { Router } from 'express';
import messageController from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/:conversationId', messageController.getMessages);
router.get('/:conversationId/search', messageController.searchMessages);
router.post('/:conversationId/pin/:messageId', messageController.togglePin);
router.post('/:conversationId/read', messageController.markAsRead);

export default router;
