const fs = require('fs');
const path = require('path');

const fixes = {};

// 1. src/app.service.ts - try/catch injected into return type definitions
fixes['src/app.service.ts'] = (content) => {
  // Fix getDetailedHealth return type - remove try { and catch block from type definition
  content = content.replace(
    `async getDetailedHealth(): Promise<{
    try {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    dependencies: {
      database: { status: string; latency?: number; error?: string };
      memory: {
        status: string;
        used: number;
        total: number;
        percentage: number;
      };
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    };
  }>`,
    `async getDetailedHealth(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    dependencies: {
      database: { status: string; latency?: number; error?: string };
      memory: {
        status: string;
        used: number;
        total: number;
        percentage: number;
      };
    };
  }>`
  );

  // Fix getReadiness return type
  content = content.replace(
    `async getReadiness(): Promise<{
    try {
    ready: boolean;
    checks: Record<string, boolean>;
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  }>`,
    `async getReadiness(): Promise<{
    ready: boolean;
    checks: Record<string, boolean>;
  }>`
  );

  return content;
};

// 2. src/common/cache/advanced-cache.service.ts
fixes['src/common/cache/advanced-cache.service.ts'] = (content) => {
  // Fix delete method - try without catch, then catch appears after next JSDoc
  content = content.replace(
    `async delete(key: string): Promise<void> {
    try {
    await this.redis.del(key);
  }

  /**
   * Delete by pattern
   */
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  /**
   * Deletebypattern
   */`,
    `async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Delete by pattern
   */`
  );

  // Fix deleteByPattern
  content = content.replace(
    `async deleteByPattern(pattern: string): Promise<void> {
    try {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    }
  }`,
    `async deleteByPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }`
  );

  // Fix invalidateByTags
  content = content.replace(
    `async invalidateByTags(tags: string[]): Promise<void> {
    try {
    for (const tag of tags) {
      await this.deleteByPattern(\`*:tag:\${tag}:*\`);
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    }
  }`,
    `async invalidateByTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      await this.deleteByPattern(\`*:tag:\${tag}:*\`);
    }
  }`
  );

  return content;
};

// 3. src/common/cache/cache.service.ts
fixes['src/common/cache/cache.service.ts'] = (content) => {
  // Fix invalidateUser
  content = content.replace(
    `async invalidateUser(userId: string): Promise<void> {
    try {
    await Promise.all([
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
      this.del(\`\${CacheKey.USER_BY_ID}:\${userId}\`),`,
    `async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      this.del(\`\${CacheKey.USER_BY_ID}:\${userId}\`),`
  );

  // Fix invalidateWallet
  content = content.replace(
    `async invalidateWallet(walletId: string, userId: string): Promise<void> {
    try {
    await Promise.all([
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
      this.del(\`\${CacheKey.WALLET_BY_ID}:\${walletId}\`),`,
    `async invalidateWallet(walletId: string, userId: string): Promise<void> {
    await Promise.all([
      this.del(\`\${CacheKey.WALLET_BY_ID}:\${walletId}\`),`
  );

  // Fix warmUpCache
  content = content.replace(
    `async warmUpCache(data: { key: string; value: any; ttl?: number }[]): Promise<void> {
    try {
    await Promise.all(
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
      data.map(({ key, value, ttl }) => this.set(key, value, ttl)),`,
    `async warmUpCache(data: { key: string; value: any; ttl?: number }[]): Promise<void> {
    await Promise.all(
      data.map(({ key, value, ttl }) => this.set(key, value, ttl)),`
  );

  return content;
};

// 4. src/common/lifecycle/graceful-shutdown.service.ts
fixes['src/common/lifecycle/graceful-shutdown.service.ts'] = (content) => {
  content = content.replace(
    `private async waitForPendingRequests(): Promise<void> {
    try {
    // NOTE: Implement request tracking - Tracked in backlog
    // For now, just wait a bit
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  /**
   * Run all registered cleanup callbacks
   */
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  private async runCleanupCallbacks(): Promise<void> {`,
    `private async waitForPendingRequests(): Promise<void> {
    // NOTE: Implement request tracking - Tracked in backlog
    // For now, just wait a bit
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  /**
   * Run all registered cleanup callbacks
   */
  private async runCleanupCallbacks(): Promise<void> {`
  );

  return content;
};

// 5. src/common/monitoring/security-monitor.service.ts
fixes['src/common/monitoring/security-monitor.service.ts'] = (content) => {
  // Fix logEvent
  content = content.replace(
    `async logEvent(event: SecurityEvent): Promise<void> {
    try {
    this.logger.warn(
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
      \`[SECURITY] \${event.severity} - \${event.type}\`,`,
    `async logEvent(event: SecurityEvent): Promise<void> {
    this.logger.warn(
      \`[SECURITY] \${event.severity} - \${event.type}\`,`
  );

  // Fix sendAlert
  content = content.replace(
    `private async sendAlert(event: SecurityEvent): Promise<void> {
    try {
    // Example: Send to Slack, email, or SMS
    this.logger.error(
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
      \`[CRITICAL SECURITY ALERT] \${event.type}\`,`,
    `private async sendAlert(event: SecurityEvent): Promise<void> {
    // Example: Send to Slack, email, or SMS
    this.logger.error(
      \`[CRITICAL SECURITY ALERT] \${event.type}\`,`
  );

  // Fix checkSuspiciousActivity return type
  content = content.replace(
    `async checkSuspiciousActivity(userId: string): Promise<{
    try {
    isSuspicious: boolean;
    reasons: string[];
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  }>`,
    `async checkSuspiciousActivity(userId: string): Promise<{
    isSuspicious: boolean;
    reasons: string[];
  }>`
  );

  return content;
};

// 6. src/common/queue/job.service.ts
fixes['src/common/queue/job.service.ts'] = (content) => {
  // Fix processNextJob
  content = content.replace(
    `private async processNextJob(): Promise<void> {
    try {
    if (this.processing || this.queue.length === 0) {
      return;
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    }`,
    `private async processNextJob(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }`
  );

  // Fix missing semicolon
  content = content.replace(
    `const job = this.queue.shift()!
    job.status`,
    `const job = this.queue.shift()!;
    job.status`
  );

  // Fix catch type annotation
  content = content.replace(
    `} catch (error: Error) {`,
    `} catch (error: any) {`
  );

  // Fix processJob
  content = content.replace(
    `private async processJob(job: Job): Promise<any> {
    try {
    return new Promise((resolve, reject) => {
      const listeners = this.listeners(\`job:process:\${job.type}\`);

      if (listeners.length === 0) {
        reject(new Error(\`No handler registered for job type: \${job.type}\`));
        return;
      }

      const handler = listeners[0] as (data: unknown) => Promise<any>;
      handler(job.data)
        .then(resolve)
        .catch(reject);
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });
  }`,
    `private async processJob(job: Job): Promise<any> {
    return new Promise((resolve, reject) => {
      const listeners = this.listeners(\`job:process:\${job.type}\`);

      if (listeners.length === 0) {
        reject(new Error(\`No handler registered for job type: \${job.type}\`));
        return;
      }

      const handler = listeners[0] as (data: unknown) => Promise<any>;
      handler(job.data)
        .then(resolve)
        .catch(reject);
    });
  }`
  );

  return content;
};

// 7. src/common/security/secrets.service.ts
fixes['src/common/security/secrets.service.ts'] = (content) => {
  content = content.replace(
    `async hashPassword(password: string, salt?: string): Promise<string> {
    try {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, actualSalt, 100000, 64, 'sha512', (err, key) => {
        if (err) reject(err);
        resolve(\`\${actualSalt}:\${key.toString('hex')}\`);
      });
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });
  }`,
    `async hashPassword(password: string, salt?: string): Promise<string> {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, actualSalt, 100000, 64, 'sha512', (err, key) => {
        if (err) reject(err);
        resolve(\`\${actualSalt}:\${key.toString('hex')}\`);
      });
    });
  }`
  );

  return content;
};

// 8. src/common/services/session-management.service.ts
fixes['src/common/services/session-management.service.ts'] = (content) => {
  // Fix invalidateSession
  content = content.replace(
    `async invalidateSession(sessionId: string): Promise<void> {
    try {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async invalidateSession(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });`
  );

  // Fix invalidateUserSessions
  content = content.replace(
    `async invalidateUserSessions(userId: string): Promise<number> {
    try {
    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: { isActive: false },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async invalidateUserSessions(userId: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: { isActive: false },
    });`
  );

  // Fix cleanupExpiredSessions
  content = content.replace(
    `async cleanupExpiredSessions(): Promise<void> {
    try {
    const cutoffDate = new Date(
      Date.now() - this.SESSION_INACTIVITY_DAYS * 24 * 60 * 60 * 1000,
    );

    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [
          { isActive: false },
          { expiresAt: { lt: new Date() } },
          { maxLifetime: { lt: new Date() } },
          { lastActivityAt: { lt: cutoffDate } },
        ],
      },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async cleanupExpiredSessions(): Promise<void> {
    const cutoffDate = new Date(
      Date.now() - this.SESSION_INACTIVITY_DAYS * 24 * 60 * 60 * 1000,
    );

    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [
          { isActive: false },
          { expiresAt: { lt: new Date() } },
          { maxLifetime: { lt: new Date() } },
          { lastActivityAt: { lt: cutoffDate } },
        ],
      },
    });`
  );

  return content;
};

// 9. src/common/upload/file-upload.service.ts
fixes['src/common/upload/file-upload.service.ts'] = (content) => {
  content = content.replace(
    `async validateImage(file: Express.Multer.File): Promise<void> {
    try {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image format');
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    }

  }`,
    `async validateImage(file: Express.Multer.File): Promise<void> {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image format');
    }
  }`
  );

  return content;
};

// 10. src/common/webhook/webhook-security.service.ts
fixes['src/common/webhook/webhook-security.service.ts'] = (content) => {
  // Fix import
  content = content.replace(
    `import { Injectable, UnauthorizedException } , Logger from '@nestjs/common';`,
    `import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';`
  );

  return content;
};

// 11. src/config/config.validation.ts
fixes['src/config/config.validation.ts'] = (content) => {
  // Fix the broken template literal in the else branch
  content = content.replace(
    `} else {
      // In development, just warn
      }\`,
      );
    }`,
    `} else {
      // In development, just warn
      console.warn(
        \`Configuration validation warnings:\\n\${errorMessages.join("\\n")}\`,
      );
    }`
  );

  return content;
};

// 12. src/core/auth/account-lockout.service.ts
fixes['src/core/auth/account-lockout.service.ts'] = (content) => {
  // Fix checkLockout
  content = content.replace(
    `async checkLockout(identifier: string): Promise<LockoutStatus> {
    try {
    const key = this.buildKey(identifier);
    const record = await this.cacheManager.get<FailedAttemptRecord>(key);

    if (!record) {
      return { isLocked: false };
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    }`,
    `async checkLockout(identifier: string): Promise<LockoutStatus> {
    const key = this.buildKey(identifier);
    const record = await this.cacheManager.get<FailedAttemptRecord>(key);

    if (!record) {
      return { isLocked: false };
    }`
  );

  // Fix recordFailedAttempt
  content = content.replace(
    `async recordFailedAttempt(identifier: string): Promise<boolean> {
    try {
    const key = this.buildKey(identifier);
    const now = Date.now();

    let record = await this.cacheManager.get<FailedAttemptRecord>(key);

    if (!record) {
      // First failed attempt
      record = { count: 1, lastAttempt: now };
      await this.cacheManager.set(key, record, this.attemptWindowMs);
      return false;
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    }`,
    `async recordFailedAttempt(identifier: string): Promise<boolean> {
    const key = this.buildKey(identifier);
    const now = Date.now();

    let record = await this.cacheManager.get<FailedAttemptRecord>(key);

    if (!record) {
      // First failed attempt
      record = { count: 1, lastAttempt: now };
      await this.cacheManager.set(key, record, this.attemptWindowMs);
      return false;
    }`
  );

  // Fix clearFailedAttempts
  content = content.replace(
    `async clearFailedAttempts(identifier: string): Promise<void> {
    try {
    const key = this.buildKey(identifier);
    await this.cacheManager.del(key);
  }

  /**
   * Manually lock an account (admin action)
   */
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  /**
   * Lockaccount
   */`,
    `async clearFailedAttempts(identifier: string): Promise<void> {
    const key = this.buildKey(identifier);
    await this.cacheManager.del(key);
  }

  /**
   * Manually lock an account (admin action)
   */`
  );

  // Fix lockAccount
  content = content.replace(
    `async lockAccount(identifier: string, durationMs?: number): Promise<void> {
    try {
    const key = this.buildKey(identifier);
    const duration = durationMs || this.lockoutDurationMs;
    const now = Date.now();

    const record: FailedAttemptRecord = {
      count: this.maxFailedAttempts,
      lastAttempt: now,
      lockedUntil: now + duration,
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    };`,
    `async lockAccount(identifier: string, durationMs?: number): Promise<void> {
    const key = this.buildKey(identifier);
    const duration = durationMs || this.lockoutDurationMs;
    const now = Date.now();

    const record: FailedAttemptRecord = {
      count: this.maxFailedAttempts,
      lastAttempt: now,
      lockedUntil: now + duration,
    };`
  );

  // Fix unlockAccount
  content = content.replace(
    `async unlockAccount(identifier: string): Promise<void> {
    try {
    const key = this.buildKey(identifier);
    await this.cacheManager.del(key);
    this.logger.log(
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
      \`Account \${this.maskIdentifier(identifier)} manually unlocked\`,
    );
  }`,
    `async unlockAccount(identifier: string): Promise<void> {
    const key = this.buildKey(identifier);
    await this.cacheManager.del(key);
    this.logger.log(
      \`Account \${this.maskIdentifier(identifier)} manually unlocked\`,
    );
  }`
  );

  // Fix getRemainingAttempts
  content = content.replace(
    `async getRemainingAttempts(identifier: string): Promise<number> {
    try {
    const key = this.buildKey(identifier);
    const record = await this.cacheManager.get<FailedAttemptRecord>(key);

    if (!record) {
      return this.maxFailedAttempts;
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    }`,
    `async getRemainingAttempts(identifier: string): Promise<number> {
    const key = this.buildKey(identifier);
    const record = await this.cacheManager.get<FailedAttemptRecord>(key);

    if (!record) {
      return this.maxFailedAttempts;
    }`
  );

  return content;
};

// 13. src/core/auth/brute-force.service.ts
fixes['src/core/auth/brute-force.service.ts'] = (content) => {
  content = content.replace(
    `async getRemainingAttempts(identifier: string): Promise<number> {
    try {
    const status = await this.checkAccountLock(identifier);
    if (status.isLocked) {
      return 0;
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    }
    return Math.max(0, this.MAX_FAILED_ATTEMPTS - (status.attemptCount || 0));
  }`,
    `async getRemainingAttempts(identifier: string): Promise<number> {
    const status = await this.checkAccountLock(identifier);
    if (status.isLocked) {
      return 0;
    }
    return Math.max(0, this.MAX_FAILED_ATTEMPTS - (status.attemptCount || 0));
  }`
  );

  return content;
};

// 14. src/core/auth/mfa.service.ts - heavily corrupted
fixes['src/core/auth/mfa.service.ts'] = (content) => {
  // Fix generateQRCode + verifyToken
  content = content.replace(
    `async generateQRCode(email: string, secret: string): Promise<string> {
    try {
    const otpauth = authenticator.keyuri(email, this.APP_NAME, secret);
    return QRCode.toDataURL(otpauth);
  }

    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  verifyToken`,
    `async generateQRCode(email: string, secret: string): Promise<string> {
    const otpauth = authenticator.keyuri(email, this.APP_NAME, secret);
    return QRCode.toDataURL(otpauth);
  }

  verifyToken`
  );

  // Fix generateBackupCodes
  content = content.replace(
    `async generateBackupCodes(count: number = this.BACKUP_CODES_COUNT): Promise<string[]> {
    try {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(8).toString('hex').toUpperCase();
      codes.push(code.slice(0, 4) + '-' + code.slice(4, 8));
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    }
    return codes;
  }`,
    `async generateBackupCodes(count: number = this.BACKUP_CODES_COUNT): Promise<string[]> {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(8).toString('hex').toUpperCase();
      codes.push(code.slice(0, 4) + '-' + code.slice(4, 8));
    }
    return codes;
  }`
  );

  // Fix hashBackupCodes
  content = content.replace(
    `async hashBackupCodes(codes: string[]): Promise<string[]> {
    try {
    return Promise.all(codes.map((code) => HashUtil.hashPassword(code)));
  }

    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  private async getOrCreateUserMfa`,
    `async hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(codes.map((code) => HashUtil.hashPassword(code)));
  }

  private async getOrCreateUserMfa`
  );

  // Fix verifyBackupCode
  content = content.replace(
    `async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const userMfa`,
    `async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const userMfa`
  );

  // Fix getMFAStatus
  content = content.replace(
    `async getMFAStatus(userId: string): Promise<{ enabled: boolean; methods: string[]; backupCodesCount: number }> {
    try {
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const userMfa`,
    `async getMFAStatus(userId: string): Promise<{ enabled: boolean; methods: string[]; backupCodesCount: number }> {
    const userMfa`
  );

  // Fix initializeTOTPSetup
  content = content.replace(
    `async initializeTOTPSetup(userId: string, email: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    try {
    const secret = this.generateSecret();
    const qrCode = await this.generateQRCode(email, secret);
    const backupCodes = await this.generateBackupCodes();
    const hashedBackupCodes = await this.hashBackupCodes(backupCodes);
    await this.prisma.userMFA.upsert({
      where: { userId },
      create: { userId, status: MFAStatus.PENDING_SETUP, totpSecret: secret, backupCodes: hashedBackupCodes, backupCodesGeneratedAt: new Date() },
      update: { status: MFAStatus.PENDING_SETUP, totpSecret: secret, backupCodes: hashedBackupCodes, backupCodesGeneratedAt: new Date() },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async initializeTOTPSetup(userId: string, email: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    const secret = this.generateSecret();
    const qrCode = await this.generateQRCode(email, secret);
    const backupCodes = await this.generateBackupCodes();
    const hashedBackupCodes = await this.hashBackupCodes(backupCodes);
    await this.prisma.userMFA.upsert({
      where: { userId },
      create: { userId, status: MFAStatus.PENDING_SETUP, totpSecret: secret, backupCodes: hashedBackupCodes, backupCodesGeneratedAt: new Date() },
      update: { status: MFAStatus.PENDING_SETUP, totpSecret: secret, backupCodes: hashedBackupCodes, backupCodesGeneratedAt: new Date() },
    });`
  );

  // Fix confirmTOTPSetup
  content = content.replace(
    `async confirmTOTPSetup(userId: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const userMfa`,
    `async confirmTOTPSetup(userId: string, code: string): Promise<{ success: boolean; message: string }> {
    const userMfa`
  );

  // Fix verifyMFA
  content = content.replace(
    `async verifyMFA(userId: string, code: string, method: 'totp' | 'email' | 'sms' = 'totp'): Promise<{ verified: boolean; message: string }> {
    try {
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const userMfa`,
    `async verifyMFA(userId: string, code: string, method: 'totp' | 'email' | 'sms' = 'totp'): Promise<{ verified: boolean; message: string }> {
    const userMfa`
  );

  // Fix disableMFA
  content = content.replace(
    `async disableMFA(userId: string, code: string, method: 'totp' | 'email' | 'sms' = 'totp'): Promise<{ success: boolean; message: string }> {
    try {
    const verifyResult = await this.verifyMFA(userId, code, method);
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    if (!verifyResult.verified)`,
    `async disableMFA(userId: string, code: string, method: 'totp' | 'email' | 'sms' = 'totp'): Promise<{ success: boolean; message: string }> {
    const verifyResult = await this.verifyMFA(userId, code, method);
    if (!verifyResult.verified)`
  );

  // Fix sendOTP
  content = content.replace(
    `async sendOTP(userId: string, method: 'sms' | 'email', ip: string, userAgent: string): Promise<{ message: string }> {
    try {
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const user`,
    `async sendOTP(userId: string, method: 'sms' | 'email', ip: string, userAgent: string): Promise<{ message: string }> {
    const user`
  );

  // Fix verifyOTP
  content = content.replace(
    `async verifyOTP(userId: string, code: string, method: 'sms' | 'email'): Promise<{ verified: boolean; message: string }> {
    try {
    const mfaMethod = method === 'sms' ? MFAMethod.SMS : MFAMethod.EMAIL;
    const challenge = await this.prisma.mFAChallenge.findFirst({
      where: { userId, method: mfaMethod, isUsed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async verifyOTP(userId: string, code: string, method: 'sms' | 'email'): Promise<{ verified: boolean; message: string }> {
    const mfaMethod = method === 'sms' ? MFAMethod.SMS : MFAMethod.EMAIL;
    const challenge = await this.prisma.mFAChallenge.findFirst({
      where: { userId, method: mfaMethod, isUsed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });`
  );

  // Fix getTrustedDevices
  content = content.replace(
    `async getTrustedDevices(userId: string): Promise<any[]> {
    try {
    return this.prisma.trustedDevice.findMany({
      where: { userId, isActive: true },
      orderBy: { lastUsedAt: 'desc' },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });
  }`,
    `async getTrustedDevices(userId: string): Promise<any[]> {
    return this.prisma.trustedDevice.findMany({
      where: { userId, isActive: true },
      orderBy: { lastUsedAt: 'desc' },
    });
  }`
  );

  // Fix trustDevice
  content = content.replace(
    `async trustDevice(userId: string, deviceInfo: any, ip: string, trustDays: number = 30): Promise<string> {
    try {
    const token = HashUtil.generateToken(32);
    const skipMfaUntil = new Date(Date.now() + trustDays * 24 * 60 * 60 * 1000);
    await this.prisma.trustedDevice.create({
      data: {
        userId,
        deviceToken: token,
        deviceName: deviceInfo.name || deviceInfo.userAgent || 'Unknown Device',
        deviceFingerprint: deviceInfo.fingerprint || ip,
        lastIpAddress: ip,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        skipMfaUntil,
      },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async trustDevice(userId: string, deviceInfo: any, ip: string, trustDays: number = 30): Promise<string> {
    const token = HashUtil.generateToken(32);
    const skipMfaUntil = new Date(Date.now() + trustDays * 24 * 60 * 60 * 1000);
    await this.prisma.trustedDevice.create({
      data: {
        userId,
        deviceToken: token,
        deviceName: deviceInfo.name || deviceInfo.userAgent || 'Unknown Device',
        deviceFingerprint: deviceInfo.fingerprint || ip,
        lastIpAddress: ip,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        skipMfaUntil,
      },
    });`
  );

  // Fix revokeTrustedDevice
  content = content.replace(
    `async revokeTrustedDevice(userId: string, deviceId: string, reason?: string): Promise<{ message: string }> {
    try {
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const device`,
    `async revokeTrustedDevice(userId: string, deviceId: string, reason?: string): Promise<{ message: string }> {
    const device`
  );

  return content;
};

// 15. src/core/auth/password.service.ts
fixes['src/core/auth/password.service.ts'] = (content) => {
  content = content.replace(
    `async hashPassword(password: string): Promise<string> {
    try {
    return HashUtil.hashPassword(password);
  }

  /**
   * Verify a password against a hash
   */
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  /**
   * Verifypassword
   */`,
    `async hashPassword(password: string): Promise<string> {
    return HashUtil.hashPassword(password);
  }

  /**
   * Verify a password against a hash
   */`
  );

  content = content.replace(
    `async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
    return HashUtil.verifyPassword(password, hash);
  }

  /**
   * Check if password meets security requirements
   */
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  validatePasswordStrength`,
    `async verifyPassword(password: string, hash: string): Promise<boolean> {
    return HashUtil.verifyPassword(password, hash);
  }

  /**
   * Check if password meets security requirements
   */
  validatePasswordStrength`
  );

  return content;
};

// 16. src/core/auth/token-blacklist.service.ts
fixes['src/core/auth/token-blacklist.service.ts'] = (content) => {
  content = content.replace(
    `async getStats(): Promise<{
    try {
    blacklistSize: number;
    refreshTokenCount: number;
    usingRedis: boolean;
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  }>`,
    `async getStats(): Promise<{
    blacklistSize: number;
    refreshTokenCount: number;
    usingRedis: boolean;
  }>`
  );

  return content;
};

// 17. src/core/badge/badge.service.ts
fixes['src/core/badge/badge.service.ts'] = (content) => {
  // Fix initializeDefaultBadges
  content = content.replace(
    `async initializeDefaultBadges(): Promise<void> {
    try {
    for (const badge of DEFAULT_BADGES) {
      await this.prisma.badge.upsert({`,
    `async initializeDefaultBadges(): Promise<void> {
    for (const badge of DEFAULT_BADGES) {
      await this.prisma.badge.upsert({`
  );
  content = content.replace(
    `      });
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    }
    this.logger.log(\`Initialized \${DEFAULT_BADGES.length} default badges\`);
  }`,
    `      });
    }
    this.logger.log(\`Initialized \${DEFAULT_BADGES.length} default badges\`);
  }`
  );

  // Fix getAllBadges
  content = content.replace(
    `async getAllBadges(): Promise<any[]> {
    try {
    return this.prisma.badge.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { rarity: "asc" }],
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });
  }`,
    `async getAllBadges(): Promise<any[]> {
    return this.prisma.badge.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { rarity: "asc" }],
    });
  }`
  );

  // Fix getUserBadges
  content = content.replace(
    `async getUserBadges(userId: string): Promise<UserBadgeInfo[]> {
    try {
    const userBadges = await this.prisma.userBadge.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      include: {
        badge: true,
      },
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderBy: [{ displayOrder: "asc" }, { awardedAt: "desc" }],
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async getUserBadges(userId: string): Promise<UserBadgeInfo[]> {
    const userBadges = await this.prisma.userBadge.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      include: {
        badge: true,
      },
      // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderBy: [{ displayOrder: "asc" }, { awardedAt: "desc" }],
    });`
  );

  // Fix checkAndAwardBadges
  content = content.replace(
    `async checkAndAwardBadges(userId: string): Promise<UserBadgeInfo[]> {
    try {
    const awardedBadges: UserBadgeInfo[] = [];

    // Get user stats
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        emailVerifiedAt: true,
        kycStatus: true,
        reputationScore: true,
        totalTransactions: true,
        createdAt: true,
      },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async checkAndAwardBadges(userId: string): Promise<UserBadgeInfo[]> {
    const awardedBadges: UserBadgeInfo[] = [];

    // Get user stats
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        emailVerifiedAt: true,
        kycStatus: true,
        reputationScore: true,
        totalTransactions: true,
        createdAt: true,
      },
    });`
  );

  // Fix getDisplayedBadges
  content = content.replace(
    `async getDisplayedBadges(userId: string): Promise<UserBadgeInfo[]> {
    try {
    const userBadges = await this.prisma.userBadge.findMany({
      where: {
        userId,
        isDisplayed: true,
        revokedAt: null,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      },
      include: { badge: true },
      orderBy: { displayOrder: "asc" },
      take: 5, // Max 5 displayed badges
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async getDisplayedBadges(userId: string): Promise<UserBadgeInfo[]> {
    const userBadges = await this.prisma.userBadge.findMany({
      where: {
        userId,
        isDisplayed: true,
        revokedAt: null,
        // Eslint-disable-next-line @typescript-eslint/no-explicit-any
      },
      include: { badge: true },
      orderBy: { displayOrder: "asc" },
      take: 5, // Max 5 displayed badges
    });`
  );

  return content;
};

// 18. src/core/badge/reputation.service.ts
fixes['src/core/badge/reputation.service.ts'] = (content) => {
  // Fix getUserReputation
  content = content.replace(
    `async getUserReputation(userId: string): Promise<UserReputationInfo> {
    try {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        reputationScore: true,
        totalTransactions: true,
      },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async getUserReputation(userId: string): Promise<UserReputationInfo> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        reputationScore: true,
        totalTransactions: true,
      },
    });`
  );

  // Fix updateReputation
  content = content.replace(
    `async updateReputation(event: ReputationChangeEvent): Promise<void> {
    try {
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const { userId`,
    `async updateReputation(event: ReputationChangeEvent): Promise<void> {
    const { userId`
  );

  // Fix getLeaderboard return type
  content = content.replace(
    `async getLeaderboard(options: { page: number; limit: number }): Promise<{
    try {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: unknown[];
    total: number;
    page: number;
    limit: number;
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  }>`,
    `async getLeaderboard(options: { page: number; limit: number }): Promise<{
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: unknown[];
    total: number;
    page: number;
    limit: number;
  }>`
  );

  return content;
};

// 19. src/core/fraud/risk-assessment.service.ts
fixes['src/core/fraud/risk-assessment.service.ts'] = (content) => {
  content = content.replace(
    `async getOrderRiskAssessment(orderId: string): Promise<any> {
    try {
    return this.prisma.transactionRiskAssessment.findUnique({
      where: { orderId },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });
  }`,
    `async getOrderRiskAssessment(orderId: string): Promise<any> {
    return this.prisma.transactionRiskAssessment.findUnique({
      where: { orderId },
    });
  }`
  );

  return content;
};

// 20. src/core/ledger/ledger-lock.service.ts
fixes['src/core/ledger/ledger-lock.service.ts'] = (content) => {
  content = content.replace(
    `async validateWalletLedger(walletId: string): Promise<{
    try {
    isValid: boolean;
    expectedBalance: bigint;
    actualBalance: bigint;
    discrepancy: bigint;
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  }>`,
    `async validateWalletLedger(walletId: string): Promise<{
    isValid: boolean;
    expectedBalance: bigint;
    actualBalance: bigint;
    discrepancy: bigint;
  }>`
  );

  return content;
};

// 21. src/core/messaging/messaging.service.ts
fixes['src/core/messaging/messaging.service.ts'] = (content) => {
  // Fix markAsRead
  content = content.replace(
    `async markAsRead(userId: string, conversationId: string): Promise<void> {
    try {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.prisma.$transaction(async (tx: any) => {`,
    `async markAsRead(userId: string, conversationId: string): Promise<void> {
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.prisma.$transaction(async (tx: any) => {`
  );

  content = content.replace(
    `      }
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });
  }

  /**
   * Edit a message
   */`,
    `      }
    });
  }

  /**
   * Edit a message
   */`
  );

  // Fix deleteMessage
  content = content.replace(
    `async deleteMessage(userId: string, messageId: string): Promise<void> {
    try {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async deleteMessage(userId: string, messageId: string): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });`
  );

  return content;
};

// 22. src/core/notification/push/push-notification.service.ts
fixes['src/core/notification/push/push-notification.service.ts'] = (content) => {
  // Fix unregisterPushSubscription
  content = content.replace(
    `async unregisterPushSubscription(endpoint: string): Promise<void> {
    try {
    await this.prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { isActive: false },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });
  }`,
    `async unregisterPushSubscription(endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { isActive: false },
    });
  }`
  );

  // Fix getUserPushSubscriptions
  content = content.replace(
    `async getUserPushSubscriptions(userId: string): Promise<any[]> {
    try {
    return this.prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
      orderBy: { lastUsedAt: "desc" },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });
  }`,
    `async getUserPushSubscriptions(userId: string): Promise<any[]> {
    return this.prisma.pushSubscription.findMany({
      where: { userId, isActive: true },
      orderBy: { lastUsedAt: "desc" },
    });
  }`
  );

  // Fix markAsRead
  content = content.replace(
    `async markAsRead(notificationId: string): Promise<void> {
    try {
    await this.prisma.notificationLog.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });
  }`,
    `async markAsRead(notificationId: string): Promise<void> {
    await this.prisma.notificationLog.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }`
  );

  return content;
};

// 23. src/core/support/support.service.ts
fixes['src/core/support/support.service.ts'] = (content) => {
  // Fix getTicketWithDetails
  content = content.replace(
    `async getTicketWithDetails(ticketId: string): Promise<TicketWithDetails> {
    try {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        responses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async getTicketWithDetails(ticketId: string): Promise<TicketWithDetails> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        responses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });`
  );

  // Fix getCannedResponses
  content = content.replace(
    `async getCannedResponses(category?: TicketCategory): Promise<any[]> {
    try {
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const where`,
    `async getCannedResponses(category?: TicketCategory): Promise<any[]> {
    const where`
  );

  // Fix generateTicketNumber
  content = content.replace(
    `private async generateTicketNumber(): Promise<string> {
    try {
    const year = new Date().getFullYear();
    const count = await this.prisma.supportTicket.count({
      where: {
        createdAt: {
          gte: new Date(\`\${year}-01-01\`),
        },
      },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `private async generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.supportTicket.count({
      where: {
        createdAt: {
          gte: new Date(\`\${year}-01-01\`),
        },
      },
    });`
  );

  // Fix getTicketStats
  content = content.replace(
    `async getTicketStats(): Promise<any> {
    try {
    const [
      totalOpen,
      totalInProgress,
      totalResolved,
      // Eslint-disable-next-line @typescript-eslint/no-unused-vars
      // Eslint-disable-next-line @typescript-eslint/no-unused-vars
      _avgResolutionTime,
      slaBreach,
    ] = await Promise.all([
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
      this.prisma.supportTicket.count`,
    `async getTicketStats(): Promise<any> {
    const [
      totalOpen,
      totalInProgress,
      totalResolved,
      // Eslint-disable-next-line @typescript-eslint/no-unused-vars
      // Eslint-disable-next-line @typescript-eslint/no-unused-vars
      _avgResolutionTime,
      slaBreach,
    ] = await Promise.all([
      this.prisma.supportTicket.count`
  );

  return content;
};

// 24. src/core/wallet/wallet.controller.ts
fixes['src/core/wallet/wallet.controller.ts'] = (content) => {
  content = content.replace(
    `import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Headers } , UseGuards from '@nestjs/common';`,
    `import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Headers } from '@nestjs/common';`
  );

  return content;
};

// 25. src/core/withdrawal/withdrawal-guard.service.ts
fixes['src/core/withdrawal/withdrawal-guard.service.ts'] = (content) => {
  // Fix calculateVelocityScore
  content = content.replace(
    `private async calculateVelocityScore(userId: string): Promise<number> {
    try {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [hourly, daily, weekly] = await Promise.all([
      this.prisma.withdrawal.count({
        where: { userId, requestedAt: { gte: hourAgo } },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
      }),`,
    `private async calculateVelocityScore(userId: string): Promise<number> {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [hourly, daily, weekly] = await Promise.all([
      this.prisma.withdrawal.count({
        where: { userId, requestedAt: { gte: hourAgo } },
      }),`
  );

  // Fix flagWithdrawal
  content = content.replace(
    `async flagWithdrawal(withdrawalId: string, reason: string): Promise<void> {
    try {
    await this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        isFlaggedBySystem: true,
        flagReason: reason,
      },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async flagWithdrawal(withdrawalId: string, reason: string): Promise<void> {
    await this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        isFlaggedBySystem: true,
        flagReason: reason,
      },
    });`
  );

  return content;
};

// 26. src/core/withdrawal/withdrawal.service.ts
fixes['src/core/withdrawal/withdrawal.service.ts'] = (content) => {
  // Fix createWithdrawal destructuring
  content = content.replace(
    `async createWithdrawal(dto: CreateWithdrawalDto): Promise<Withdrawal> {
    try {
    const {
      userId,
      bankAccountId,
      amountMinor,
      idempotencyKey,
      ipAddress,
      userAgent,
      deviceFingerprint,
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    } = dto;`,
    `async createWithdrawal(dto: CreateWithdrawalDto): Promise<Withdrawal> {
    const {
      userId,
      bankAccountId,
      amountMinor,
      idempotencyKey,
      ipAddress,
      userAgent,
      deviceFingerprint,
    } = dto;`
  );

  // Fix getWithdrawalLimits
  content = content.replace(
    `async getWithdrawalLimits(userId: string): Promise<WithdrawalLimits> {
    try {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    });`,
    `async getWithdrawalLimits(userId: string): Promise<WithdrawalLimits> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });`
  );

  return content;
};

// 27. src/infrastructure/cache/cache.service.ts
fixes['src/infrastructure/cache/cache.service.ts'] = (content) => {
  // Fix clear method and Cacheable decorator
  content = content.replace(
    `async clear(): Promise<void> {
    try {
    // NOTE: Use Redis when available - Tracked in backlog
    // Await this.redis.flushdb();

    // Memory cache fallback
    this.memoryCache.clear();
  }
}

/**
 * Cache decorator for methods
 */
export function Cacheable(options?: CacheOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  ) {`,
    `async clear(): Promise<void> {
    // NOTE: Use Redis when available - Tracked in backlog
    // Await this.redis.flushdb();

    // Memory cache fallback
    this.memoryCache.clear();
  }
}

/**
 * Cache decorator for methods
 */
export function Cacheable(options?: CacheOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {`
  );

  return content;
};

// 28. src/infrastructure/cache/redis-fallback.service.ts
fixes['src/infrastructure/cache/redis-fallback.service.ts'] = (content) => {
  content = content.replace(
    `async deletePattern(pattern: string): Promise<void> {
    try {
    const keys = await this.keys(pattern);
    if (keys.length > 0) {
      const firstKey = keys[0];
      if (firstKey !== undefined) {
        this.fallbackCache.delete(firstKey);
      }
      for (const key of keys.slice(1)) {
        await this.del(key);
      }
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    }
  }`,
    `async deletePattern(pattern: string): Promise<void> {
    const keys = await this.keys(pattern);
    if (keys.length > 0) {
      const firstKey = keys[0];
      if (firstKey !== undefined) {
        this.fallbackCache.delete(firstKey);
      }
      for (const key of keys.slice(1)) {
        await this.del(key);
      }
    }
  }`
  );

  return content;
};

// 29. src/infrastructure/idempotency/idempotency.service.ts
fixes['src/infrastructure/idempotency/idempotency.service.ts'] = (content) => {
  // Fix import
  content = content.replace(
    `import { Injectable, Inject } , Logger from '@nestjs/common';`,
    `import { Injectable, Inject, Logger } from '@nestjs/common';`
  );

  // Fix constructor
  content = content.replace(
    `constructor(@Inject(CACHE_MANAGER, private readonly logger: Logger) private cacheManager: Cache) {}`,
    `private readonly logger = new Logger(IdempotencyService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}`
  );

  // Fix set method
  content = content.replace(
    `async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await this.cacheManager.set(key, serialized, ttl || this.DEFAULT_TTL);
  }

  /**
   * Delete cache value
   */
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  /**
   * Delete
   */`,
    `async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await this.cacheManager.set(key, serialized, ttl || this.DEFAULT_TTL);
  }

  /**
   * Delete cache value
   */`
  );

  // Fix delete method
  content = content.replace(
    `async delete(key: string): Promise<void> {
    try {
    await this.cacheManager.del(key);
  }

  /**
   * Check if a request with this idempotency key is currently being processed
   */
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
  /**
   * Isprocessing
   */`,
    `async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Check if a request with this idempotency key is currently being processed
   */`
  );

  // Fix isProcessing
  content = content.replace(
    `async isProcessing(key: string, userId: string): Promise<boolean> {
    try {
    const fullKey = this.buildKey(key, userId);
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const processingKey`,
    `async isProcessing(key: string, userId: string): Promise<boolean> {
    const fullKey = this.buildKey(key, userId);
    const processingKey`
  );

  // Fix markProcessing
  content = content.replace(
    `async markProcessing(key: string, userId: string, ttl?: number): Promise<void> {
    try {
    const fullKey = this.buildKey(key, userId);
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const processingKey`,
    `async markProcessing(key: string, userId: string, ttl?: number): Promise<void> {
    const fullKey = this.buildKey(key, userId);
    const processingKey`
  );

  // Fix getCachedResponse
  content = content.replace(
    `async getCachedResponse(key: string, userId: string): Promise<any> {
    try {
    const fullKey = this.buildKey(key, userId);
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const responseKey`,
    `async getCachedResponse(key: string, userId: string): Promise<any> {
    const fullKey = this.buildKey(key, userId);
    const responseKey`
  );

  // Fix cacheResponse
  content = content.replace(
    `async cacheResponse(key: string, userId: string, response: unknown, ttl?: number): Promise<void> {
    try {
    const fullKey = this.buildKey(key, userId);
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const responseKey`,
    `async cacheResponse(key: string, userId: string, response: unknown, ttl?: number): Promise<void> {
    const fullKey = this.buildKey(key, userId);
    const responseKey`
  );

  // Fix clearIdempotencyKey
  content = content.replace(
    `async clearIdempotencyKey(key: string, userId: string): Promise<void> {
    try {
    const fullKey = this.buildKey(key, userId);
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const responseKey`,
    `async clearIdempotencyKey(key: string, userId: string): Promise<void> {
    const fullKey = this.buildKey(key, userId);
    const responseKey`
  );

  return content;
};

// 30. src/infrastructure/metrics/prometheus.service.ts
fixes['src/infrastructure/metrics/prometheus.service.ts'] = (content) => {
  // Fix import
  content = content.replace(
    `import { Injectable } , Logger from '@nestjs/common';`,
    `import { Injectable, Logger } from '@nestjs/common';`
  );

  // Fix constructor
  content = content.replace(
    `constructor(, private readonly logger: Logger) {`,
    `private readonly logger = new Logger(PrometheusService.name);

  constructor() {`
  );

  return content;
};

// 31. src/infrastructure/storage/storage.service.ts
fixes['src/infrastructure/storage/storage.service.ts'] = (content) => {
  // Fix upload method
  content = content.replace(
    `async upload(file: any): Promise<string> {
    try {
    const ext = path.extname(file.originalname);
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    const filename`,
    `async upload(file: any): Promise<string> {
    const ext = path.extname(file.originalname);
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const filename`
  );

  // Fix delete method
  content = content.replace(
    `async delete(filename: string): Promise<void> {
    try {
    const safeFilename = path.basename(filename);
    const filepath = path.join(this.uploadPath, safeFilename);

    if (
      fs.existsSync(filepath) &&
      filepath.startsWith(path.resolve(this.uploadPath))
    ) {
      fs.unlinkSync(filepath);
      this.logger.log(\`File deleted: \${safeFilename}\`);
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    }
  }`,
    `async delete(filename: string): Promise<void> {
    const safeFilename = path.basename(filename);
    const filepath = path.join(this.uploadPath, safeFilename);

    if (
      fs.existsSync(filepath) &&
      filepath.startsWith(path.resolve(this.uploadPath))
    ) {
      fs.unlinkSync(filepath);
      this.logger.log(\`File deleted: \${safeFilename}\`);
    }
  }`
  );

  // Fix get method
  content = content.replace(
    `async get(filename: string): Promise<Buffer> {
    try {
    const safeFilename = path.basename(filename);
    const filepath = path.join(this.uploadPath, safeFilename);

    if (!filepath.startsWith(path.resolve(this.uploadPath))) {
      throw new Error("Invalid file path");
    } catch (error) {
      this.logger.error(\`Error in method: \${error.message}\`, error.stack);
      throw error;
    }
    }

    return fs.readFileSync(filepath);
  }`,
    `async get(filename: string): Promise<Buffer> {
    const safeFilename = path.basename(filename);
    const filepath = path.join(this.uploadPath, safeFilename);

    if (!filepath.startsWith(path.resolve(this.uploadPath))) {
      throw new Error("Invalid file path");
    }

    return fs.readFileSync(filepath);
  }`
  );

  return content;
};

// Apply all fixes
const basePath = path.join(__dirname, 'src');
let fixedCount = 0;
let errorCount = 0;

for (const [filePath, fixFn] of Object.entries(fixes)) {
  const fullPath = path.join(__dirname, filePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const fixed = fixFn(content);
    if (content !== fixed) {
      fs.writeFileSync(fullPath, fixed, 'utf8');
      console.log(`FIXED: ${filePath}`);
      fixedCount++;
    } else {
      console.log(`NO CHANGE: ${filePath}`);
    }
  } catch (err) {
    console.error(`ERROR: ${filePath} - ${err.message}`);
    errorCount++;
  }
}

console.log(`\nDone: ${fixedCount} files fixed, ${errorCount} errors`);
