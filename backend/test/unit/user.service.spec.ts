/**
 * Comprehensive Unit Test Suite (MEDIUM-001)
 * 
 * Example unit tests for UserService
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/modules/user/user.service';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { mockPrismaService, TestUtils } from '../setup';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createDto = {
        email: 'test@example.com',
        name: 'Test User',
        phone: '081234567890',
      };

      const expectedUser = TestUtils.createMockUser(createDto);
      prisma.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException if email exists', async () => {
      const createDto = {
        email: 'existing@example.com',
        name: 'Test User',
        phone: '081234567890',
      };

      prisma.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const userId = 'user-123';
      const expectedUser = TestUtils.createMockUser({ id: userId });
      prisma.user.findUnique.mockResolvedValue(expectedUser);

      const result = await service.findById(userId);

      expect(result).toEqual(expectedUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'non-existent';
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const userId = 'user-123';
      const updateDto = { name: 'Updated Name' };
      const expectedUser = TestUtils.createMockUser({
        id: userId,
        ...updateDto,
      });

      prisma.user.update.mockResolvedValue(expectedUser);

      const result = await service.update(userId, updateDto);

      expect(result).toEqual(expectedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateDto,
      });
    });
  });

  describe('delete', () => {
    it('should soft delete user', async () => {
      const userId = 'user-123';
      const deletedUser = TestUtils.createMockUser({
        id: userId,
        deletedAt: new Date(),
      });

      prisma.user.update.mockResolvedValue(deletedUser);

      await service.delete(userId);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [
        TestUtils.createMockUser({ id: 'user-1' }),
        TestUtils.createMockUser({ id: 'user-2' }),
      ];

      prisma.user.findMany.mockResolvedValue(users);

      const result = await service.findAll({ page: 1, perPage: 10 });

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { deletedAt: null },
      });
    });
  });
});

/**
 * Run tests:
 * npm run test -- user.service.spec.ts
 * npm run test:watch -- user.service.spec.ts
 * npm run test:cov -- user.service.spec.ts
 */
