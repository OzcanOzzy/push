import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialLinksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.socialLink.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(data: {
    label: string;
    url: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    return this.prisma.socialLink.create({ data });
  }

  async update(
    id: string,
    data: {
      label?: string;
      url?: string;
      icon?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.socialLink.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.socialLink.delete({ where: { id } });
  }

  async reorder(ids: string[]) {
    const updates = ids.map((id, index) =>
      this.prisma.socialLink.update({
        where: { id },
        data: { sortOrder: index },
      }),
    );
    return Promise.all(updates);
  }
}
