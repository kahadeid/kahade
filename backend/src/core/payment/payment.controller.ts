import { Throttle } from "@nestjs/throttler";

import {
import {
import {
import {
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { PaymentFilterDto } from "./dto/payment-filter.dto";
import { PaymentRepository } from "./payment.repository";
import { PaymentService } from "@integrations/payment/payment.service";

  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiHeader,
} from "@nestjs/swagger";
  CreatePaymentDto,
  PaymentMethod as DtoPaymentMethod,
  EWalletType,
} from "./dto/create-payment.dto";
  PaymentStatus,
  PaymentMethod,
  PaymentType,
  Currency,
} from "@prisma/client";

@ApiTags("payments")
@Controller("payments")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  // ============================================================================
  // PAYMENT OPERATIONS
  // ============================================================================

  @Post()
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @ApiOperation({ summary: "Create a new payment (top-up wallet)" })
  @ApiHeader({
    name: "x-idempotency-key",
    required: true,
    description: "Idempotency key",
  })
  @ApiResponse({
    status: 201,
    description: "Payment created, returns payment URL",
  })
  @ApiResponse({ status: 400, description: "Invalid input" })
  @ApiResponse({ status: 409, description: "Duplicate request" })
  async createPayment(
    @CurrentUser("id") userId: string,
    @CurrentUser("email") userEmail: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    const currency =
      (createPaymentDto.currency?.toUpperCase() as Currency) || Currency.IDR;
    const amountMinor = createPaymentDto.amountMinor;

    const paymentMethod =
      createPaymentDto.method === DtoPaymentMethod.VIRTUAL_ACCOUNT ||
      createPaymentDto.method === DtoPaymentMethod.BANK_TRANSFER
        ? PaymentMethod.VIRTUAL_ACCOUNT
        : createPaymentDto.method === DtoPaymentMethod.E_WALLET
          ? PaymentMethod.EWALLET
          : createPaymentDto.method === DtoPaymentMethod.CREDIT_CARD
            ? PaymentMethod.CREDIT_CARD
            : undefined;

    const payment = await this.paymentRepository.create({
      userId,
      amountMinor: BigInt(amountMinor),
      paymentType: PaymentType.DEPOSIT,
      paymentMethod,
      currency,
      paymentDetails: {
        method: createPaymentDto.method,
        bankCode: createPaymentDto.bankCode,
        eWalletType: createPaymentDto.eWalletType,
        phoneNumber: createPaymentDto.phoneNumber,
      },
    });

    const externalId = payment.id;
    const customerEmail = userEmail || "user@example.com";

    let providerInvoiceId: string | undefined;
    let paymentUrl: string | undefined;
    let expiresAt: Date | undefined;
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Eslint-disable-next-line @typescript-eslint/no-explicit-any
    let paymentDetails: Record<string, any> = {
      method: createPaymentDto.method,
      bankCode: createPaymentDto.bankCode,
      eWalletType: createPaymentDto.eWalletType,
      phoneNumber: createPaymentDto.phoneNumber,
      externalId,
    };

    switch (createPaymentDto.method) {
      case DtoPaymentMethod.BANK_TRANSFER:
      case DtoPaymentMethod.VIRTUAL_ACCOUNT: {
        const bankCode = createPaymentDto.bankCode ?? "BCA";
        const va = await this.paymentService.createVirtualAccount({
          externalId,
          bankCode,
          name: customerEmail,
          expectedAmount: amountMinor,
          isClosed: true,
          isSingleUse: true,
        });
        providerInvoiceId = va.id;
        expiresAt = new Date(va.expiration_date);
        paymentDetails = {
          ...paymentDetails,
          bankCode: va.bank_code,
          accountNumber: va.account_number,
          expirationDate: va.expiration_date,
        };
        break;
      }
      case DtoPaymentMethod.E_WALLET: {
        const channelCode = createPaymentDto.eWalletType ?? EWalletType.GOPAY;
        if (channelCode === EWalletType.OVO && !createPaymentDto.phoneNumber) {
          throw new BadRequestException(
            "Phone number is required for OVO payments",
          );
        }
        const ewallet = await this.paymentService.createEWalletCharge({
          referenceId: externalId,
          currency,
          amount: amountMinor,
          checkoutMethod: "ONE_TIME_PAYMENT",
          channelCode,
          channelProperties: {
            mobileNumber: createPaymentDto.phoneNumber,
          },
        });
        providerInvoiceId = ewallet.id;
        paymentUrl =
          ewallet.actions?.mobile_web_checkout_url ||
          ewallet.actions?.desktop_web_checkout_url ||
          ewallet.actions?.mobile_deeplink_checkout_url;
        paymentDetails = {
          ...paymentDetails,
          channelCode: ewallet.channel_code,
          actions: ewallet.actions,
        };
        break;
      }
      case DtoPaymentMethod.QRIS: {
        const qr = await this.paymentService.createQRCode({
          externalId,
          type: "DYNAMIC",
          currency,
          amount: amountMinor,
        });
        providerInvoiceId = qr.id;
        expiresAt = new Date(qr.expires_at);
        paymentDetails = {
          ...paymentDetails,
          channelCode: qr.channel_code,
          qrString: qr.qr_string,
        };
        break;
      }
      case DtoPaymentMethod.RETAIL_OUTLET:
      case DtoPaymentMethod.CREDIT_CARD:
      default: {
        const invoice = await this.paymentService.createInvoice({
          externalId,
          amount: amountMinor,
          payerEmail: customerEmail,
          description: `Payment for transaction ${externalId}`,
          currency,
        });
        providerInvoiceId = invoice.id;
        paymentUrl = invoice.invoice_url;
        expiresAt = new Date(invoice.expiry_date);
        paymentDetails = {
          ...paymentDetails,
          invoiceUrl: invoice.invoice_url,
        };
        break;
      }
    }

    if (!providerInvoiceId) {
      throw new BadRequestException(
        "Failed to create payment provider invoice",
      );
    }

    await this.paymentRepository.updateDetails(payment.id, {
      providerInvoiceId,
      expiresAt,
      paymentDetails,
    });

    return {
      paymentId: payment.id,
      providerInvoiceId,
      paymentUrl,
      amount: amountMinor,
      currency,
      status: PaymentStatus.PENDING,
      expiresAt,
    };
  }

  @Get()
  @ApiOperation({ summary: "Get user payment history" })
  @ApiResponse({ status: 200, description: "Returns paginated payments" })
  async getPayments(
    @CurrentUser("id") userId: string,
    @Query() filterDto: PaymentFilterDto,
  ) {
    return this.paymentRepository.findMany({
      userId,
      status: filterDto.status as unknown as PaymentStatus,
      paymentMethod: filterDto.method as unknown as PaymentMethod,
      dateFrom: filterDto.dateFrom ? new Date(filterDto.dateFrom) : undefined,
      dateTo: filterDto.dateTo ? new Date(filterDto.dateTo) : undefined,
      page: filterDto.page || 1,
      limit: filterDto.limit || 10,
      sortBy: filterDto.sortBy || "createdAt",
      sortOrder: (filterDto.sortOrder as "asc" | "desc") || "desc",
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get payment details by ID" })
  @ApiParam({ name: "id", description: "Payment ID" })
  @ApiResponse({ status: 200, description: "Returns payment details" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  async getPaymentById(
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) paymentId: string,
  ) {
    const payment = await this.paymentRepository.findByIdForUser(
      paymentId,
      userId,
    );
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }
    return payment;
  }

  @Get(":id/status")
  @ApiOperation({ summary: "Check payment status" })
  @ApiParam({ name: "id", description: "Payment ID" })
  @ApiResponse({ status: 200, description: "Returns payment status" })
  async checkPaymentStatus(
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) paymentId: string,
  ) {
    const payment = await this.paymentRepository.findByIdForUser(
      paymentId,
      userId,
    );
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }
    const paymentMethod = (payment.paymentDetails as { method?: string } | null)
      ?.method as DtoPaymentMethod | undefined;
    const shouldUseProvider =
      payment.providerInvoiceId &&
      (paymentMethod === DtoPaymentMethod.CREDIT_CARD ||
        paymentMethod === DtoPaymentMethod.RETAIL_OUTLET ||
        paymentMethod === undefined);

    if (!shouldUseProvider) {
      return {
        paymentId: payment.id,
        status: payment.status.toLowerCase(),
        paidAt: payment.paidAt,
      };
    }
    const providerInvoiceId = payment.providerInvoiceId;
    if (!providerInvoiceId) {
      throw new NotFoundException("Provider invoice ID not found");
    }
    return this.paymentService.verifyPayment(providerInvoiceId);
  }

  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel a pending payment" })
  @ApiParam({ name: "id", description: "Payment ID" })
  @ApiResponse({ status: 200, description: "Payment cancelled" })
  @ApiResponse({
    status: 400,
    description: "Cannot cancel - payment already processed",
  })
  async cancelPayment(
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) paymentId: string,
  ) {
    const updated = await this.paymentRepository.updateStatusForUser(
      paymentId,
      userId,
      PaymentStatus.FAILED,
    );
    if (!updated) {
      throw new NotFoundException("Payment not found");
    }
    return updated;
  }

  // ============================================================================
  // PAYMENT STATISTICS
  // ============================================================================

  @Get("stats/summary")
  @ApiOperation({ summary: "Get payment statistics" })
  @ApiResponse({ status: 200, description: "Returns payment statistics" })
  async getPaymentStats(@CurrentUser("id") userId: string) {
    return this.paymentRepository.getStats(userId);
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  @Get("health")
  health() {
    return { status: "ok", service: "payments" };
  }
}
