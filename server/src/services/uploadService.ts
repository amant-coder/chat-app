import cloudinary from '../config/cloudinary';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

class UploadService {
  async uploadFile(file: Express.Multer.File): Promise<{
    url: string;
    publicId: string;
    fileName: string;
    fileSize: number;
  }> {
    try {
      // Determine resource type based on mime
      const isImage = file.mimetype.startsWith('image/');
      const resourceType = isImage ? 'image' : 'raw';

      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: 'pulse-chat',
            public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
            ...(isImage && {
              transformation: [
                { quality: 'auto', fetch_format: 'auto' },
                { width: 1200, crop: 'limit' },
              ],
            }),
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });

      logger.info(`File uploaded: ${result.public_id}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        fileName: file.originalname,
        fileSize: file.size,
      };
    } catch (error: any) {
      logger.error('File upload error:', {
        message: error?.message,
        http_code: error?.http_code,
        name: error?.name,
        full: error,
      });
      const detail = error?.message || 'Unknown Cloudinary error';
      throw new AppError(`Failed to upload file: ${detail}`, error?.http_code || 500);
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info(`File deleted: ${publicId}`);
    } catch (error) {
      logger.error('File deletion error:', error);
    }
  }
}

export default new UploadService();
