/**
 * Transaction Service Test Suite (MEDIUM-011)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../src/modules/transaction/transaction.service';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { mockPrismaService, TestUtils } from '../setup';

describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create transaction record', async () => {
      const transaction = {
        id: 'txn-123',
        type: 'DEPOSIT',
        amount: 50000,
        status: 'COMPLETED',
        walletId: 'wallet-123',
      };

      prisma.transaction.create.mockResolvedValue(transaction);

      const result = await service.create({
        type: 'DEPOSIT',
        amount: 50000,
        walletId: 'wallet-123',
      });

      expect(result.id).toBe('txn-123');
      expect(prisma.transaction.create).toHaveBeenCalled();
    });
  });

  describe('getByWallet', () => {
    it('should return wallet transactions', async () => {
      const transactions = [
        {
          id: 'txn-1',
          type: 'DEPOSIT',
          amount: 50000,
          walletId: 'wallet-123',
        },
        {
          id: 'txn-2',
          type: 'WITHDRAWAL',
          amount: 20000,
          walletId: 'wallet-123',
        },
      ];

      prisma.transaction.findMany.mockResolvedValue(transactions);

      const result = await service.getByWallet('wallet-123');

      expect(result).toHaveLength(2);
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { walletId: 'wallet-123' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getByReference', () => {
    it('should find transaction by reference', async () => {
      const transaction = {
        id: 'txn-123',
        reference: 'REF-123',
        amount: 50000,
      };

      prisma.transaction.findUnique.mockResolvedValue(transaction);

      const result = await service.getByReference('REF-123');

      expect(result.id).toBe('txn-123');
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', async () => {
      const transaction = {
        id: 'txn-123',
        status: 'PENDING',
      };

      const updated = { ...transaction, status: 'COMPLETED' };

      prisma.transaction.findUnique.mockResolvedValue(transaction);
      prisma.transaction.update.mockResolvedValue(updated);

      const result = await service.updateStatus('txn-123', 'COMPLETED');

      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('reconcile', () => {
    it('should reconcile transactions', async () => {
      const transactions = [
        { id: 'txn-1', amount: 50000, type: 'DEPOSIT' },
        { id: 'txn-2', amount: 20000, type: 'WITHDRAWAL' },
      ];

      prisma.transaction.findMany.mockResolvedValue(transactions);

      const result = await service.reconcile('wallet-123', '2024-01-01');

      expect(result.total).toBe(30000); // 50000 - 20000
      expect(result.count).toBe(2);
    });
  });
});
