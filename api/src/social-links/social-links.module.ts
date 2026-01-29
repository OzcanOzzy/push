import { Module } from '@nestjs/common';
import { SocialLinksController } from './social-links.controller';
import { SocialLinksService } from './social-links.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SocialLinksController],
  providers: [SocialLinksService],
  exports: [SocialLinksService],
})
export class SocialLinksModule {}
