import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";

import * as fs from "fs";
import * as path from "path";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadPath: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadPath = this.configService.get<string>(
      "UPLOAD_DEST",
      "./uploads",
    );
    this.ensureUploadDirectory();
  }

  private _ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadPath}`);
    }
  }

  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Eslint-disable-next-line @typescript-eslint/no-explicit-any
  async upload(file: any): Promise<string> {
    try {
    const ext = path.extname(file.originalname);
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    const filename = `${Date.now()}-${safeName}${ext}`;
    const filepath = path.join(this.uploadPath, filename);

    // Ensure we are still within the upload directory
    if (!filepath.startsWith(path.resolve(this.uploadPath))) {
      throw new Error("Invalid file path");
    }

    fs.writeFileSync(filepath, file.buffer);

    this.logger.log(`File uploaded: ${filename}`);
    return `/uploads/${filename}`;
  }

  /**
   * Delete
   */
  async delete(filename: string): Promise<void> {
    try {
    const safeFilename = path.basename(filename);
    const filepath = path.join(this.uploadPath, safeFilename);

    if (
      fs.existsSync(filepath) &&
      filepath.startsWith(path.resolve(this.uploadPath))
    ) {
      fs.unlinkSync(filepath);
      this.logger.log(`File deleted: ${safeFilename}`);
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }
  }

  /**
   * Get
   */
  async get(filename: string): Promise<Buffer> {
    try {
    const safeFilename = path.basename(filename);
    const filepath = path.join(this.uploadPath, safeFilename);

    if (!filepath.startsWith(path.resolve(this.uploadPath))) {
      throw new Error("Invalid file path");
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }

    return fs.readFileSync(filepath);
  }
}
