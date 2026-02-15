import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';



@Injectable()
export class PrismaQueryMonitor implements OnModuleInit {
  private readonly logger = new Logger(PrismaQueryMonitor.name);
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Prisma 6+ uses $on instead of deprecated $use middleware
    // Monitor query events
    this.prisma.$on('query' as never, (e: any) => {
      const duration = e.duration;
      if (duration > this.SLOW_QUERY_THRESHOLD) {
        this.logger.warn(
          `Slow query detected: ${e.query} (${duration}ms)`,
        );
        this.logger.debug(`Params: ${e.params}`);
      }
    });

    this.logger.log('Prisma query monitoring enabled (using $on events)');
  }
}
