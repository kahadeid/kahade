/**
 * Integration Test Framework (MEDIUM-012)
 * 
 * Tests interaction between Wallet and Escrow services
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';

describe('Wallet-Escrow Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();

    // Setup test user
    const authResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'integration@test.com',
        password: 'Password123!',
        name: 'Integration Test',
        phone: '081234567890',
      });

    userId = authResponse.body.id;

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'integration@test.com',
        password: 'Password123!',
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Complete Escrow Flow', () => {
    it('should complete full escrow lifecycle', async () => {
      // 1. Deposit funds to wallet
      const depositRes = await request(app.getHttpServer())
        .post('/wallet/deposit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ amount: 100000 })
        .expect(200);

      expect(depositRes.body.balance).toBeGreaterThanOrEqual(100000);

      // 2. Create escrow (deducts from wallet)
      const escrowRes = await request(app.getHttpServer())
        .post('/escrow')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 50000,
          receiverId: 'receiver-user-id',
          description: 'Integration test escrow',
        })
        .expect(201);

      const escrowId = escrowRes.body.id;
      expect(escrowRes.body.status).toBe('PENDING');

      // 3. Check wallet balance decreased
      const walletRes = await request(app.getHttpServer())
        .get('/wallet')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(walletRes.body.balance).toBe(50000);

      // 4. Release escrow
      await request(app.getHttpServer())
        .post(`/escrow/${escrowId}/release`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // 5. Verify escrow completed
      const escrowStatusRes = await request(app.getHttpServer())
        .get(`/escrow/${escrowId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(escrowStatusRes.body.status).toBe('COMPLETED');

      // 6. Check transaction history
      const txnRes = await request(app.getHttpServer())
        .get('/transaction/history')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(txnRes.body.length).toBeGreaterThan(0);
      expect(txnRes.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'ESCROW_CREATE',
            amount: 50000,
          }),
        ]),
      );
    });

    it('should handle escrow cancellation', async () => {
      // Create escrow
      const escrowRes = await request(app.getHttpServer())
        .post('/escrow')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 20000,
          receiverId: 'receiver-user-id',
          description: 'Test cancellation',
        })
        .expect(201);

      const escrowId = escrowRes.body.id;

      // Get wallet balance before cancel
      const walletBefore = await request(app.getHttpServer())
        .get('/wallet')
        .set('Authorization', `Bearer ${accessToken}`);

      // Cancel escrow (should refund)
      await request(app.getHttpServer())
        .post(`/escrow/${escrowId}/cancel`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Check wallet balance increased
      const walletAfter = await request(app.getHttpServer())
        .get('/wallet')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(walletAfter.body.balance).toBe(
        walletBefore.body.balance + 20000,
      );
    });

    it('should prevent double-release', async () => {
      // Create and release escrow
      const escrowRes = await request(app.getHttpServer())
        .post('/escrow')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 10000,
          receiverId: 'receiver-user-id',
          description: 'Double release test',
        })
        .expect(201);

      const escrowId = escrowRes.body.id;

      // First release - should succeed
      await request(app.getHttpServer())
        .post(`/escrow/${escrowId}/release`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Second release - should fail
      await request(app.getHttpServer())
        .post(`/escrow/${escrowId}/release`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });
});
