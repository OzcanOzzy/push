import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  findAll() {
    return this.citiesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() body: CreateCityDto) {
    return this.citiesService.create(body);
  }

  @Post('import/tr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  importTurkeyLocations() {
    return this.citiesService.importTurkeyLocations();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateCityDto) {
    return this.citiesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citiesService.remove(id);
  }
}
