import { Controller, Get, Query } from '@nestjs/common';
import { NeighborhoodsService } from './neighborhoods.service';

@Controller('neighborhoods')
export class NeighborhoodsController {
  constructor(private readonly neighborhoodsService: NeighborhoodsService) {}

  @Get()
  findAll(@Query('districtId') districtId?: string) {
    return this.neighborhoodsService.findAll(districtId);
  }
}
