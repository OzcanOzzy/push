import { Module } from '@nestjs/common';
import { PropertyRequestsController } from './property-requests.controller';
import { PropertyRequestsService } from './property-requests.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PropertyRequestsController],
  providers: [PropertyRequestsService],
  exports: [PropertyRequestsService],
})
export class PropertyRequestsModule {}
