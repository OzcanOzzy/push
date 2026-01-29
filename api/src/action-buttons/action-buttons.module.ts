import { Module } from '@nestjs/common';
import { ActionButtonsController } from './action-buttons.controller';
import { ActionButtonsService } from './action-buttons.service';

@Module({
  controllers: [ActionButtonsController],
  providers: [ActionButtonsService],
})
export class ActionButtonsModule {}
