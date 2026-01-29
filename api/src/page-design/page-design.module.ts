import { Module } from '@nestjs/common';
import { PageDesignController } from './page-design.controller';
import { PageDesignService } from './page-design.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PageDesignController],
  providers: [PageDesignService],
  exports: [PageDesignService],
})
export class PageDesignModule {}
