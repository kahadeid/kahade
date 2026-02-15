import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";

import { StorageService } from "./storage.service";

@Module({
  imports: [ConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
