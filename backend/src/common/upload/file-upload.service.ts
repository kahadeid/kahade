import { Injectable, BadRequestException } from '@nestjs/common';
import { Express } from 'express';


import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';


/**
 * File Upload Security (HIGH-032)
 *
 * Features:
 * - File type validation (MIME + extension)
 * - File size limits
 * - Virus scanning (placeholder)
 * - Secure filename generation
 * - Storage organization
 * - Image optimization
 */

interface UploadOptions {
  maxSize?: number; // bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  destination?: string;
}

interface UploadResult {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
}

@Injectable()
export class FileUploadService {
  private readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly UPLOAD_DIR = 'uploads';

  /**
   * Upload file with security checks
   */
  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    // Validate file exists
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Check file size
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxSize / 1024 / 1024}MB`,
      );
    }

    // Validate MIME type
    if (options.allowedMimeTypes) {
      if (!options.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File type ${file.mimetype} not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`,
        );
      }
    }

    // Validate extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (options.allowedExtensions) {
      if (!options.allowedExtensions.includes(ext)) {
        throw new BadRequestException(
          `File extension ${ext} not allowed. Allowed extensions: ${options.allowedExtensions.join(', ')}`,
        );
      }
    }

    // Scan for viruses (placeholder - integrate with ClamAV or similar)
    // Await this.scanForViruses(file);

    // Generate secure filename
    const secureFilename = this.generateSecureFilename(ext);

    // Determine destination
    const destination =
      options.destination || this.getDestinationByMimeType(file.mimetype);
    const fullPath = path.join(this.UPLOAD_DIR, destination);

    // Ensure directory exists
    await fs.mkdir(fullPath, { recursive: true });

    // Save file
    const filePath = path.join(fullPath, secureFilename);
    await fs.writeFile(filePath, file.buffer);

    // Generate URL
    const url = `/${this.UPLOAD_DIR}/${destination}/${secureFilename}`;

    return {
      filename: secureFilename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
      url,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    options: UploadOptions = {},
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadFile(file, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist, ignore
    }
  }

  /**
   * Generate secure filename
   */
  private generateSecureFilename(extension: string): string {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    return `${timestamp}-${randomBytes}${extension}`;
  }

  /**
   * Get destination folder by MIME type
   */
  private getDestinationByMimeType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'videos';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'documents';
    return 'files';
  }

  /**
   * Validate image
   */
  async validateImage(file: Express.Multer.File): Promise<void> {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image format');
    }
  }
}

/**
 * Multer configuration for file uploads
 */
export const multerConfig = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10, // Max 10 files
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    // Basic MIME type check
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new BadRequestException('File type not allowed'), false);
    }
  },
};

/**
 * Example usage:
 *
 * @Post('upload')
 * @UseInterceptors(FileInterceptor('file'))
 * async uploadFile(
 *   @UploadedFile() file: Express.Multer.File,
 * ) {
 *   const result = await this.fileUploadService.uploadFile(file, {
 *     maxSize: 10 * 1024 * 1024, // 10MB
 *     allowedMimeTypes: ['image/jpeg', 'image/png'],
 *     allowedExtensions: ['.jpg', '.jpeg', '.png'],
 *   });
 *
 *   return { url: result.url };
 * }
 */
