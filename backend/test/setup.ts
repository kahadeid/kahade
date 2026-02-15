/**
 * Test Setup (HIGH-044)
 * 
 * Global test configuration and utilities
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

/**
 * Create test application
 */
export async function createTestApp(
  module: any,
): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [module],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

/**
 * Mock Prisma service
 */
export const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  wallet: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  escrow: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((fn) => fn(mockPrismaService)),
};

/**
 * Mock JWT service
 */
export const mockJwtService = {
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ userId: 'test-user-id' })),
};

/**
 * Mock Logger
 */
export const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

/**
 * Test utilities
 */
export class TestUtils {
  /**
   * Create mock user
   */
  static createMockUser(overrides = {}) {
    return {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      phone: '081234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Create mock wallet
   */
  static createMockWallet(overrides = {}) {
    return {
      id: 'wallet-123',
      userId: 'user-123',
      balance: 100000,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Create mock transaction
   */
  static createMockTransaction(overrides = {}) {
    return {
      id: 'txn-123',
      walletId: 'wallet-123',
      amount: 50000,
      type: 'DEPOSIT',
      status: 'COMPLETED',
      createdAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Wait for async operations
   */
  static async wait(ms: number = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Example unit test:
 * 
 * describe('UserService', () => {
 *   let service: UserService;
 *   let prisma: typeof mockPrismaService;
 * 
 *   beforeEach(async () => {
 *     const module = await Test.createTestingModule({
 *       providers: [
 *         UserService,
 *         { provide: PrismaService, useValue: mockPrismaService },
 *       ],
 *     }).compile();
 * 
 *     service = module.get<UserService>(UserService);
 *     prisma = module.get(PrismaService);
 *   });
 * 
 *   it('should create user', async () => {
 *     const userData = TestUtils.createMockUser();
 *     prisma.user.create.mockResolvedValue(userData);
 * 
 *     const result = await service.create(userData);
 *     expect(result).toEqual(userData);
 *   });
 * });
 * 
 * Example E2E test:
 * 
 * describe('AuthController (E2E)', () => {
 *   let app: INestApplication;
 * 
 *   beforeAll(async () => {
 *     app = await createTestApp(AppModule);
 *   });
 * 
 *   afterAll(async () => {
 *     await app.close();
 *   });
 * 
 *   it('/auth/login (POST)', () => {
 *     return request(app.getHttpServer())
 *       .post('/auth/login')
 *       .send({ email: 'test@example.com', password: 'password123' })
 *       .expect(200)
 *       .expect((res) => {
 *         expect(res.body).toHaveProperty('accessToken');
 *       });
 *   });
 * });
 */
