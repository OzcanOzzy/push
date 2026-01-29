import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ListingLabelsService } from './listing-labels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('listing-labels')
export class ListingLabelsController {
  constructor(private readonly service: ListingLabelsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  create(
    @Body()
    body: {
      name: string;
      slug: string;
      textColor?: string;
      bgColor?: string;
      borderRadius?: number;
      isRounded?: boolean;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      slug?: string;
      textColor?: string;
      bgColor?: string;
      borderRadius?: number;
      isRounded?: boolean;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  reorder(@Body() body: { ids: string[] }) {
    return this.service.reorder(body.ids);
  }
}
