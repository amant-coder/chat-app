import { Request, Response, NextFunction } from 'express';
import uploadService from '../services/uploadService';

class UploadController {
  async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided.' });
        return;
      }

      const result = await uploadService.uploadFile(req.file);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new UploadController();
