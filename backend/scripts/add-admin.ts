/**
 * Script to add a new admin user
 * Usage: npx ts-node scripts/add-admin.ts
 * 
 * Environment variables (optional):
 * - ADMIN_EMAIL: Admin email address
 * - ADMIN_PASSWORD: Admin password
 * - ADMIN_USERNAME: Admin username
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function addAdmin() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) { throw new Error('ADMIN_EMAIL environment variable is required'); }
  const username = process.env.ADMIN_USERNAME || email.split('@')[0];
  const isProduction = process.env.NODE_ENV === 'production';

  const configuredPassword = process.env.ADMIN_PASSWORD;
  const password =
    configuredPassword ??
    (() => {
      if (isProduction) {
        throw new Error(
          'ADMIN_PASSWORD must be set in production when running add-admin.',
        );
      }

      const generated = crypto.randomBytes(18).toString('base64url');
      console.warn(
        `⚠️  ADMIN_PASSWORD not set. Generated one-time password for admin: ${generated}`,
      );
      return generated;
    })();

  console.log(`Adding admin user: ${email}`);

  // Hash password — match app BCRYPT_ROUNDS (default 12)
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  const hashedPassword = await bcrypt.hash(password, bcryptRounds);

  try {
    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        // Update existing user to admin if exists
        isAdmin: true,
        passwordHash: hashedPassword,
        emailVerifiedAt: new Date(),
      },
      create: {
        username,
        email,
        passwordHash: hashedPassword,
        isAdmin: true,
        emailVerifiedAt: new Date(),
      },
    });

    console.log('✅ Admin user created/updated successfully!');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Username:', admin.username);
    console.log('   Is Admin:', admin.isAdmin);
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation - username might be taken
      console.error('❌ Error: Username already exists. Trying with modified username...');
      
      const modifiedUsername = `${username}_admin`;
      const admin = await prisma.user.upsert({
        where: { email },
        update: {
          isAdmin: true,
          passwordHash: hashedPassword,
          emailVerifiedAt: new Date(),
        },
        create: {
          username: modifiedUsername,
          email,
          passwordHash: hashedPassword,
          isAdmin: true,
          emailVerifiedAt: new Date(),
        },
      });
      
      console.log('✅ Admin user created with modified username!');
      console.log('   ID:', admin.id);
      console.log('   Email:', admin.email);
      console.log('   Username:', admin.username);
      console.log('   Is Admin:', admin.isAdmin);
    } else {
      throw error;
    }
  }
}

addAdmin()
  .catch((e) => {
    console.error('❌ Failed to add admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
