import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';



@Injectable()
export class FileValidationMiddleware implements NestMiddleware {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    if (!req.file && !req.files) {
      return next();
    }

    const files = this.getFiles(req);

    for (const file of files) {
      if (file.size > this.MAX_FILE_SIZE) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds maximum size of 10MB`
        );
      }

      if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `File type ${file.mimetype} is not allowed`
        );
      }
    }

    next();
  }

  private _getFiles(req: Request): Multer["File"][] {
    if (req.file) {
      return [req.file];
    }
    if (req.files) {
      if (Array.isArray(req.files)) {
        return req.files;
      }
      return Object.values(req.files).flat();
    }
    return [];
  }
}
