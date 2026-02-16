import { registerAs } from '@nestjs/config';

export default registerAs('upload', () => ({
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,application/pdf').split(','),
}));
