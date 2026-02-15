import { Logger } from '@nestjs/common';


import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

/**
 * Async File Operations Utility
 *
 * Provides async alternatives to synchronous fs operations.
 * NEVER use sync operations (readFileSync, writeFileSync, etc.) as they block the event loop.
 *
 * Usage:
 * ```typescript
 * // ❌ Bad
 * const data = fs.readFileSync('file.txt', 'utf-8');
 *
 * // ✅ Good
 * const data = await FileUtil.readFile('file.txt', 'utf-8');
 * ```
 */
export class FileUtil {
  private static readonly logger = new Logger('FileUtil');

  /**
   * Read file asynchronously
   */
  static async readFile(
    filePath: string,
    encoding: BufferEncoding = 'utf-8',
  ): Promise<string> {
    try {
      return await fs.readFile(filePath, encoding);
    } catch (error) {
      this.logger.error(`Failed to read file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Write file asynchronously
   */
  static async writeFile(
    filePath: string,
    data: string | Buffer,
    options?: { encoding?: BufferEncoding; mode?: number },
  ): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await this.ensureDir(dir);

      await fs.writeFile(filePath, data, options);
    } catch (error) {
      this.logger.error(`Failed to write file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Append to file asynchronously
   */
  static async appendFile(
    filePath: string,
    data: string | Buffer,
    options?: { encoding?: BufferEncoding },
  ): Promise<void> {
    try {
      await fs.appendFile(filePath, data, options);
    } catch (error) {
      this.logger.error(`Failed to append to file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Check if file exists asynchronously
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete file asynchronously
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      if (await this.exists(filePath)) {
        await fs.unlink(filePath);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Read directory asynchronously
   */
  static async readDir(dirPath: string): Promise<string[]> {
    try {
      return await fs.readdir(dirPath);
    } catch (error) {
      this.logger.error(`Failed to read directory: ${dirPath}`, error);
      throw error;
    }
  }

  /**
   * Create directory asynchronously (recursive)
   */
  static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create directory: ${dirPath}`, error);
      throw error;
    }
  }

  /**
   * Get file stats asynchronously
   */
  static async stat(filePath: string): Promise<fs.FileHandle | any> {
    try {
      return await fs.stat(filePath);
    } catch (error) {
      this.logger.error(`Failed to get file stats: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Copy file asynchronously
   */
  static async copyFile(source: string, destination: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destination);
      await this.ensureDir(destDir);

      await fs.copyFile(source, destination);
    } catch (error) {
      this.logger.error(
        `Failed to copy file from ${source} to ${destination}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Move/rename file asynchronously
   */
  static async moveFile(source: string, destination: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destination);
      await this.ensureDir(destDir);

      await fs.rename(source, destination);
    } catch (error) {
      this.logger.error(
        `Failed to move file from ${source} to ${destination}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Read JSON file asynchronously
   */
  static async readJSON<T = any>(filePath: string): Promise<T> {
    try {
      const content = await this.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      this.logger.error(`Failed to read JSON file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Write JSON file asynchronously
   */
  static async writeJSON(
    filePath: string,
    data: unknown,
    options?: { pretty?: boolean },
  ): Promise<void> {
    try {
      const content = options?.pretty
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);
      await this.writeFile(filePath, content, { encoding: 'utf-8' });
    } catch (error) {
      this.logger.error(`Failed to write JSON file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Get file size asynchronously
   */
  static async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await this.stat(filePath);
      return stats.size;
    } catch (error) {
      this.logger.error(`Failed to get file size: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Check if path is a directory
   */
  static async isDirectory(dirPath: string): Promise<boolean> {
    try {
      const stats = await this.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Check if path is a file
   */
  static async isFile(filePath: string): Promise<boolean> {
    try {
      const stats = await this.stat(filePath);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  /**
   * Read file with size limit (prevent memory issues)
   */
  static async readFileSafe(
    filePath: string,
    maxSize: number = 10 * 1024 * 1024, // 10MB default
  ): Promise<string> {
    const size = await this.getFileSize(filePath);
    if (size > maxSize) {
      throw new Error(
        `File too large: ${size} bytes (max: ${maxSize} bytes)`,
      );
    }
    return await this.readFile(filePath);
  }

  /**
   * Stream large file (for files > 10MB)
   */
  static createReadStream(filePath: string): fsSync.ReadStream {
    return fsSync.createReadStream(filePath);
  }

  /**
   * Stream write large file
   */
  static createWriteStream(filePath: string): fsSync.WriteStream {
    return fsSync.createWriteStream(filePath);
  }
}

/**
 * MIGRATION GUIDE
 *
 * Replace synchronous operations:
 *
 * ❌ fs.readFileSync() → ✅ await FileUtil.readFile()
 * ❌ fs.writeFileSync() → ✅ await FileUtil.writeFile()
 * ❌ fs.existsSync() → ✅ await FileUtil.exists()
 * ❌ fs.mkdirSync() → ✅ await FileUtil.ensureDir()
 * ❌ fs.readdirSync() → ✅ await FileUtil.readDir()
 * ❌ fs.statSync() → ✅ await FileUtil.stat()
 * ❌ fs.unlinkSync() → ✅ await FileUtil.deleteFile()
 * ❌ fs.renameSync() → ✅ await FileUtil.moveFile()
 * ❌ fs.copyFileSync() → ✅ await FileUtil.copyFile()
 */
