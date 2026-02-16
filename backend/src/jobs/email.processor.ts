import { Logger } from "@nestjs/common";

export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
}
