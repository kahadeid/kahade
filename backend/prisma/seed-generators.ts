/**
 * Seed Data Generators (MEDIUM-018)
 * 
 * Generate realistic test data
 */

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export class SeedGenerators {
  /**
   * Generate users with wallets
   */
  static async generateUsers(count: number = 10) {
    console.log(`Generating ${count} users...`);
    
    const users = [];
    
    for (let i = 0; i < count; i++) {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          phone: faker.phone.number('+62##########'),
          password: '$2b$10$hashhashhash', // Pre-hashed
          status: 'ACTIVE',
          wallet: {
            create: {
              balance: faker.number.int({ min: 10000, max: 1000000 }),
              status: 'ACTIVE',
            },
          },
        },
        include: { wallet: true },
      });
      
      users.push(user);
    }
    
    console.log(`✅ Generated ${users.length} users`);
    return users;
  }

  /**
   * Generate escrows
   */
  static async generateEscrows(users: any[], count: number = 20) {
    console.log(`Generating ${count} escrows...`);
    
    const statuses = ['PENDING', 'COMPLETED', 'CANCELLED', 'DISPUTED'];
    const escrows = [];
    
    for (let i = 0; i < count; i++) {
      const sender = faker.helpers.arrayElement(users);
      const receiver = faker.helpers.arrayElement(
        users.filter(u => u.id !== sender.id)
      );
      
      const escrow = await prisma.escrow.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          amount: faker.number.int({ min: 50000, max: 500000 }),
          description: faker.commerce.productDescription(),
          status: faker.helpers.arrayElement(statuses),
        },
      });
      
      escrows.push(escrow);
    }
    
    console.log(`✅ Generated ${escrows.length} escrows`);
    return escrows;
  }

  /**
   * Generate transactions
   */
  static async generateTransactions(users: any[], count: number = 50) {
    console.log(`Generating ${count} transactions...`);
    
    const types = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'ESCROW_CREATE'];
    const statuses = ['COMPLETED', 'PENDING', 'FAILED'];
    const transactions = [];
    
    for (let i = 0; i < count; i++) {
      const user = faker.helpers.arrayElement(users);
      
      const transaction = await prisma.transaction.create({
        data: {
          walletId: user.wallet.id,
          type: faker.helpers.arrayElement(types),
          amount: faker.number.int({ min: 10000, max: 100000 }),
          status: faker.helpers.weightedArrayElement([
            { weight: 8, value: 'COMPLETED' },
            { weight: 1, value: 'PENDING' },
            { weight: 1, value: 'FAILED' },
          ]),
          reference: `REF-${Date.now()}-${i}`,
        },
      });
      
      transactions.push(transaction);
    }
    
    console.log(`✅ Generated ${transactions.length} transactions`);
    return transactions;
  }

  /**
   * Clear all data
   */
  static async clearAll() {
    console.log('Clearing all data...');
    
    await prisma.transaction.deleteMany();
    await prisma.escrow.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ All data cleared');
  }

  /**
   * Run full seed
   */
  static async seedAll() {
    console.log('🌱 Starting database seed...');
    
    await this.clearAll();
    
    const users = await this.generateUsers(50);
    await this.generateEscrows(users, 100);
    await this.generateTransactions(users, 200);
    
    console.log('✅ Database seeded successfully!');
  }
}

/**
 * Run seed:
 * 
 * // package.json
 * "scripts": {
 *   "seed": "ts-node prisma/seed.ts"
 * }
 * 
 * // prisma/seed.ts
 * import { SeedGenerators } from './seed-generators';
 * 
 * async function main() {
 *   await SeedGenerators.seedAll();
 * }
 * 
 * main()
 *   .catch((e) => {
 *     console.error(e);
 *     process.exit(1);
 *   })
 *   .finally(async () => {
 *     await prisma.$disconnect();
 *   });
 * 
 * // Run: npm run seed
 */
