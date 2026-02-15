import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";

import * as fs from "fs";
import * as path from "path";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Backup Scheduler Cron Job
 * Triggers database backups. Runs daily at 1 AM.
 *
 * Features:
 * - Automatic pg_dump backup
 * - Backup rotation (keeps last 7 days)
 * - Compression with gzip
 */
@Injectable()
export class BackupSchedulerCron {
  private readonly logger = new Logger(BackupSchedulerCron.name);
  private readonly backupDir: string;
  private readonly maxBackups: number = 7;

  constructor(private readonly configService: ConfigService) {
    this.backupDir = this.configService.get<string>(
      "BACKUP_DIR",
      "/var/backups/kahade",
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async run(): Promise<void> {
    this.logger.log("Starting scheduled database backup...");

    try {
      // Ensure backup directory exists
      await this.ensureBackupDir();

      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFile = path.join(
        this.backupDir,
        `kahade_backup_${timestamp}.sql.gz`,
      );

      // Get database URL
      const databaseUrl = this.configService.get<string>("DATABASE_URL");
      if (!databaseUrl) {
        this.logger.error("DATABASE_URL not configured, skipping backup");
        return;
      }

      // Execute pg_dump with compression
      const command = `pg_dump "${databaseUrl}" | gzip > "${backupFile}"`;

      this.logger.log(`Creating backup: ${backupFile}`);
      await execAsync(command);

      // Verify backup was created
      if (fs.existsSync(backupFile)) {
        const stats = fs.statSync(backupFile);
        this.logger.log(
          `Backup completed successfully: ${backupFile} (${this.formatBytes(stats.size)})`,
        );

        // Rotate old backups
        await this.rotateBackups();
      } else {
        this.logger.error("Backup file was not created");
      }
    } catch (error: unknown) {
      this.logger.error(`Backup failed: ${(error as Error).message}`);
      // In production, you might want to send an alert here
    }
  }

  private async ensureBackupDir(): Promise<void> {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      this.logger.log(`Created backup directory: ${this.backupDir}`);
    }
  }

  private async rotateBackups(): Promise<void> {
    try {
      const files = fs
        .readdirSync(this.backupDir)
        .filter(
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
          (f: any) => f.startsWith("kahade_backup_") && f.endsWith(".sql.gz"),
          // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        )
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((f: any) => ({
          name: f,
          path: path.join(this.backupDir, f),
          time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      // Remove old backups beyond maxBackups
      if (files.length > this.maxBackups) {
        const toDelete = files.slice(this.maxBackups);
        for (const file of toDelete) {
          fs.unlinkSync(file.path);
          this.logger.log(`Deleted old backup: ${file.name}`);
        }
      }
    } catch (error: unknown) {
      this.logger.warn(`Backup rotation failed: ${(error as Error).message}`);
    }
  }

  private _formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
