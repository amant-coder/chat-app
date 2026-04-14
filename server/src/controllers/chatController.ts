import { Request, Response, NextFunction } from 'express';
import chatService from '../services/chatService';

class ChatController {
  async getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversations = await chatService.getUserConversations(req.user!.userId);
      res.status(200).json(conversations);
    } catch (error) {
      next(error);
    }
  }

  async getOrCreateConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required.' });
        return;
      }
      const conversation = await chatService.getOrCreateConversation(req.user!.userId, userId);
      res.status(200).json(conversation);
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = Array.isArray(req.params.conversationId)
        ? req.params.conversationId[0]
        : req.params.conversationId;

      const conversation = await chatService.getConversation(
        conversationId,
        req.user!.userId
      );
      res.status(200).json(conversation);
    } catch (error) {
      next(error);
    }
  }
}

export default new ChatController();
