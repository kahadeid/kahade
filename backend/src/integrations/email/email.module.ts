import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";

import { EmailService } from "./email.service";

@Module({
  imports: [ConfigModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
