import { Module } from "@nestjs/common";

import { DatabaseModule } from "@infrastructure/database/database.module";
import { UserController, UsersController } from "./user.controller";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";

@Module({
  imports: [DatabaseModule],
  controllers: [UserController, UsersController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
