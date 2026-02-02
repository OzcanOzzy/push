import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { NeighborhoodsService } from './neighborhoods.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('neighborhoods')
export class NeighborhoodsController {
  constructor(private readonly neighborhoodsService: NeighborhoodsService) {}

  @Get()
  findAll(
    @Query('districtId') districtId?: string,
    @Query('cityId') cityId?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.neighborhoodsService.findAll({ districtId, cityId, branchId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.neighborhoodsService.findOne(id);
  }

  @Get(':id/neighbors')
  getNeighbors(
    @Param('id') id: string,
    @Query('maxDistance') maxDistance?: string,
  ) {
    return this.neighborhoodsService.getNeighbors(
      id,
      maxDistance ? parseFloat(maxDistance) : undefined,
    );
  }

  @Patch(':id/coordinates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateCoordinates(
    @Param('id') id: string,
    @Body() body: { latitude: number; longitude: number },
  ) {
    return this.neighborhoodsService.updateCoordinates(id, body.latitude, body.longitude);
  }

  @Post('bulk-coordinates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  bulkUpdateCoordinates(
    @Body() body: { updates: { id: string; latitude: number; longitude: number }[] },
  ) {
    return this.neighborhoodsService.bulkUpdateCoordinates(body.updates);
  }
}
