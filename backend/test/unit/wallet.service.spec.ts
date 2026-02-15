/**
 * Wallet Service Test Suite (MEDIUM-009)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../../src/modules/wallet/wallet.service';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { mockPrismaService, TestUtils } from '../setup';
import { InsufficientBalanceException } from '../../src/common/exceptions/domain-exceptions';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      const wallet = TestUtils.createMockWallet({ balance: 100000 });
      prisma.wallet.findUnique.mockResolvedValue(wallet);

      const result = await service.getBalance('wallet-123');

      expect(result).toEqual(100000);
      expect(prisma.wallet.findUnique).toHaveBeenCalledWith({
        where: { id: 'wallet-123' },
      });
    });

    it('should throw if wallet not found', async () => {
      prisma.wallet.findUnique.mockResolvedValue(null);

      await expect(service.getBalance('invalid')).rejects.toThrow();
    });
  });

  describe('deposit', () => {
    it('should increase wallet balance', async () => {
      const wallet = TestUtils.createMockWallet({ balance: 100000 });
      const updatedWallet = { ...wallet, balance: 150000 };

      prisma.wallet.findUnique.mockResolvedValue(wallet);
      prisma.wallet.update.mockResolvedValue(updatedWallet);

      const result = await service.deposit('wallet-123', 50000);

      expect(result.balance).toBe(150000);
      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { id: 'wallet-123' },
        data: { balance: { increment: 50000 } },
      });
    });

    it('should reject negative amounts', async () => {
      await expect(service.deposit('wallet-123', -1000)).rejects.toThrow();
    });
  });

  describe('withdraw', () => {
    it('should decrease wallet balance', async () => {
      const wallet = TestUtils.createMockWallet({ balance: 100000 });
      const updatedWallet = { ...wallet, balance: 50000 };

      prisma.wallet.findUnique.mockResolvedValue(wallet);
      prisma.wallet.update.mockResolvedValue(updatedWallet);

      const result = await service.withdraw('wallet-123', 50000);

      expect(result.balance).toBe(50000);
    });

    it('should throw InsufficientBalanceException', async () => {
      const wallet = TestUtils.createMockWallet({ balance: 10000 });
      prisma.wallet.findUnique.mockResolvedValue(wallet);

      await expect(
        service.withdraw('wallet-123', 50000),
      ).rejects.toThrow(InsufficientBalanceException);
    });
  });

  describe('transfer', () => {
    it('should transfer between wallets', async () => {
      const fromWallet = TestUtils.createMockWallet({
        id: 'wallet-1',
        balance: 100000,
      });
      const toWallet = TestUtils.createMockWallet({
        id: 'wallet-2',
        balance: 50000,
      });

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(prisma);
      });

      prisma.wallet.findUnique
        .mockResolvedValueOnce(fromWallet)
        .mockResolvedValueOnce(toWallet);

      await service.transfer('wallet-1', 'wallet-2', 30000);

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should fail if sender has insufficient balance', async () => {
      const fromWallet = TestUtils.createMockWallet({ balance: 10000 });
      prisma.wallet.findUnique.mockResolvedValue(fromWallet);

      await expect(
        service.transfer('wallet-1', 'wallet-2', 50000),
      ).rejects.toThrow(InsufficientBalanceException);
    });
  });

  describe('freeze', () => {
    it('should freeze wallet', async () => {
      const wallet = TestUtils.createMockWallet({ status: 'ACTIVE' });
      const frozenWallet = { ...wallet, status: 'FROZEN' };

      prisma.wallet.update.mockResolvedValue(frozenWallet);

      const result = await service.freeze('wallet-123');

      expect(result.status).toBe('FROZEN');
      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { id: 'wallet-123' },
        data: { status: 'FROZEN' },
      });
    });
  });
});
