/**
 * Database Migration Helpers (MEDIUM-017)
 * 
 * Utilities for safe database migrations
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MigrationHelpers {
  /**
   * Safe column addition with default value
   */
  static async addColumnSafely(
    table: string,
    column: string,
    type: string,
    defaultValue: any,
  ) {
    console.log(`Adding column ${column} to ${table}...`);
    
    // Use raw SQL for complex migrations
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "${table}" 
      ADD COLUMN IF NOT EXISTS "${column}" ${type} DEFAULT ${defaultValue};
    `);
    
    console.log(`✅ Column ${column} added successfully`);
  }

  /**
   * Safe column removal
   */
  static async removeColumnSafely(table: string, column: string) {
    console.log(`Removing column ${column} from ${table}...`);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "${table}" 
      DROP COLUMN IF EXISTS "${column}";
    `);
    
    console.log(`✅ Column ${column} removed successfully`);
  }

  /**
   * Rename column safely
   */
  static async renameColumn(
    table: string,
    oldName: string,
    newName: string,
  ) {
    console.log(`Renaming column ${oldName} to ${newName} in ${table}...`);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "${table}" 
      RENAME COLUMN "${oldName}" TO "${newName}";
    `);
    
    console.log(`✅ Column renamed successfully`);
  }

  /**
   * Add index for performance
   */
  static async addIndex(table: string, columns: string[], name?: string) {
    const indexName = name || `idx_${table}_${columns.join('_')}`;
    console.log(`Creating index ${indexName}...`);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "${indexName}" 
      ON "${table}" (${columns.map(c => `"${c}"`).join(', ')});
    `);
    
    console.log(`✅ Index ${indexName} created successfully`);
  }

  /**
   * Backfill data after schema change
   */
  static async backfillData<T>(
    table: string,
    column: string,
    calculator: (row: any) => T,
    batchSize: number = 1000,
  ) {
    console.log(`Backfilling ${column} in ${table}...`);
    
    let offset = 0;
    let processed = 0;
    
    while (true) {
      const rows = await prisma.$queryRawUnsafe<any[]>(`
        SELECT * FROM "${table}" 
        WHERE "${column}" IS NULL 
        LIMIT ${batchSize} OFFSET ${offset}
      `);
      
      if (rows.length === 0) break;
      
      for (const row of rows) {
        const value = calculator(row);
        await prisma.$executeRawUnsafe(`
          UPDATE "${table}" 
          SET "${column}" = $1 
          WHERE id = $2
        `, value, row.id);
        processed++;
      }
      
      offset += batchSize;
      console.log(`Processed ${processed} rows...`);
    }
    
    console.log(`✅ Backfilled ${processed} rows successfully`);
  }

  /**
   * Verify migration success
   */
  static async verifyMigration(checks: Array<() => Promise<boolean>>) {
    console.log('Verifying migration...');
    
    for (const check of checks) {
      const passed = await check();
      if (!passed) {
        throw new Error('Migration verification failed');
      }
    }
    
    console.log('✅ Migration verified successfully');
  }
}

/**
 * Example migration script:
 * 
 * // prisma/migrations/20240101_add_user_role.ts
 * import { MigrationHelpers } from '../migration-helpers';
 * 
 * async function up() {
 *   // Add column
 *   await MigrationHelpers.addColumnSafely(
 *     'User',
 *     'role',
 *     'VARCHAR(50)',
 *     "'USER'"
 *   );
 *   
 *   // Add index
 *   await MigrationHelpers.addIndex('User', ['role', 'status']);
 *   
 *   // Backfill data
 *   await MigrationHelpers.backfillData(
 *     'User',
 *     'role',
 *     (user) => user.isAdmin ? 'ADMIN' : 'USER'
 *   );
 *   
 *   // Verify
 *   await MigrationHelpers.verifyMigration([
 *     async () => {
 *       const count = await prisma.user.count({ where: { role: null } });
 *       return count === 0;
 *     },
 *   ]);
 * }
 * 
 * up().then(() => process.exit(0)).catch((e) => {
 *   console.error(e);
 *   process.exit(1);
 * });
 */
