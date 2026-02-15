import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const isProduction = process.env.NODE_ENV === 'production';

  const resolveSeedPassword = (envKey: string, label: string) => {
    const configured = process.env[envKey];
    if (configured) {
      return configured;
    }

    if (isProduction) {
      throw new Error(
        `${envKey} must be set in production when running seed scripts.`,
      );
    }

    const generated = crypto.randomBytes(18).toString('base64url');
    console.warn(
      `⚠️  ${label} password not set via ${envKey}. Generated one-time password for seed: ${generated}`,
    );
    return generated;
  };

  // SECURITY: Require explicit passwords in production; generate per-run in non-prod
  const adminPassword = resolveSeedPassword(
    'SEED_ADMIN_PASSWORD',
    'Admin',
  );
  const dafenkaPassword = resolveSeedPassword(
    'SEED_DAFENKA_PASSWORD',
    'Dafenka admin',
  );
  const testPassword = resolveSeedPassword(
    'SEED_TEST_PASSWORD',
    'Test user',
  );
  
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  const hashedDafenkaPassword = await bcrypt.hash(dafenkaPassword, 10);
  const hashedTestPassword = await bcrypt.hash(testPassword, 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kahade.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@kahade.com',
      passwordHash: hashedAdminPassword,
      isAdmin: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('Created admin user:', admin);

  const dafenkaAdmin = await prisma.user.upsert({
    where: { email: 'dafenka@kahade.id' },
    update: {},
    create: {
      username: 'dafenka',
      email: 'dafenka@kahade.id',
      passwordHash: hashedDafenkaPassword,
      isAdmin: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('Created admin user:', dafenkaAdmin);

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@test.com' },
    update: {},
    create: {
      username: 'buyer',
      email: 'buyer@test.com',
      passwordHash: hashedTestPassword,
      phone: '+6281234567890',
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@test.com' },
    update: {},
    create: {
      username: 'seller',
      email: 'seller@test.com',
      passwordHash: hashedTestPassword,
      phone: '+6281234567891',
    },
  });

  console.log('Created test users:', { buyer, seller });

  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      initiatorId: buyer.id,
      initiatorRole: 'BUYER',
      title: 'iPhone 14 Pro Max',
      description: 'Brand new iPhone 14 Pro Max 256GB',
      category: 'ELECTRONICS',
      amountMinor: BigInt(1500000000),
      feePayer: 'BUYER',
      platformFeeMinor: BigInt(15000000),
      holdingPeriodDays: 7,
      status: 'PENDING_ACCEPT',
      inviteToken: Math.random().toString(36).substring(7),
      inviteExpiresAt: new Date(Date.now() + 86400000),
    },
  });

  console.log('Created sample order:', order);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
