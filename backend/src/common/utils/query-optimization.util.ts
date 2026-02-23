import { PrismaClient } from '@prisma/client';



/**
 * Query Optimization Utilities (HIGH-015)
 *
 * Fixes N+1 query problems and provides patterns for efficient queries.
 *
 * N+1 Problem Example:
 * BAD:
 *   const users = await prisma.user.findMany();
 *   for (const user of users) {
 *     user.wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
 *   }
 *   // Makes N+1 queries (1 for users + N for each wallet)
 *
 * GOOD:
 *   const users = await prisma.user.findMany({
 *     include: { wallet: true }
 *   });
 *   // Makes only 1 query with JOIN
 */

/**
 * Base query options for consistent pagination and optimization
 */
export interface QueryOptions {
  page?: number;
  limit?: number;
  orderBy?: any;
  include?: any;
  select?: any;
}

/**
 * Optimized user query with relationships
 * Prevents N+1 when fetching user with wallet and transactions
 */
export const optimizedUserQuery = {
  include: {
    wallet: {
      select: {
        id: true,
        balanceMinor: true,
        lockedMinor: true,
        currency: true,
        updatedAt: true,
      },
    },
    // Don't include transactions by default (too many)
    // Load separately with pagination if needed
  },
};

/**
 * Optimized wallet query with recent transactions
 * Uses limit to prevent loading too many transactions
 */
export const optimizedWalletQuery = {
  include: {
    user: {
      select: {
        id: true,
        email: true,
        username: true,
      },
    },
    // Only load recent 10 deposits/withdrawals
    deposits: {
      take: 10,
      orderBy: { createdAt: 'desc' as const },
      select: {
        id: true,
        amountMinor: true,
        status: true,
        createdAt: true,
      },
    },
    withdrawals: {
      take: 10,
      orderBy: { requestedAt: 'desc' as const },
      select: {
        id: true,
        amountMinor: true,
        status: true,
        requestedAt: true,
      },
    },
  },
};

/**
 * Optimized escrow query with all relationships
 */
export const optimizedEscrowQuery = {
  include: {
    buyer: {
      select: {
        id: true,
        email: true,
        username: true,
      },
    },
    seller: {
      select: {
        id: true,
        email: true,
        username: true,
      },
    },
    // Don't load messages by default
    // Load separately with pagination
  },
};

/**
 * Batch load wallets for multiple users
 * Prevents N+1 when loading user list with wallets
 */
export async function batchLoadWallets(
  prisma: PrismaClient,
  userIds: string[],
): Promise<Map<string, any>> {
  const wallets = await prisma.wallet.findMany({
    where: {
      userId: { in: userIds },
    },
  });

  // Create map for O(1) lookup
  const walletMap = new Map();
  for (const wallet of wallets) {
    walletMap.set(wallet.userId, wallet);
  }

  return walletMap;
}

/**
 * Batch load escrows for multiple users
 */
export async function batchLoadEscrows(
  prisma: PrismaClient,
  userIds: string[],
  options?: { limit?: number; status?: string },
): Promise<Map<string, any[]>> {
  const escrows = await prisma.escrow.findMany({
    where: {
      OR: [
        { buyerId: { in: userIds } },
        { sellerId: { in: userIds } },
      ],
      ...(options?.status && { status: options.status }),
    },
    take: options?.limit,
    orderBy: { createdAt: 'desc' },
  });

  // Group by user ID
  const escrowMap = new Map<string, any[]>();
  for (const escrow of escrows) {
    // Add to buyer's list
    if (!escrowMap.has(escrow.buyerId)) {
      escrowMap.set(escrow.buyerId, []);
    }
    escrowMap.get(escrow.buyerId)!.push(escrow);

    // Add to seller's list
    if (!escrowMap.has(escrow.sellerId)) {
      escrowMap.set(escrow.sellerId, []);
    }
    escrowMap.get(escrow.sellerId)!.push(escrow);
  }

  return escrowMap;
}

/**
 * Batch load transaction counts
 */
export async function batchLoadTransactionCounts(
  prisma: PrismaClient,
  walletIds: string[],
): Promise<Map<string, number>> {
  const counts = await prisma.transaction.groupBy({
    by: ['walletId'],
    where: {
      walletId: { in: walletIds },
    },
    _count: true,
  });

  const countMap = new Map<string, number>();
  for (const count of counts) {
    countMap.set(count.walletId, count._count);
  }

  return countMap;
}

/**
 * Get paginated results with total count in single query
 * Uses Prisma's transaction to execute both queries
 */
export async function getPaginatedResults<T>(
  prisma: PrismaClient,
  model: any,
  where: any,
  options: QueryOptions,
): Promise<{ data: T[]; total: number; totalPages: number }> {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy: options.orderBy,
      include: options.include,
      select: options.select,
    }),
    model.count({ where }),
  ]);

  return {
    data,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Check if query is using indexes
 * Use in development to verify query performance
 * 
 * SECURITY NOTE: This function is for development/debugging only.
 * It should NEVER be exposed to user input or used in production.
 * Only use with trusted, hardcoded queries.
 */
export async function explainQuery(
  prisma: PrismaClient,
  query: string,
): Promise<any> {
  // SECURITY: Strict validation - only allow SELECT queries
  const sanitizedQuery = query.trim();
  
  // Validation 1: Must start with SELECT (case-insensitive)
  if (!/^SELECT\s+/i.test(sanitizedQuery)) {
    throw new Error('explainQuery only supports SELECT queries');
  }
  
  // Validation 2: Block dangerous SQL keywords
  const dangerousPatterns = [
    /;\s*DROP/i,
    /;\s*DELETE/i,
    /;\s*UPDATE/i,
    /;\s*INSERT/i,
    /;\s*CREATE/i,
    /;\s*ALTER/i,
    /;\s*GRANT/i,
    /;\s*REVOKE/i,
    /xp_cmdshell/i,
    /exec\s*\(/i,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitizedQuery)) {
      throw new Error('Query contains potentially dangerous SQL');
    }
  }
  
  // Validation 3: Must not contain multiple statements (no semicolons except at end)
  const semicolonCount = (sanitizedQuery.match(/;/g) || []).length;
  if (semicolonCount > 1 || (semicolonCount === 1 && !sanitizedQuery.endsWith(';'))) {
    throw new Error('Multiple SQL statements not allowed');
  }
  
  // Execute with EXPLAIN ANALYZE (read-only operation)
  // SECURITY FIX: $queryRawUnsafe removed.
  throw new Error('EXPLAIN ANALYZE disabled for security.');
  return result;
}

/**
 * Get slow queries from PostgreSQL logs
 */
export async function getSlowQueries(
  prisma: PrismaClient,
  minDurationMs: number = 1000,
): Promise<any[]> {
  // Requires pg_stat_statements extension
  // SECURITY: Ensure input is properly sanitized
  const queries = await prisma.$queryRaw`
    SELECT
      query,
      calls,
      total_exec_time,
      mean_exec_time,
      max_exec_time
    FROM pg_stat_statements
    WHERE mean_exec_time > ${minDurationMs}
    ORDER BY mean_exec_time DESC
    LIMIT 20
  `;

  return queries as any[];
}

/**
 * DataLoader pattern for batching and caching
 * Use for complex relationships that are queried multiple times
 */
export class DataLoaderHelper<K, V> {
  private cache = new Map<K, V>();
  private batchQueue: K[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  constructor(
    private batchLoadFn: (keys: K[]) => Promise<Map<K, V>>,
    private maxBatchSize: number = 100,
    private batchDelayMs: number = 10,
  ) {}

  async load(key: K): Promise<V | undefined> {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Add to batch queue
    this.batchQueue.push(key);

    // Schedule batch load
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.executeBatch(), this.batchDelayMs);
    }

    // If batch is full, execute immediately
    if (this.batchQueue.length >= this.maxBatchSize) {
      await this.executeBatch();
    }

    // Wait for batch to complete
    return new Promise((resolve) => {
      const checkCache = () => {
        if (this.cache.has(key)) {
          resolve(this.cache.get(key));
        } else {
          setTimeout(checkCache, 1);
        }
      };
      checkCache();
    });
  }

  private async executeBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.batchQueue.length === 0) return;

    const keys = [...this.batchQueue];
    this.batchQueue = [];

    // Execute batch load
    const results = await this.batchLoadFn(keys);

    // Update cache
    for (const [key, value] of results.entries()) {
      this.cache.set(key, value);
    }
  }

  clearCache() {
    this.cache.clear();
  }
}
