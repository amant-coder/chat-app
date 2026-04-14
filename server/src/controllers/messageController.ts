import { Request, Response, NextFunction } from 'express';
import messageService from '../services/messageService';

class MessageController {
  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = Array.isArray(req.params.conversationId)
        ? req.params.conversationId[0]
        : req.params.conversationId;
      const { cursor, limit } = req.query;

      const result = await messageService.getMessages(
        conversationId,
        req.user!.userId,
        cursor as string | undefined,
        limit ? parseInt(limit as string) : 30
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = Array.isArray(req.params.conversationId)
        ? req.params.conversationId[0]
        : req.params.conversationId;
      const { messageIds } = req.body;

      if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
        res.status(400).json({ error: 'messageIds array is required.' });
        return;
      }

      const count = await messageService.markAsRead(
        conversationId,
        req.user!.userId,
        messageIds
      );

      res.status(200).json({ markedCount: count });
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();
