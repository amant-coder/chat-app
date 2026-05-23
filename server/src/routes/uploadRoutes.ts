import { Router } from 'express';
import uploadController from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);

router.post('/', uploadLimiter, upload.single('file'), uploadController.uploadFile);

export default router;
