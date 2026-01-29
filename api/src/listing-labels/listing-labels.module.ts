import { Module } from '@nestjs/common';
import { ListingLabelsController } from './listing-labels.controller';
import { ListingLabelsService } from './listing-labels.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ListingLabelsController],
  providers: [ListingLabelsService],
  exports: [ListingLabelsService],
})
export class ListingLabelsModule {}
