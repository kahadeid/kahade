/**
 * Escrow Service Test Suite (MEDIUM-010)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EscrowService } from '../../src/modules/escrow/escrow.service';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { mockPrismaService, TestUtils } from '../setup';
import { InvalidStatusException } from '../../src/common/exceptions/domain-exceptions';

describe('EscrowService', () => {
  let service: EscrowService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EscrowService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EscrowService>(EscrowService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create escrow and deduct from sender wallet', async () => {
      const wallet = TestUtils.createMockWallet({ balance: 100000 });
      const escrow = {
        id: 'escrow-123',
        amount: 50000,
        status: 'PENDING',
        senderId: 'user-1',
        receiverId: 'user-2',
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(prisma);
      });

      prisma.wallet.findUnique.mockResolvedValue(wallet);
      prisma.escrow.create.mockResolvedValue(escrow);

      const result = await service.create({
        senderId: 'user-1',
        receiverId: 'user-2',
        amount: 50000,
        description: 'Test escrow',
      });

      expect(result.id).toBe('escrow-123');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw if sender has insufficient balance', async () => {
      const wallet = TestUtils.createMockWallet({ balance: 10000 });
      prisma.wallet.findUnique.mockResolvedValue(wallet);

      await expect(
        service.create({
          senderId: 'user-1',
          receiverId: 'user-2',
          amount: 50000,
          description: 'Test',
        }),
      ).rejects.toThrow();
    });
  });

  describe('release', () => {
    it('should release escrow to receiver', async () => {
      const escrow = {
        id: 'escrow-123',
        amount: 50000,
        status: 'PENDING',
        senderId: 'user-1',
        receiverId: 'user-2',
      };

      prisma.escrow.findUnique.mockResolvedValue(escrow);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(prisma);
      });

      await service.release('escrow-123', 'user-1');

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw if escrow not pending', async () => {
      const escrow = {
        id: 'escrow-123',
        status: 'COMPLETED',
        senderId: 'user-1',
      };

      prisma.escrow.findUnique.mockResolvedValue(escrow);

      await expect(service.release('escrow-123', 'user-1')).rejects.toThrow(
        InvalidStatusException,
      );
    });

    it('should throw if not authorized', async () => {
      const escrow = {
        id: 'escrow-123',
        status: 'PENDING',
        senderId: 'user-1',
      };

      prisma.escrow.findUnique.mockResolvedValue(escrow);

      await expect(service.release('escrow-123', 'user-2')).rejects.toThrow();
    });
  });

  describe('cancel', () => {
    it('should cancel escrow and refund sender', async () => {
      const escrow = {
        id: 'escrow-123',
        amount: 50000,
        status: 'PENDING',
        senderId: 'user-1',
      };

      prisma.escrow.findUnique.mockResolvedValue(escrow);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(prisma);
      });

      await service.cancel('escrow-123', 'user-1');

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('dispute', () => {
    it('should mark escrow as disputed', async () => {
      const escrow = {
        id: 'escrow-123',
        status: 'PENDING',
        receiverId: 'user-2',
      };

      const disputedEscrow = { ...escrow, status: 'DISPUTED' };

      prisma.escrow.findUnique.mockResolvedValue(escrow);
      prisma.escrow.update.mockResolvedValue(disputedEscrow);

      const result = await service.dispute('escrow-123', 'user-2', 'Issue');

      expect(result.status).toBe('DISPUTED');
    });
  });
});
