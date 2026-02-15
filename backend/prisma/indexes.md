# Database Indexing Strategy

**Purpose**: Optimize database query performance through strategic indexing

---

## Index Types

### 1. **Single Column Indexes**
Used for queries that filter or sort by a single column.

```prisma
@@index([email])
@@index([phoneNumber])
@@index([createdAt])
```

### 2. **Composite Indexes**
Used for queries that filter by multiple columns.
Order matters: most selective column first.

```prisma
@@index([status, createdAt])
@@index([userId, type, createdAt])
```

### 3. **Unique Indexes**
Enforces uniqueness and provides fast lookups.

```prisma
@@unique([email])
@@unique([userId, orderId])
```

---

## Recommended Indexes by Entity

### **User**
```prisma
model User {
  id String @id @default(cuid())
  email String @unique  // Automatic unique index
  phoneNumber String? @unique  // Automatic unique index
  kycStatus KycStatus @default(UNVERIFIED)
  status UserStatus @default(ACTIVE)
  createdAt DateTime @default(now())
  
  // Recommended indexes
  @@index([email])  // Login queries
  @@index([phoneNumber])  // Phone login
  @@index([kycStatus])  // KYC filtering
  @@index([status])  // Active user queries
  @@index([createdAt(sort: Desc)])  // Recent users
  @@index([kycStatus, status])  // Combined filters
}
```

**Queries Optimized**:
- `findUnique({ where: { email } })` - O(log n)
- `findMany({ where: { kycStatus: 'VERIFIED' } })` - O(log n)
- `findMany({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } })` - O(log n)

### **Wallet**
```prisma
model Wallet {
  id String @id @default(cuid())
  userId String
  currency Currency
  balance Decimal
  status WalletStatus @default(ACTIVE)
  createdAt DateTime @default(now())
  
  // Recommended indexes
  @@unique([userId, currency])  // One wallet per currency per user
  @@index([userId])  // User's wallets
  @@index([status])  // Active wallets
  @@index([currency, status])  // Currency-specific active wallets
  @@index([balance])  // Balance queries (e.g., wallets with > X balance)
}
```

**Queries Optimized**:
- `findUnique({ where: { userId_currency: { userId, currency } } })` - O(1)
- `findMany({ where: { userId } })` - O(log n)
- `findMany({ where: { status: 'ACTIVE', currency: 'IDR' } })` - O(log n)

### **Escrow**
```prisma
model Escrow {
  id String @id @default(cuid())
  orderId String @unique
  buyerId String
  sellerId String
  status EscrowStatus @default(PENDING)
  amount Decimal
  createdAt DateTime @default(now())
  expiresAt DateTime
  releasedAt DateTime?
  
  // Recommended indexes
  @@index([orderId])  // Order lookup
  @@index([buyerId])  // Buyer's escrows
  @@index([sellerId])  // Seller's escrows
  @@index([status])  // Status filtering
  @@index([status, expiresAt])  // Expired pending escrows
  @@index([buyerId, status])  // User's escrows by status
  @@index([sellerId, status])  // Seller's escrows by status
  @@index([createdAt(sort: Desc)])  // Recent escrows
  @@index([expiresAt])  // Expiration checks
}
```

**Queries Optimized**:
- `findMany({ where: { status: 'PENDING', expiresAt: { lt: now } } })` - O(log n)
- `findMany({ where: { buyerId, status: 'ACTIVE' } })` - O(log n)
- Background job: Find expired escrows - O(log n)

### **Transaction**
```prisma
model Transaction {
  id String @id @default(cuid())
  userId String
  walletId String
  type TransactionType
  amount Decimal
  status TransactionStatus @default(PENDING)
  referenceId String?
  createdAt DateTime @default(now())
  
  // Recommended indexes
  @@index([userId])  // User's transactions
  @@index([walletId])  // Wallet transactions
  @@index([referenceId])  // Reference lookup (e.g., orderId)
  @@index([status])  // Status filtering
  @@index([type])  // Transaction type filtering
  @@index([userId, createdAt(sort: Desc)])  // User's recent transactions
  @@index([walletId, type])  // Wallet transactions by type
  @@index([status, createdAt])  // Pending transactions by date
}
```

**Queries Optimized**:
- `findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })` - O(log n)
- `findMany({ where: { walletId, type: 'CREDIT' } })` - O(log n)
- `findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' } })` - O(log n)

### **Order**
```prisma
model Order {
  id String @id @default(cuid())
  buyerId String
  sellerId String
  status OrderStatus @default(PENDING_PAYMENT)
  totalAmount Decimal
  createdAt DateTime @default(now())
  completedAt DateTime?
  
  // Recommended indexes
  @@index([buyerId])  // Buyer's orders
  @@index([sellerId])  // Seller's orders
  @@index([status])  // Status filtering
  @@index([buyerId, status])  // User's orders by status
  @@index([sellerId, status])  // Seller's orders by status
  @@index([createdAt(sort: Desc)])  // Recent orders
  @@index([status, createdAt])  // Orders by status and date
}
```

### **Payment**
```prisma
model Payment {
  id String @id @default(cuid())
  orderId String
  userId String
  gateway PaymentGateway
  status PaymentStatus @default(PENDING)
  amount Decimal
  externalId String?
  createdAt DateTime @default(now())
  
  // Recommended indexes
  @@index([orderId])  // Order payments
  @@index([userId])  // User payments
  @@index([externalId])  // External payment lookup
  @@index([status])  // Status filtering
  @@index([gateway, status])  // Gateway-specific status
  @@index([createdAt(sort: Desc)])  // Recent payments
}
```

### **Dispute**
```prisma
model Dispute {
  id String @id @default(cuid())
  orderId String
  raisedBy String
  status DisputeStatus @default(OPEN)
  priority DisputePriority @default(MEDIUM)
  createdAt DateTime @default(now())
  resolvedAt DateTime?
  
  // Recommended indexes
  @@index([orderId])  // Order disputes
  @@index([raisedBy])  // User's disputes
  @@index([status])  // Status filtering
  @@index([priority, status])  // High priority open disputes
  @@index([createdAt(sort: Desc)])  // Recent disputes
  @@index([status, priority])  // Admin dashboard
}
```

### **KycVerification**
```prisma
model KycVerification {
  id String @id @default(cuid())
  userId String @unique
  status KycStatus @default(PENDING)
  submittedAt DateTime @default(now())
  verifiedAt DateTime?
  rejectedAt DateTime?
  
  // Recommended indexes
  @@index([status])  // Pending KYC
  @@index([submittedAt(sort: Asc)])  // Oldest pending first
  @@index([status, submittedAt])  // Admin review queue
}
```

### **AuditLog** (if implemented)
```prisma
model AuditLog {
  id String @id @default(cuid())
  userId String
  action String
  resource String?
  ip String
  success Boolean
  highRisk Boolean @default(false)
  timestamp DateTime @default(now())
  
  // Recommended indexes
  @@index([userId])  // User activity
  @@index([action])  // Action filtering
  @@index([timestamp(sort: Desc)])  // Recent activity
  @@index([userId, timestamp(sort: Desc)])  // User's recent activity
  @@index([highRisk, success])  // Security monitoring
  @@index([resource, action])  // Resource-specific actions
}
```

---

## Index Optimization Guidelines

### **DO's**

✅ **Index foreign keys**
```prisma
@@index([userId])  // FK to User
@@index([walletId])  // FK to Wallet
```

✅ **Index columns used in WHERE clauses**
```prisma
@@index([status])  // WHERE status = 'ACTIVE'
@@index([email])   // WHERE email = 'user@example.com'
```

✅ **Index columns used in ORDER BY**
```prisma
@@index([createdAt(sort: Desc)])  // ORDER BY createdAt DESC
```

✅ **Use composite indexes for multiple filters**
```prisma
// Query: WHERE userId = X AND status = 'ACTIVE'
@@index([userId, status])
```

✅ **Most selective column first in composite**
```prisma
// userId is more selective than status
@@index([userId, status])  // ✅ Good
@@index([status, userId])  // ❌ Less optimal
```

### **DON'T's**

❌ **Don't index low-cardinality columns alone**
```prisma
// Bad: boolean or enum with few values
@@index([isActive])  // Only 2 values
@@index([status])    // Only 3-4 values - consider composite instead
```

❌ **Don't create redundant indexes**
```prisma
@@index([userId])
@@index([userId, status])  // First index is redundant
```

❌ **Don't over-index**
- Each index slows down writes (INSERT, UPDATE, DELETE)
- Only add indexes for actual queries
- Monitor index usage

---

## Performance Impact

### **Query Performance**

| Query Type | Without Index | With Index |
|-----------|---------------|------------|
| `findUnique` by indexed field | O(n) | O(log n) |
| `findMany` with WHERE on indexed | O(n) | O(log n) |
| `findMany` with ORDER BY indexed | O(n log n) | O(log n) |
| JOIN on indexed FK | O(n²) | O(n log n) |

### **Write Performance**

- Each index adds ~10-20% overhead to INSERT
- Each index adds ~15-30% overhead to UPDATE (if indexed column changes)
- DELETE operations are less affected

### **Storage**

- Each index consumes ~10-30% of table size
- Composite indexes can be larger

---

## Monitoring Index Usage

### **PostgreSQL Queries**

```sql
-- Check unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE '%_pkey'
ORDER BY schemaname, tablename;

-- Check index size
SELECT
  indexrelname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- Check slow queries (enable pg_stat_statements extension)
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

---

## Migration Strategy

### **Adding Indexes**

```bash
# 1. Add index to schema
# backend/prisma/schema/user.prisma
@@index([email])

# 2. Generate migration
pnpm prisma migrate dev --name add_user_email_index

# 3. For production (use CONCURRENTLY to avoid locks)
# Edit migration SQL file:
CREATE INDEX CONCURRENTLY "User_email_idx" ON "User"("email");

# 4. Deploy
pnpm prisma migrate deploy
```

### **Testing Index Impact**

```typescript
// Enable query logging
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
})

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Duration: ' + e.duration + 'ms')
})

// Run your queries and monitor performance
const users = await prisma.user.findMany({
  where: { status: 'ACTIVE' },
  orderBy: { createdAt: 'desc' },
})
```

---

## Conclusion

**Key Takeaways**:
1. Index foreign keys and WHERE clause columns
2. Use composite indexes for multi-column queries
3. Monitor index usage and remove unused indexes
4. Balance read performance vs write overhead
5. Test before deploying to production

**Performance Target**:
- Query response time: < 100ms for 95th percentile
- Index hit ratio: > 99%
- Slow query threshold: > 1000ms

**Next Steps**:
1. Apply indexes to schema files
2. Generate and test migrations
3. Monitor query performance
4. Adjust based on actual usage patterns
