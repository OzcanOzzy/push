import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('pages')
export class PagesController {
  constructor(private readonly service: PagesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const page = await this.service.findBySlug(slug);
    if (!page) {
      return null;
    }
    return page;
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
      slug: string;
      title: string;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      ogImage?: string;
      content?: object;
      isPublished?: boolean;
      showInMenu?: boolean;
      menuOrder?: number;
      template?: string;
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
      slug?: string;
      title?: string;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      ogImage?: string;
      content?: object;
      isPublished?: boolean;
      showInMenu?: boolean;
      menuOrder?: number;
      template?: string;
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
}
