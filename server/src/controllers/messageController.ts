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

  async searchMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = Array.isArray(req.params.conversationId)
        ? req.params.conversationId[0]
        : req.params.conversationId;
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({ error: 'Search query "q" is required.' });
        return;
      }

      const messages = await messageService.searchMessages(
        conversationId,
        req.user!.userId,
        q
      );

      res.status(200).json({ messages });
    } catch (error) {
      next(error);
    }
  }

  async togglePin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = Array.isArray(req.params.conversationId)
        ? req.params.conversationId[0]
        : req.params.conversationId;
      const messageId = Array.isArray(req.params.messageId)
        ? req.params.messageId[0]
        : req.params.messageId;
      const message = await messageService.togglePin(
        conversationId,
        req.user!.userId,
        messageId
      );
      res.status(200).json(message);
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();
