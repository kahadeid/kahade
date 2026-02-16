import { ConfigService } from "@nestjs/config";

import * as crypto from "crypto";

import { IpUtil } from "@common/utils/ip.util";
import { PaymentStatus, WebhookStatus } from "@prisma/client";
import { PrismaService } from "@infrastructure/database/prisma.service";
import { Request } from "express";
import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException,
  BadRequestException,
  Req,
} from "@nestjs/common";

interface XenditInvoiceWebhook {
  id: string;
  external_id: string;
  user_id: string;
  status: string;
  merchant_name: string;
  amount: number;
  paid_amount: number;
  bank_code: string;
  paid_at?: string;
  payer_email: string;
  description: string;
  updated: string;
  created: string;
  currency: string;
  payment_channel: string;
  payment_destination: string;
}

interface XenditDisbursementCallback {
  id: string;
  user_id: string;
  external_id: string;
  amount: number;
  bank_code: string;
  account_holder_name: string;
  disbursement_description: string;
  status: string;
  updated: string;
  created: string;
  email_to?: string[];
  email_cc?: string[];
  email_bcc?: string[];
}

@Controller("webhooks/xendit")
export class XenditWebhookController {
  private readonly logger = new Logger(XenditWebhookController.name);
  private readonly callbackToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.callbackToken = this.configService.get<string>(
      "XENDIT_CALLBACK_TOKEN",
      "",
    );

    if (!this.callbackToken) {
      this.logger.warn(
        "⚠️  XENDIT_CALLBACK_TOKEN not set! Webhook verification will fail.",
      );
    }
  }

  @Post("invoice")
  @HttpCode(HttpStatus.OK)
  async handleInvoiceCallback(
    @Body() payload: XenditInvoiceWebhook,
    @Headers("x-callback-token") callbackToken: string,
    @Req() req: Request,
  ): Promise<{ status: string; message: string }> {
    if (!payload || !payload.id || !payload.external_id || !payload.status) {
      this.logger.warn(
        "Invalid Xendit invoice webhook payload: missing required fields",
      );
      throw new BadRequestException(
        "Invalid webhook payload: missing required fields",
      );
    }

    const requestIp = IpUtil.extractClientIp(req);
    const eventId = payload.id;

    this.logger.log(
      `Received Xendit invoice callback: ${eventId}, status: ${payload.status}`,
    );

    const signatureValid = this.verifyCallbackToken(callbackToken);

    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        provider: "XENDIT",
        eventId,
        eventType: `invoice.${payload.status}`,
        payload: payload as any,
        status: WebhookStatus.PENDING,
        signatureValid,
        signatureError: signatureValid ? null : "Invalid callback token",
        requestIp,
        requestHeaders: this.sanitizeHeaders(req.headers),
        providerEventAt: payload.created ? new Date(payload.created) : null,
      },
    });

    if (!signatureValid) {
      this.logger.error(`Invalid Xendit callback token for invoice ${eventId}`);

      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: WebhookStatus.FAILED,
          processingError: "Invalid callback token",
          processedAt: new Date(),
        },
      });

      throw new UnauthorizedException("Invalid callback token");
    }

    const existingEvent = await this.prisma.webhookEvent.findFirst({
      where: {
        eventId,
        status: WebhookStatus.PROCESSED,
        id: { not: webhookEvent.id },
      },
    });

    if (existingEvent) {
      this.logger.warn(`Duplicate Xendit invoice callback: ${eventId}`);
      return { status: "ok", message: "Already processed" };
    }

    try {
      await this.processInvoiceCallback(payload, webhookEvent.id);

      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: WebhookStatus.PROCESSED,
          processedAt: new Date(),
        },
      });

      return { status: "ok", message: "Processed successfully" };
    } catch (error: unknown) {
      this.logger.error(
        `Failed to process Xendit invoice callback ${eventId}: ${(error as Error).message}`,
      );

      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: WebhookStatus.FAILED,
          processingError: (error as Error).message,
          retryCount: { increment: 1 },
          lastRetryAt: new Date(),
        },
      });

      return { status: "error", message: "Processing failed, will retry" };
    }
  }

  @Post("disbursement")
  @HttpCode(HttpStatus.OK)
  async handleDisbursementCallback(
    @Body() payload: XenditDisbursementCallback,
    @Headers("x-callback-token") callbackToken: string,
    @Req() req: Request,
  ): Promise<{ status: string; message: string }> {
    if (!payload || !payload.id || !payload.external_id || !payload.status) {
      this.logger.warn(
        "Invalid Xendit disbursement webhook payload: missing required fields",
      );
      throw new BadRequestException(
        "Invalid webhook payload: missing required fields",
      );
    }

    const requestIp = IpUtil.extractClientIp(req);
    const eventId = payload.id;

    this.logger.log(
      `Received Xendit disbursement callback: ${eventId}, status: ${payload.status}`,
    );

    const signatureValid = this.verifyCallbackToken(callbackToken);

    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        provider: "XENDIT",
        eventId,
        eventType: `disbursement.${payload.status}`,
        payload: payload as any,
        status: WebhookStatus.PENDING,
        signatureValid,
        signatureError: signatureValid ? null : "Invalid callback token",
        requestIp,
        requestHeaders: this.sanitizeHeaders(req.headers),
        providerEventAt: payload.created ? new Date(payload.created) : null,
      },
    });

    if (!signatureValid) {
      this.logger.error(
        `Invalid Xendit callback token for disbursement ${eventId}`,
      );

      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: WebhookStatus.FAILED,
          processingError: "Invalid callback token",
          processedAt: new Date(),
        },
      });

      throw new UnauthorizedException("Invalid callback token");
    }

    const existingEvent = await this.prisma.webhookEvent.findFirst({
      where: {
        eventId,
        status: WebhookStatus.PROCESSED,
        id: { not: webhookEvent.id },
      },
    });

    if (existingEvent) {
      this.logger.warn(`Duplicate Xendit disbursement callback: ${eventId}`);
      return { status: "ok", message: "Already processed" };
    }

    try {
      await this.processDisbursementCallback(payload, webhookEvent.id);

      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: WebhookStatus.PROCESSED,
          processedAt: new Date(),
        },
      });

      return { status: "ok", message: "Processed successfully" };
    } catch (error: unknown) {
      this.logger.error(
        `Failed to process Xendit disbursement callback ${eventId}: ${(error as Error).message}`,
      );

      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: WebhookStatus.FAILED,
          processingError: (error as Error).message,
          retryCount: { increment: 1 },
          lastRetryAt: new Date(),
        },
      });

      return { status: "error", message: "Processing failed, will retry" };
    }
  }

  private verifyCallbackToken(providedToken: string | undefined): boolean {
    if (!this.callbackToken) {
      this.logger.error("Callback token not configured");
      return false;
    }

    if (!providedToken) {
      this.logger.error("No callback token in headers");
      return false;
    }

    try {
      return crypto.timingSafeEqual(
        Buffer.from(providedToken),
        Buffer.from(this.callbackToken),
      );
    } catch {
      return false;
    }
  }

  private async processInvoiceCallback(
    payload: XenditInvoiceWebhook,
    webhookEventId: string,
  ): Promise<void> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          { providerInvoiceId: payload.id },
          {
            paymentDetails: {
              path: ["external_id"],
              equals: payload.external_id,
            },
          },
        ],
      },
    });

    if (!payment) {
      throw new BadRequestException(
        `Payment not found for invoice ${payload.id}`,
      );
    }

    const newStatus = this.mapInvoiceStatus(payload.status);

    await this.prisma.$transaction(async (tx: any) => {
      await tx.paymentStatusHistory.create({
        data: {
          paymentId: payment.id,
          fromStatus: payment.status,
          toStatus: newStatus,
          webhookEventId,
          reason: `Xendit: ${payload.status}`,
        },
      });

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          paidAt:
            newStatus === PaymentStatus.SUCCESS && payload.paid_at
              ? new Date(payload.paid_at)
              : null,
          paymentDetails: {
            ...(payment.paymentDetails as object),
            xendit_status: payload.status,
            paid_amount: payload.paid_amount,
            payment_channel: payload.payment_channel,
            callback_received_at: new Date().toISOString(),
          },
        },
      });

      await tx.webhookEvent.update({
        where: { id: webhookEventId },
        data: { paymentId: payment.id },
      });

      if (newStatus === PaymentStatus.SUCCESS) {
        await this.handlePaymentCompleted(payment.id, tx);
      }

      if (
        newStatus === PaymentStatus.FAILED ||
        newStatus === PaymentStatus.EXPIRED
      ) {
        await this.handlePaymentFailed(payment.id, tx);
      }
    });

    this.logger.log(
      `Processed Xendit invoice callback for payment ${payment.id}: ${payload.status}`,
    );
  }

  private async processDisbursementCallback(
    payload: XenditDisbursementCallback,
    _webhookEventId: string,
  ): Promise<void> {
    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: { providerDisbursementId: payload.id },
    });

    if (!withdrawal) {
      this.logger.warn(
        `Withdrawal not found for disbursement ${payload.id}, external_id: ${payload.external_id}`,
      );
      return;
    }

    const newStatus = this.mapDisbursementStatus(payload.status);

    await this.prisma.$transaction(async (tx: any) => {
      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: newStatus,
          processedAt: new Date(),
          completedAt: payload.status === "COMPLETED" ? new Date() : null,
          providerResponse: payload,
        },
      });

      if (payload.status === "FAILED") {
        await tx.wallet.update({
          where: { id: withdrawal.walletId },
          data: {
            lockedMinor: { decrement: withdrawal.amountMinor },
          },
        });
      }

      if (payload.status === "COMPLETED") {
        await tx.wallet.update({
          where: { id: withdrawal.walletId },
          data: {
            balanceMinor: { decrement: withdrawal.amountMinor },
            lockedMinor: { decrement: withdrawal.amountMinor },
          },
        });
      }
    });

    this.logger.log(
      `Processed disbursement callback for withdrawal ${withdrawal.id}: ${payload.status}`,
    );
  }

  private async handlePaymentCompleted(
    paymentId: string,
    tx: any,
  ): Promise<void> {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { deposit: true, order: true },
    });

    if (!payment) return;

    if (payment.deposit) {
      await tx.deposit.update({
        where: { id: payment.deposit.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      await tx.wallet.update({
        where: { id: payment.deposit.walletId },
        data: {
          balanceMinor: { increment: payment.deposit.amountMinor },
        },
      });
    }

    if (payment.order) {
      await tx.order.update({
        where: { id: payment.order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });
    }
  }

  private async handlePaymentFailed(paymentId: string, tx: any): Promise<void> {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { deposit: true, order: true },
    });

    if (!payment) return;

    if (payment.deposit) {
      await tx.deposit.update({
        where: { id: payment.deposit.id },
        data: { status: "FAILED" },
      });
    }

    if (payment.order) {
      await tx.order.update({
        where: { id: payment.order.id },
        data: { status: "EXPIRED" },
      });
    }
  }

  private mapInvoiceStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      PAID: PaymentStatus.SUCCESS,
      SETTLED: PaymentStatus.SUCCESS,
      PENDING: PaymentStatus.PENDING,
      EXPIRED: PaymentStatus.EXPIRED,
      FAILED: PaymentStatus.FAILED,
    };

    return statusMap[status] ?? PaymentStatus.PENDING;
  }

  private mapDisbursementStatus(status: string): string {
    const statusMap: Record<string, string> = {
      COMPLETED: "COMPLETED",
      PENDING: "PROCESSING",
      FAILED: "FAILED",
    };

    return statusMap[status] ?? "PENDING";
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    delete sanitized["authorization"];
    delete sanitized["cookie"];
    delete sanitized["x-callback-token"];
    return sanitized;
  }
}
