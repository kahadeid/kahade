import { FILE_UPLOAD } from '@common/constants/limits.constants';


import * as path from 'path';

import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

/**
 * File Upload Validator (CRIT-013)
 *
 * Validates uploaded files for:
 * - Size limits
 * - MIME type
 * - File extension
 * - Prevents malicious uploads
 */

interface FileValidationOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

@Injectable()
export class FileUploadValidator implements PipeTransform {
  constructor(private options?: FileValidationOptions) {}

  transform(file: Multer["File"]) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const maxSize = this.options?.maxSize || FILE_UPLOAD.MAX_SIZE_BYTES;
    const allowedMimeTypes =
      this.options?.allowedMimeTypes || FILE_UPLOAD.ALLOWED_MIME_TYPES;
    const allowedExtensions = this.options?.allowedExtensions || [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.pdf',
    ];

    // 1. Validate file size
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxSize / 1024 / 1024}MB`,
      );
    }

    // 2. Validate MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    // 3. Validate file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        `File extension ${ext} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
      );
    }

    // 4. Validate filename
    if (file.originalname.includes('..')) {
      throw new BadRequestException('Invalid filename');
    }

    // 5. Check for double extensions (e.g., image.jpg.exe)
    const parts = file.originalname.split('.');
    if (parts.length > 2) {
      throw new BadRequestException(
        'Files with multiple extensions are not allowed',
      );
    }

    // 6. Validate magic bytes — SECURITY FIX (was previously not called)
    if (file.buffer && file.buffer.length > 4) {
      const signatureValid = await FileSignatureChecker.validate(file);
      if (!signatureValid) {
        throw new BadRequestException(
          `File content does not match declared MIME type ${file.mimetype}. Possible file-type spoofing detected.`,
        );
      }
    }

    return file;
  }
}

/**
 * Image File Validator
 */
@Injectable()
export class ImageUploadValidator extends FileUploadValidator {
  constructor() {
    super({
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
    });
  }
}

/**
 * Document File Validator
 */
@Injectable()
export class DocumentUploadValidator extends FileUploadValidator {
  constructor() {
    super({
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['application/pdf'],
      allowedExtensions: ['.pdf'],
    });
  }
}

/**
 * File signature (magic bytes) checker
 */
export class FileSignatureChecker {
  private static readonly SIGNATURES: Record<string, number[]> = {
    'image/jpeg': [0xff, 0xd8, 0xff],
    'image/png': [0x89, 0x50, 0x4e, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'application/pdf': [0x25, 0x50, 0x44, 0x46],
  };

  static async validate(file: Multer["File"]): Promise<boolean> {
    const expectedSignature = this.SIGNATURES[file.mimetype];
    if (!expectedSignature) {
      return true; // No signature to check
    }

    // Read first few bytes of file buffer
    const actualSignature = Array.from(file.buffer.slice(0, expectedSignature.length));

    // Compare signatures
    return expectedSignature.every(
      (byte, index) => byte === actualSignature[index],
    );
  }
}
