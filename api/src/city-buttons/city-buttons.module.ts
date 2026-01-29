import { Module } from '@nestjs/common';
import { CityButtonsController } from './city-buttons.controller';
import { CityButtonsService } from './city-buttons.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CityButtonsController],
  providers: [CityButtonsService],
})
export class CityButtonsModule {}
