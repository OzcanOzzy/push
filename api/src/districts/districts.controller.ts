import { Controller, Get, Query } from '@nestjs/common';
import { DistrictsService } from './districts.service';

@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Get()
  findAll(@Query('cityId') cityId?: string) {
    return this.districtsService.findAll(cityId);
  }
}
