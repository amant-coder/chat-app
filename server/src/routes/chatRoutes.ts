import { Router } from 'express';
import chatController from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', chatController.getConversations);
router.post('/', chatController.getOrCreateConversation);
router.post('/groups', chatController.createGroup);
router.post('/groups/:conversationId/participants', chatController.addGroupParticipant);
router.get('/:conversationId', chatController.getConversation);

export default router;
