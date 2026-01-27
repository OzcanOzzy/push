import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  findAll(@Query('citySlug') citySlug?: string) {
    return this.branchesService.findAll(citySlug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() body: CreateBranchDto) {
    return this.branchesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateBranchDto) {
    return this.branchesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
