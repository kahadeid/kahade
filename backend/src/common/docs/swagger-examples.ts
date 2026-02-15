import { ApiProperty } from '@nestjs/swagger';


/**
 * API Documentation Examples (MEDIUM-013)
 *
 * Reusable Swagger/OpenAPI examples
 */

/**
 * User Examples
 */
export class UserExample {
  @ApiProperty({ example: 'user-123-abc' })
  id: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '081234567890' })
  phone: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;
}

/**
 * Wallet Examples
 */
export class WalletExample {
  @ApiProperty({ example: 'wallet-456-def' })
  id: string;

  @ApiProperty({ example: 'user-123-abc' })
  userId: string;

  @ApiProperty({ example: 1500000, description: 'Balance in smallest currency unit (e.g., cents, satoshis)' })
  balance: number;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;
}

/**
 * Escrow Examples
 */
export class EscrowExample {
  @ApiProperty({ example: 'escrow-789-ghi' })
  id: string;

  @ApiProperty({ example: 'user-123-abc' })
  senderId: string;

  @ApiProperty({ example: 'user-456-def' })
  receiverId: string;

  @ApiProperty({ example: 500000 })
  amount: number;

  @ApiProperty({ example: 'Payment for web development services' })
  description: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'DISPUTED'] })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-02T00:00:00Z', nullable: true })
  completedAt: Date | null;
}

/**
 * Transaction Examples
 */
export class TransactionExample {
  @ApiProperty({ example: 'txn-101-jkl' })
  id: string;

  @ApiProperty({ example: 'DEPOSIT', enum: ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'ESCROW_CREATE', 'ESCROW_RELEASE', 'ESCROW_CANCEL'] })
  type: string;

  @ApiProperty({ example: 100000 })
  amount: number;

  @ApiProperty({ example: 'COMPLETED', enum: ['PENDING', 'COMPLETED', 'FAILED'] })
  status: string;

  @ApiProperty({ example: 'REF-2024-001' })
  reference: string;

  @ApiProperty({ example: 'wallet-456-def' })
  walletId: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;
}

/**
 * Error Examples
 */
export class ErrorExample {
  @ApiProperty({ example: 'AUTH_001' })
  code: string;

  @ApiProperty({ example: 'Invalid credentials' })
  message: string;

  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/auth/login' })
  path: string;
}

/**
 * Pagination Examples
 */
export class PaginationExample {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  perPage: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ type: [UserExample] })
  data: unknown[];
}

/**
 * Usage in controllers:
 *
 * @ApiOperation({ summary: 'Get user by ID' })
 * @ApiResponse({
 *   status: 200,
 *   description: 'User found',
 *   type: UserExample
 * })
 * @ApiResponse({
 *   status: 404,
 *   description: 'User not found',
 *   type: ErrorExample
 * })
 * @Get(':id')
 * async getUser(@Param('id') id: string) {
 *   return this.userService.findById(id);
 * }
 */
