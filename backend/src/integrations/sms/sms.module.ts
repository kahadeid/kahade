import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";

import { SmsService } from "./sms.service";

@Module({
  imports: [ConfigModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
