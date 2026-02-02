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

  // Tüm şubeleri getir
  @Get()
  findAll(
    @Query('citySlug') citySlug?: string,
    @Query('districtSlug') districtSlug?: string,
  ) {
    return this.branchesService.findAll(citySlug, districtSlug);
  }

  // Slug ile şube getir
  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.branchesService.findBySlug(slug);
  }

  // ID ile şube getir
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.branchesService.findById(id);
  }

  // Şubenin mahallelerini getir
  @Get(':id/neighborhoods')
  getNeighborhoods(@Param('id') id: string) {
    return this.branchesService.getNeighborhoods(id);
  }

  // Şubenin ilçelerini getir
  @Get(':id/districts')
  getDistricts(@Param('id') id: string) {
    return this.branchesService.getDistricts(id);
  }

  // Bir mahallenin komşularını getir
  @Get('neighborhoods/:neighborhoodId/neighbors')
  getNeighborhoodNeighbors(
    @Param('neighborhoodId') neighborhoodId: string,
    @Query('maxDistance') maxDistance?: string,
  ) {
    return this.branchesService.getNeighborhoodNeighbors(
      neighborhoodId,
      maxDistance ? parseFloat(maxDistance) : undefined,
    );
  }

  // Şube oluştur
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  // Şube güncelle
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.branchesService.update(id, dto);
  }

  // Şubenin mahallelerini ayarla
  @Post(':id/neighborhoods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  setNeighborhoods(
    @Param('id') id: string,
    @Body() body: { neighborhoodIds: string[] },
  ) {
    return this.branchesService.setNeighborhoods(id, body.neighborhoodIds);
  }

  // Komşu mahalleleri hesapla
  @Post('calculate-neighbors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  calculateAllNeighbors(
    @Body() body: { cityId?: string; maxDistance?: number },
  ) {
    return this.branchesService.calculateAllNeighbors(body.cityId, body.maxDistance);
  }

  // Şube sil
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
