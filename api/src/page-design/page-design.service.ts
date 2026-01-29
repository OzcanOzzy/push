import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PageDesignService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pageDesign.findMany({
      orderBy: { pageType: 'asc' },
    });
  }

  async findByPageType(pageType: string) {
    return this.prisma.pageDesign.findUnique({
      where: { pageType },
    });
  }

  async upsert(pageType: string, data: {
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
  }) {
    return this.prisma.pageDesign.upsert({
      where: { pageType },
      update: data,
      create: {
        pageType,
        pageName: data.pageName || pageType,
        ...data,
      },
    });
  }

  async delete(pageType: string) {
    return this.prisma.pageDesign.delete({
      where: { pageType },
    });
  }
}
