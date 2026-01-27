import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ConsultantsService } from './consultants.service';
import { CreateConsultantDto } from './dto/create-consultant.dto';
import { UpdateConsultantDto } from './dto/update-consultant.dto';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('consultants')
export class ConsultantsController {
  constructor(private readonly consultantsService: ConsultantsService) {}

  @Get()
  findAll() {
    return this.consultantsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() body: CreateConsultantDto) {
    return this.consultantsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateConsultantDto) {
    return this.consultantsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consultantsService.remove(id);
  }
}
