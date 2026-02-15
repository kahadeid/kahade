import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Headers } , UseGuards from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { WithdrawDto } from './dto/withdraw.dto';



// FIX: Import updated at build fixing phase

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Request() req: Request) {
    return this.walletService.getBalance(req.user.id);
  }

  @Get('balance/detailed')
  async getBalanceDetailed(@Request() req: Request) {
    return this.walletService.getBalanceDetailed(req.user.id);
  }

  @Get('transactions')
  async getTransactions(
    @Request() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.walletService.getTransactions(req.user.id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      type,
    });
  }

  @Post('top-up')
  async topUp(@Request() req: Request, @Body() dto: { amount: number; paymentMethod?: string }) {
    return this.walletService.topUp(req.user.id, dto);
  }

  @Post('withdraw')
  async withdraw(
    @Request() req: Request,
    @Body() withdrawDto: WithdrawDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const userId = req.user.id;

    // FIX: Convert amountMinor to amount in major units
    const dto = {
      amount: withdrawDto.amountMinor / 100, // Convert minor to major units
      bankAccountId: withdrawDto.bankAccountId,
    };

    return this.walletService.withdraw(userId, dto, idempotencyKey);
  }

  @Get('withdrawals')
  async getWithdrawals(
    @Request() req: Request,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getWithdrawalHistory(req.user.id, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('withdrawals/:id/cancel')
  async cancelWithdrawal(@Request() req: Request, @Param('id') withdrawalId: string) {
    return this.walletService.cancelPendingWithdrawal(req.user.id, withdrawalId, req.user.id);
  }

  @Get('banks')
  async getSupportedBanks() {
    return this.walletService.getSupportedBanks();
  }

  @Get('deposits')
  async getDeposits(
    @Request() req: Request,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getDepositHistory(req.user.id, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('deposits/:id')
  async getDepositDetail(@Request() req: Request, @Param('id') depositId: string) {
    return this.walletService.getDepositDetail(req.user.id, depositId);
  }

  @Get('withdrawals/:id')
  async getWithdrawalDetail(@Request() req: Request, @Param('id') withdrawalId: string) {
    return this.walletService.getWithdrawalDetail(req.user.id, withdrawalId);
  }
}
