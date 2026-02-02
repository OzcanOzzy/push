import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ListingCategory, ListingStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CreateListingAttributeDto } from './dto/create-listing-attribute.dto';
import { UpdateListingAttributeDto } from './dto/update-listing-attribute.dto';
import { ListingAttributesService } from './listing-attributes.service';

@Controller('listing-attributes')
export class ListingAttributesController {
  constructor(private readonly listingAttributesService: ListingAttributesService) {}

  @Get()
  findAll(
    @Query('status') status?: ListingStatus,
    @Query('category') category?: ListingCategory,
    @Query('subPropertyType') subPropertyType?: string,
  ) {
    return this.listingAttributesService.findAll({ status, category, subPropertyType });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() body: CreateListingAttributeDto) {
    return this.listingAttributesService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() body: UpdateListingAttributeDto) {
    return this.listingAttributesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.listingAttributesService.remove(id);
  }
}
