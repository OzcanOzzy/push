import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuItemsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.menuItem.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(data: {
    label: string;
    href: string;
    sortOrder?: number;
    isActive?: boolean;
    textColor?: string;
    bgColor?: string;
    icon?: string;
  }) {
    return this.prisma.menuItem.create({ data });
  }

  async update(
    id: string,
    data: {
      label?: string;
      href?: string;
      sortOrder?: number;
      isActive?: boolean;
      textColor?: string;
      bgColor?: string;
      icon?: string;
    },
  ) {
    return this.prisma.menuItem.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.menuItem.delete({ where: { id } });
  }

  async reorder(items: { id: string; sortOrder: number }[]) {
    const updates = items.map((item) =>
      this.prisma.menuItem.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    );
    return this.prisma.$transaction(updates);
  }
}
