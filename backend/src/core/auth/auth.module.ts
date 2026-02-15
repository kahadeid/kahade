import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BruteForceService } from './brute-force.service';
import { EmailModule } from '@integrations/email/email.module';
import { EnhancedMFAService } from './enhanced-mfa.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { MFAController } from './mfa.controller';
import { MfaService } from './mfa.service';
import { SessionRepository } from './session.repository';
import { SmsModule } from '@integrations/sms/sms.module';
import { TokenBlacklistService } from './token-blacklist.service';
import { UserModule } from '../user/user.module';



@Module({
  imports: [
    UserModule,
    PassportModule,
    SmsModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController, MFAController],
  providers: [
    TokenBlacklistService,
    AuthService,
    JwtStrategy,
    LocalStrategy,
    SessionRepository,
    MfaService,
    BruteForceService,
    EnhancedMFAService,
  ],
  exports: [AuthService, MfaService, BruteForceService, EnhancedMFAService],
})
export class AuthModule {}
