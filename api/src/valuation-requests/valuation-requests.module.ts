import { Module } from '@nestjs/common';
import { ValuationRequestsController } from './valuation-requests.controller';
import { ValuationRequestsService } from './valuation-requests.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ValuationRequestsController],
  providers: [ValuationRequestsService],
  exports: [ValuationRequestsService],
})
export class ValuationRequestsModule {}
