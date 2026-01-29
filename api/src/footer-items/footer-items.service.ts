import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FooterItemsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.footerItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.footerItem.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.footerItem.findUnique({ where: { id } });
  }

  create(data: {
    type: string;
    label?: string;
    value: string;
    linkUrl?: string;
    icon?: string;
    iconColor?: string;
    textColor?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    return this.prisma.footerItem.create({ data });
  }

  update(
    id: string,
    data: {
      type?: string;
      label?: string;
      value?: string;
      linkUrl?: string;
      icon?: string;
      iconColor?: string;
      textColor?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.footerItem.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.footerItem.delete({ where: { id } });
  }

  async reorder(ids: string[]) {
    const updates = ids.map((id, index) =>
      this.prisma.footerItem.update({
        where: { id },
        data: { sortOrder: index },
      }),
    );
    return this.prisma.$transaction(updates);
  }
}
