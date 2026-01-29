import { Module } from '@nestjs/common';
import { FooterItemsController } from './footer-items.controller';
import { FooterItemsService } from './footer-items.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FooterItemsController],
  providers: [FooterItemsService],
  exports: [FooterItemsService],
})
export class FooterItemsModule {}
