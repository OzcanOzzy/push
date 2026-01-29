import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  findAll(options?: { limit?: number; showOnHome?: boolean }) {
    return this.prisma.blogPost.findMany({
      where: {
        isPublished: true,
        ...(options?.showOnHome !== undefined && { showOnHome: options.showOnHome }),
      },
      orderBy: { publishedAt: 'desc' },
      take: options?.limit,
    });
  }

  findAllAdmin() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.blogPost.findUnique({ where: { slug } });
  }

  findOne(id: string) {
    return this.prisma.blogPost.findUnique({ where: { id } });
  }

  create(data: {
    slug: string;
    title: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    isPublished?: boolean;
    publishedAt?: Date;
    showOnHome?: boolean;
  }) {
    return this.prisma.blogPost.create({ data });
  }

  update(
    id: string,
    data: {
      slug?: string;
      title?: string;
      excerpt?: string;
      content?: string;
      coverImage?: string;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      isPublished?: boolean;
      publishedAt?: Date;
      showOnHome?: boolean;
    },
  ) {
    return this.prisma.blogPost.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }
}
