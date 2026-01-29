import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PageDesignService } from './page-design.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('page-design')
export class PageDesignController {
  constructor(private readonly service: PageDesignService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll() {
    return this.service.findAll();
  }

  @Get(':pageType')
  findOne(@Param('pageType') pageType: string) {
    return this.service.findByPageType(pageType);
  }

  @Post(':pageType')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  upsert(
    @Param('pageType') pageType: string,
    @Body() body: {
      pageName?: string;
      headerBgColor?: string;
      headerBgGradient?: string;
      headerBgImage?: string;
      headerNavColor?: string;
      headerNavFont?: string;
      headerNavFontSize?: number;
      showHeader?: boolean;
      footerBgColor?: string;
      footerBgGradient?: string;
      footerBgImage?: string;
      footerTextColor?: string;
      footerFont?: string;
      footerFontSize?: number;
      showFooter?: boolean;
      contentBgColor?: string;
      contentBgImage?: string;
      contentPadding?: number;
      contentMaxWidth?: number;
      showBanner?: boolean;
      bannerHeight?: number;
      bannerBgColor?: string;
      bannerBgImage?: string;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      seoUrl?: string;
    },
  ) {
    return this.service.upsert(pageType, body);
  }

  @Delete(':pageType')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  delete(@Param('pageType') pageType: string) {
    return this.service.delete(pageType);
  }
}
