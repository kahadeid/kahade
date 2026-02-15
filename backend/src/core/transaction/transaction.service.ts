
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

import {
import {
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { ITransactionResponse } from "../../common/interfaces/transaction.interface";
import { NotificationService } from "@core/notification/notification.service";
import { NotificationType } from "@core/notification/dto/create-notification.dto";
import { PrismaService } from "@infrastructure/database/prisma.service";
import { Transaction } from "../../common/shims/prisma-types.shim";
import { TransactionRepository } from "./transaction.repository";
import { UpdateTransactionStatusDto } from "./dto/update-transaction-status.dto";
import { UserService } from "@core/user/user.service";
import { ValidationUtil } from "@common/utils/validation.util";
import { WalletService } from "@core/wallet/wallet.service";
import { randomBytes, randomUUID } from "crypto";

  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
  PaginationUtil,
  PaginationParams,
} from "@common/utils/pagination.util";

const UPLOAD_DIR = process.env.UPLOAD_DEST || "./uploads";

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  private readonly PLATFORM_FEE_PERCENT = 2.5;

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {
    this.ensureUploadDir();
  }

  private _ensureUploadDir(): void {
    const deliveryDir = path.join(UPLOAD_DIR, "delivery");
    if (!fs.existsSync(deliveryDir)) {
      fs.mkdirSync(deliveryDir, { recursive: true });
    }
  }

  private _storeDeliveryProofFile(
    transactionId: string,
    file: Express.Multer["File"],
  ): string {
    const deliveryDir = path.join(UPLOAD_DIR, "delivery", transactionId);
    if (!fs.existsSync(deliveryDir)) {
      fs.mkdirSync(deliveryDir, { recursive: true });
    }

    const fileHash = crypto
      .createHash("sha256")
      .update(file.buffer)
      .digest("hex");
    const fileExt = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}_${fileHash.substring(0, 8)}.${fileExt}`;
    const filePath = path.join(deliveryDir, fileName);
    const relativePath = `/uploads/delivery/${transactionId}/${fileName}`;

    fs.writeFileSync(filePath, file.buffer);

    return relativePath;
  }

  async create(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<ITransactionResponse> {
    let counterpartyId: string | null = null;

    if (createTransactionDto.counterpartyId) {
      const counterparty = await this.userService.findById(
        createTransactionDto.counterpartyId,
      );
      if (!counterparty) {
        throw new NotFoundException("Counterparty user not found");
      }
      if (counterparty.id === userId) {
        throw new BadRequestException(
          "Cannot create transaction with yourself",
        );
      }
      counterpartyId = counterparty.id;
    } else if (createTransactionDto.counterpartyEmail) {
      const counterparty = await this.userService.findByEmail(
        createTransactionDto.counterpartyEmail,
      );
      if (counterparty) {
        if (counterparty.id === userId) {
          throw new BadRequestException(
            "Cannot create transaction with yourself",
          );
        }
        counterpartyId = counterparty.id;
      }
    }

    const orderNumber = `KHD-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

    const amountMinor = BigInt(Math.round(createTransactionDto.amount));
    const feeBasisPoints = Math.round(this.PLATFORM_FEE_PERCENT * 100);
    const platformFeeMinor = (amountMinor * BigInt(feeBasisPoints)) / 10000n;

    const inviteToken = this.generateInviteToken();

    const transaction = await this.transactionRepository.create({
      orderNumber,
      initiatorId: userId,
      initiatorRole: createTransactionDto.role?.toUpperCase() || "BUYER",
      counterpartyId,
      title: createTransactionDto.title,
      description: createTransactionDto.description,
      category: createTransactionDto.category || "OTHER",
      amountMinor,
      feePayer: createTransactionDto.feePaidBy?.toUpperCase() || "BUYER",
      platformFeeMinor,
      holdingPeriodDays: 7,
      status: counterpartyId ? "PENDING_ACCEPT" : "WAITING_COUNTERPARTY",
      inviteToken,
      inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      terms: createTransactionDto.terms || null,
    });

    this.logger.log(`Transaction created: ${transaction.id} by user ${userId}`);

    if (counterpartyId) {
      await this.notificationService.sendTransactionNotification(
        counterpartyId,
        transaction.id,
        "created",
        transaction.title,
      );
    }

    return this.transformToResponse(transaction);
  }

  /**
   * Findone
   */
  async findOne(id: string, userId?: string): Promise<ITransactionResponse> {
    try {
    let transaction: any = null;

    if (ValidationUtil.isUUID(id)) {
      transaction = await this.transactionRepository.findById(id);
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }

    if (!transaction) {
      transaction = await this.transactionRepository.findByOrderNumber(id);
    }

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (
      userId &&
      transaction.initiatorId !== userId &&
      transaction.counterpartyId !== userId
    ) {
      throw new ForbiddenException("Not authorized to view this transaction");
    }

    return this.transformToResponse(transaction);
  }

  async findByOrderNumber(
    orderNumber: string,
    userId?: string,
  ): Promise<ITransactionResponse> {
    const transaction =
      await this.transactionRepository.findByOrderNumber(orderNumber);

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (
      userId &&
      transaction.initiatorId !== userId &&
      transaction.counterpartyId !== userId
    ) {
      throw new ForbiddenException("Not authorized to view this transaction");
    }

    return this.transformToResponse(transaction);
  }

  /**
   * Findbyinvitetoken
   */
  async findByInviteToken(inviteToken: string): Promise<ITransactionResponse> {
    try {
    const transaction =
      await this.transactionRepository.findByInviteToken(inviteToken);

    if (!transaction) {
      throw new NotFoundException("Invalid or expired invite link");
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }

    return this.transformToResponse(transaction);
  }

  async findAllByUser(
    userId: string,
    params: PaginationParams & { status?: string; role?: string },
  ) {
    const { page = 1, limit = 10, status, role } = params;
    const skip = PaginationUtil.getSkip(page, limit);

    const { transactions, total } = await this.transactionRepository.findByUser(
      userId,
      skip,
      limit,
      { status, role },
    );

    const transformedTransactions = transactions.map((t: any) =>
      this.transformToResponse(t),
    );

    return PaginationUtil.paginate(transformedTransactions, total, page, limit);
  }

  /**
   * Accept
   */
  async accept(id: string, userId: string): Promise<ITransactionResponse> {
    try {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }

    if (transaction.counterpartyId !== userId) {
      throw new ForbiddenException(
        "Only the counterparty can accept this transaction",
      );
    }

    if (transaction.status !== "PENDING_ACCEPT") {
      throw new BadRequestException(
        "Transaction cannot be accepted in current status",
      );
    }

    const updated = await this.transactionRepository.update(id, {
      status: "ACCEPTED",
      acceptedAt: new Date(),
    });

    this.logger.log(`Transaction ${id} accepted by user ${userId}`);

    await this.notificationService.sendTransactionNotification(
      transaction.initiatorId,
      transaction.id,
      "accepted",
      transaction.title,
    );

    return this.transformToResponse(updated);
  }

  async acceptByInvite(
    inviteToken: string,
    userId: string,
  ): Promise<ITransactionResponse> {
    const transaction =
      await this.transactionRepository.findByInviteToken(inviteToken);

    if (!transaction) {
      throw new NotFoundException("Invalid or expired invite link");
    }

    if (transaction.initiatorId === userId) {
      throw new BadRequestException("Cannot accept your own transaction");
    }

    if (transaction.counterpartyId && transaction.counterpartyId !== userId) {
      throw new ForbiddenException("This transaction is for a different user");
    }

    const updateData: any = {
      status: "ACCEPTED",
      acceptedAt: new Date(),
    };

    if (!transaction.counterpartyId) {
      updateData.counterpartyId = userId;
    }

    const updated = await this.transactionRepository.update(
      transaction.id,
      updateData,
    );

    this.logger.log(
      `Transaction ${transaction.id} accepted via invite by user ${userId}`,
    );

    await this.notificationService.sendTransactionNotification(
      transaction.initiatorId,
      transaction.id,
      "accepted",
      transaction.title,
    );

    return this.transformToResponse(updated);
  }

  async reject(
    id: string,
    userId: string,
    _reason?: string,
  ): Promise<ITransactionResponse> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (transaction.counterpartyId !== userId) {
      throw new ForbiddenException(
        "Only the counterparty can reject this transaction",
      );
    }

    if (transaction.status !== "PENDING_ACCEPT") {
      throw new BadRequestException(
        "Transaction cannot be rejected in current status",
      );
    }

    const updated = await this.transactionRepository.update(id, {
      status: "CANCELLED",
      cancelledAt: new Date(),
    });

    this.logger.log(`Transaction ${id} rejected by user ${userId}`);

    return this.transformToResponse(updated);
  }

  /**
   * Pay
   */
  async pay(id: string, userId: string): Promise<ITransactionResponse> {
    try {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }

    const buyerId =
      transaction.initiatorRole === "BUYER"
        ? transaction.initiatorId
        : transaction.counterpartyId;

    if (buyerId !== userId) {
      throw new ForbiddenException("Only buyer can make payment");
    }

    if (transaction.status !== "ACCEPTED") {
      throw new BadRequestException(
        "Transaction must be accepted before payment",
      );
    }

    const amountMinor = transaction.amountMinor || BigInt(0);
    const platformFeeMinor = transaction.platformFeeMinor || BigInt(0);

    let totalToPay = amountMinor;
    if (transaction.feePayer === "BUYER") {
      totalToPay = amountMinor + platformFeeMinor;
    } else if (transaction.feePayer === "SPLIT") {
      totalToPay = amountMinor + platformFeeMinor / BigInt(2);
    }

    try {
      await this.walletService.lockBalance({
        userId: buyerId as string,
        amount: totalToPay,
        reason: `Escrow for transaction ${transaction.orderNumber}`,
        initiatedBy: 'system',
      });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to lock balance for transaction ${id}: ${(error as Error).message}`,
      );
      throw new BadRequestException(
        "Insufficient balance to pay for this transaction",
      );
    }

    const buyerWallet = await this.prisma.wallet.findUnique({
      where: { userId: buyerId as string },
    });

    if (!buyerWallet) {
      throw new BadRequestException("Buyer wallet not found");
    }

    const sellerId =
      transaction.initiatorRole === "SELLER"
        ? transaction.initiatorId
        : transaction.counterpartyId;
    const sellerWallet = sellerId
      ? await this.prisma.wallet.findUnique({ where: { userId: sellerId } })
      : null;

    await (this.prisma as any).escrowHold.create({
      data: {
        orderId: transaction.id,
        buyerWalletId: buyerWallet.id,
        sellerWalletId: sellerWallet?.id,
        amountMinor: totalToPay,
        status: "HELD",
      },
    });

    const updated = await this.transactionRepository.update(id, {
      status: "PAID",
      paidAt: new Date(),
    });

    this.logger.log(`Transaction ${id} paid by user ${userId}`);

    if (sellerId) {
      await this.notificationService.sendTransactionNotification(
        sellerId,
        transaction.id,
        "paid",
        transaction.title,
      );
    }

    return this.transformToResponse(updated);
  }

  async confirmDelivery(
    id: string,
    userId: string,
    proofUrl?: string,
    notes?: string,
  ): Promise<ITransactionResponse> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    const sellerId =
      transaction.initiatorRole === "SELLER"
        ? transaction.initiatorId
        : transaction.counterpartyId;

    if (sellerId !== userId) {
      throw new ForbiddenException("Only seller can confirm delivery");
    }

    if (transaction.status !== "PAID") {
      throw new BadRequestException(
        "Payment must be confirmed before delivery",
      );
    }

    if (proofUrl) {
      await (this.prisma as any).deliveryProof.create({
        data: {
          orderId: transaction.id,
          fileUrls: [proofUrl],
          notes: notes?.trim() || "Delivery proof submitted",
        },
      });
    }

    const autoReleaseAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updated = await this.transactionRepository.update(id, {
      autoReleaseAt,
    });

    this.logger.log(`Transaction ${id} delivery confirmed by seller ${userId}`);

    const buyerId =
      transaction.initiatorRole === "BUYER"
        ? transaction.initiatorId
        : transaction.counterpartyId;
    if (buyerId) {
      await this.notificationService.createForUser(
        buyerId,
        "TRANSACTION" as any,
        "Delivery Confirmed",
        `The seller has confirmed delivery for "${transaction.title}". Please confirm receipt within 7 days.`,
        { transactionId: transaction.id },
      );
    }

    return this.transformToResponse(updated);
  }

  async confirmReceipt(
    id: string,
    userId: string,
  ): Promise<ITransactionResponse> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    const buyerId =
      transaction.initiatorRole === "BUYER"
        ? transaction.initiatorId
        : transaction.counterpartyId;

    if (buyerId !== userId) {
      throw new ForbiddenException("Only buyer can confirm receipt");
    }

    if (transaction.status !== "PAID") {
      throw new BadRequestException(
        "Transaction must be paid before confirming receipt",
      );
    }

    const sellerId =
      transaction.initiatorRole === "SELLER"
        ? transaction.initiatorId
        : transaction.counterpartyId;

    if (!sellerId) {
      throw new BadRequestException("No seller found for this transaction");
    }

    try {
      const amountMinor = transaction.amountMinor || BigInt(0);
      const platformFeeMinor = transaction.platformFeeMinor || BigInt(0);

      let sellerAmount = amountMinor;
      if (transaction.feePayer === "SELLER") {
        sellerAmount = amountMinor - platformFeeMinor;
      } else if (transaction.feePayer === "SPLIT") {
        sellerAmount = amountMinor - platformFeeMinor / BigInt(2);
      }

      await this.walletService.transferLockedBalance(
        buyerId as string,
        sellerId,
        sellerAmount,
        `Payment for transaction ${transaction.orderNumber}`,
        'system',
      );

      await (this.prisma as any).escrowHold.updateMany({
        where: { orderId: transaction.id },
        data: { status: "RELEASED", resolvedAt: new Date() },
      });

      const updated = await this.transactionRepository.update(id, {
        status: "COMPLETED",
        completedAt: new Date(),
      });

      this.logger.log(
        `Transaction ${id} completed - funds released to seller ${sellerId}`,
      );

      await this.processReferralReward(buyerId as string, transaction.id);
      await this.processReferralReward(sellerId, transaction.id);

      await this.notificationService.sendTransactionNotification(
        sellerId,
        transaction.id,
        "completed",
        transaction.title,
      );

      return this.transformToResponse(updated);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to release funds for transaction ${id}: ${(error as Error).message}`,
      );
      throw new BadRequestException("Failed to release funds");
    }
  }

  async dispute(
    id: string,
    userId: string,
    data: { reason: string; description: string },
  ): Promise<ITransactionResponse> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (
      transaction.initiatorId !== userId &&
      transaction.counterpartyId !== userId
    ) {
      throw new ForbiddenException(
        "Not authorized to dispute this transaction",
      );
    }

    if (transaction.status !== "PAID") {
      throw new BadRequestException("Only paid transactions can be disputed");
    }

    const disputeReason = data.description
      ? `${data.reason} - ${data.description}`
      : data.reason;

    await (this.prisma as any).dispute.create({
      data: {
        orderId: transaction.id,
        openedBy: userId,
        reason: disputeReason,
        status: "OPEN",
      },
    });

    const updated = await this.transactionRepository.update(id, {
      status: "DISPUTED",
    });

    this.logger.log(`Transaction ${id} disputed by user ${userId}`);

    const otherPartyId =
      transaction.initiatorId === userId
        ? transaction.counterpartyId
        : transaction.initiatorId;
    if (otherPartyId) {
      await this.notificationService.sendTransactionNotification(
        otherPartyId,
        transaction.id,
        "disputed",
        transaction.title,
      );
    }

    return this.transformToResponse(updated);
  }

  async cancel(
    id: string,
    userId: string,
    _reason?: string,
  ): Promise<ITransactionResponse> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (
      transaction.initiatorId !== userId &&
      transaction.counterpartyId !== userId
    ) {
      throw new ForbiddenException("Not authorized to cancel this transaction");
    }

    if (transaction.status === "COMPLETED") {
      throw new BadRequestException("Cannot cancel completed transaction");
    }

    if (transaction.status === "PAID") {
      throw new BadRequestException(
        "Cannot cancel paid transaction - please dispute instead",
      );
    }

    const updated = await this.transactionRepository.update(id, {
      status: "CANCELLED",
      cancelledAt: new Date(),
    });

    this.logger.log(`Transaction ${id} cancelled by user ${userId}`);

    const otherPartyId =
      transaction.initiatorId === userId
        ? transaction.counterpartyId
        : transaction.initiatorId;
    if (otherPartyId) {
      await this.notificationService.sendTransactionNotification(
        otherPartyId,
        transaction.id,
        "cancelled",
        transaction.title,
      );
    }

    return this.transformToResponse(updated);
  }

  async rate(
    id: string,
    userId: string,
    data: { score: number; comment?: string },
  ): Promise<{ message: string }> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (
      transaction.initiatorId !== userId &&
      transaction.counterpartyId !== userId
    ) {
      throw new ForbiddenException("Not authorized to rate this transaction");
    }

    if (transaction.status !== "COMPLETED") {
      throw new BadRequestException("Only completed transactions can be rated");
    }

    const ratedUserId =
      transaction.initiatorId === userId
        ? transaction.counterpartyId
        : transaction.initiatorId;

    if (!ratedUserId) {
      throw new BadRequestException("No counterparty to rate");
    }

    const existingRating = await (this.prisma as any).rating.findFirst({
      where: {
        orderId: transaction.id,
        fromUserId: userId,
      },
    });

    if (existingRating) {
      throw new BadRequestException("You have already rated this transaction");
    }

    await (this.prisma as any).rating.create({
      data: {
        orderId: transaction.id,
        fromUserId: userId,
        toUserId: ratedUserId,
        score: data.score,
        review: data.comment,
      },
    });

    this.logger.log(`Transaction ${id} rated by user ${userId}`);

    return { message: "Rating submitted successfully" };
  }

  async updateStatus(
    id: string,
    userId: string,
    updateStatusDto: UpdateTransactionStatusDto,
  ): Promise<ITransactionResponse> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (
      transaction.initiatorId !== userId &&
      transaction.counterpartyId !== userId
    ) {
      throw new ForbiddenException("Not authorized to update this transaction");
    }

    this.validateStatusTransition(transaction.status, updateStatusDto.status);

    const updated = await this.transactionRepository.update(id, {
      status: updateStatusDto.status,
    });

    return this.transformToResponse(updated);
  }

  private _validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): void {
    const validTransitions: Record<string, string[]> = {
      WAITING_COUNTERPARTY: ["PENDING_ACCEPT", "CANCELLED"],
      PENDING_ACCEPT: ["ACCEPTED", "CANCELLED"],
      ACCEPTED: ["PAID", "CANCELLED"],
      PAID: ["COMPLETED", "DISPUTED", "REFUNDED"],
      DISPUTED: ["COMPLETED", "REFUNDED"],
      CANCELLED: [],
      COMPLETED: [],
      REFUNDED: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private _generateInviteToken(): string {
    return randomBytes(9)
      .toString("base64")
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 12);
  }

  /**
   * Gettimeline
   */
  async getTimeline(transactionId: string, userId: string): Promise<any[]> {
    try {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }

    if (
      transaction.initiatorId !== userId &&
      transaction.counterpartyId !== userId
    ) {
      throw new ForbiddenException("Access denied");
    }

    const timeline: Array<{
      event: string;
      timestamp: Date | null;
      description: string;
    }> = [];
    timeline.push({
      event: "created",
      timestamp: transaction.createdAt,
      description: "Transaction created",
    });

    if (transaction.acceptedAt) {
      timeline.push({
        event: "accepted",
        timestamp: transaction.acceptedAt,
        description: "Transaction accepted",
      });
    }
    if (transaction.paidAt) {
      timeline.push({
        event: "paid",
        timestamp: transaction.paidAt,
        description: "Payment confirmed",
      });
    }
    if (transaction.completedAt) {
      timeline.push({
        event: "completed",
        timestamp: transaction.completedAt,
        description: "Transaction completed",
      });
    }
    if (transaction.cancelledAt) {
      timeline.push({
        event: "cancelled",
        timestamp: transaction.cancelledAt,
        description: "Transaction cancelled",
      });
    }

    return timeline;
  }

  /**
   * Getmessages
   */
  async getMessages(transactionId: string, userId: string): Promise<any[]> {
    try {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }

    if (
      transaction.initiatorId !== userId &&
      transaction.counterpartyId !== userId
    ) {
      throw new ForbiddenException("Access denied");
    }

    const messages = await this.prisma.orderComment.findMany({
      where: { orderId: transactionId },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, username: true } } },
    });

    return messages;
  }

  async sendMessage(
    transactionId: string,
    userId: string,
    message: string,
  ): Promise<any> {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (
      transaction.initiatorId !== userId &&
      transaction.counterpartyId !== userId
    ) {
      throw new ForbiddenException("Access denied");
    }

    const comment = await this.prisma.orderComment.create({
      data: {
        orderId: transactionId,
        userId,
        message: message,
      },
      include: { user: { select: { id: true, username: true } } },
    });

    return comment;
  }

  /**
   * Getratings
   */
  async getRatings(transactionId: string, userId: string): Promise<any[]> {
    try {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }

    if (
      transaction.initiatorId !== userId &&
      transaction.counterpartyId !== userId
    ) {
      throw new ForbiddenException("Access denied");
    }

    const ratings = await (this.prisma as any).rating.findMany({
      where: { orderId: transactionId },
      include: {
        fromUser: { select: { id: true, username: true } },
        toUser: { select: { id: true, username: true } },
      },
    });

    return ratings;
  }

  async submitDeliveryProof(
    transactionId: string,
    userId: string,
    data: {
      courier?: string;
      trackingNumber?: string;
      notes?: string;
      fileUrls?: string[];
    },
    file?: Express.Multer["File"],
  ): Promise<any> {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    const sellerId =
      transaction.initiatorRole === "SELLER"
        ? transaction.initiatorId
        : transaction.counterpartyId;

    if (sellerId !== userId) {
      throw new ForbiddenException("Only seller can submit delivery proof");
    }

    if (transaction.status !== "PAID") {
      throw new BadRequestException(
        "Delivery proof can only be submitted for paid transactions",
      );
    }

    const existingProof = await (this.prisma as any).deliveryProof.findUnique({
      where: { orderId: transactionId },
    });

    const uploadedUrl = file
      ? this.storeDeliveryProofFile(transactionId, file)
      : null;
    const existingUrls = (existingProof?.fileUrls as string[]) || [];
    const providedUrls = data.fileUrls || [];
    let resolvedUrls = providedUrls.length > 0 ? providedUrls : existingUrls;
    if (uploadedUrl) {
      resolvedUrls = [...resolvedUrls, uploadedUrl];
    }

    if (existingProof) {
      const updatedProof = await (this.prisma as any).deliveryProof.update({
        where: { orderId: transactionId },
        data: {
          courier: data.courier || existingProof.courier,
          trackingNumber: data.trackingNumber || existingProof.trackingNumber,
          notes: data.notes || existingProof.notes,
          fileUrls: resolvedUrls,
        },
      });
      return updatedProof;
    }

    const deliveryProof = await (this.prisma as any).deliveryProof.create({
      data: {
        orderId: transactionId,
        courier: data.courier || null,
        trackingNumber: data.trackingNumber || null,
        notes: data.notes || "",
        fileUrls: resolvedUrls,
      },
    });

    this.logger.log(
      `Delivery proof submitted for transaction ${transactionId} by seller ${userId}`,
    );

    return deliveryProof;
  }

  /**
   * Getdeliveryproof
   */
  async getDeliveryProof(transactionId: string, userId: string): Promise<any> {
    try {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    } catch (error) {
      this.logger.error(`Error in method: ${error.message}`, error.stack);
      throw error;
    }
    }

    if (
      transaction.initiatorId !== userId &&
      transaction.counterpartyId !== userId
    ) {
      throw new ForbiddenException("Access denied");
    }

    const deliveryProof = await (this.prisma as any).deliveryProof.findUnique({
      where: { orderId: transactionId },
    });

    return deliveryProof;
  }

  private async processReferralReward(
    userId: string,
    transactionId: string,
  ): Promise<void> {
    try {
      const referralUsage = await (this.prisma as any).referralUsage.findFirst({
        where: {
          referredUserId: userId,
          status: "PENDING",
        },
        include: {
          referralCode: true,
        },
      });

      if (!referralUsage) {
        return;
      }

      const completedTransactions = await this.prisma.order.count({
        where: {
          OR: [{ initiatorId: userId }, { counterpartyId: userId }],
          status: "COMPLETED",
        },
      });

      if (completedTransactions > 1) {
        return;
      }

      const REFERRAL_REWARD_AMOUNT = 2500000n;

      await this.prisma.$transaction(async (tx: any) => {
        await tx.referralUsage.update({
          where: { id: referralUsage.id },
          data: {
            status: "ACTIVE",
            completedAt: new Date(),
          },
        });

        await tx.referralReward.create({
          data: {
            userId: referralUsage.referrerId,
            referralUsageId: referralUsage.id,
            rewardType: "COMMISSION",
            amountMinor: REFERRAL_REWARD_AMOUNT,
            status: "PENDING",
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        });

        await tx.referralReward.create({
          data: {
            userId: userId,
            referralUsageId: referralUsage.id,
            rewardType: "CASHBACK",
            amountMinor: REFERRAL_REWARD_AMOUNT,
            status: "PENDING",
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        });

        this.logger.log(
          `Referral rewards created for referrer ${referralUsage.referrerId} and referred user ${userId}`,
        );
      });

      try {
        await this.notificationService.createForUser(
          referralUsage.referrerId,
          NotificationType.REFERRAL_COMPLETED,
          "Referral Reward Earned!",
          `Your referral has completed their first transaction. You earned Rp 25,000!`,
          { referralUsageId: referralUsage.id, transactionId },
        );
      } catch (notifError) {
        this.logger.warn(`Failed to send referral notification: ${notifError}`);
      }
    } catch (error: unknown) {
      this.logger.error(`Failed to process referral reward: ${error}`);
    }
  }

  private _transformToResponse(
    transaction: Transaction & any,
  ): ITransactionResponse {
    const amountMinor = transaction.amountMinor || BigInt(0);
    const platformFeeMinor = transaction.platformFeeMinor || BigInt(0);

    return {
      id: transaction.id,
      orderNumber: transaction.orderNumber,
      initiatorId: transaction.initiatorId,
      counterpartyId: transaction.counterpartyId,
      initiatorRole: transaction.initiatorRole,
      title: transaction.title,
      description: transaction.description,
      category: transaction.category,
      amount: Number(amountMinor) / 100,
      platformFee: Number(platformFeeMinor) / 100,
      feePayer: transaction.feePayer,
      status: transaction.status,
      terms: transaction.customTerms || transaction.terms,
      inviteToken: transaction.inviteToken,
      inviteExpiresAt: transaction.inviteExpiresAt,
      acceptedAt: transaction.acceptedAt,
      paidAt: transaction.paidAt,
      completedAt: transaction.completedAt,
      cancelledAt: transaction.cancelledAt,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      initiator: transaction.initiator,
      counterparty: transaction.counterparty,
      escrowHold: transaction.escrowHold,
      deliveryProof: transaction.deliveryProof,
      dispute: transaction.dispute,
      ratings: transaction.ratings,
    };
  }
}
