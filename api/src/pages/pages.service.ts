import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.pageSetting.findMany({
      where: { isPublished: true },
      orderBy: { menuOrder: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.pageSetting.findMany({
      orderBy: { menuOrder: 'asc' },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.pageSetting.findUnique({ where: { slug } });
  }

  findOne(id: string) {
    return this.prisma.pageSetting.findUnique({ where: { id } });
  }

  create(data: {
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
  }) {
    return this.prisma.pageSetting.create({ data });
  }

  update(
    id: string,
    data: {
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
    return this.prisma.pageSetting.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.pageSetting.delete({ where: { id } });
  }
}
