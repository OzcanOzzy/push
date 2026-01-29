import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActionButtonsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.actionButton.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.actionButton.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.actionButton.findUnique({ where: { id } });
  }

  create(data: {
    name: string;
    linkUrl: string;
    imageUrl?: string;
    bgColor?: string;
    textColor?: string;
    icon?: string;
    width?: number;
    height?: number;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    return this.prisma.actionButton.create({ data });
  }

  update(
    id: string,
    data: {
      name?: string;
      linkUrl?: string;
      imageUrl?: string;
      bgColor?: string;
      textColor?: string;
      icon?: string;
      width?: number;
      height?: number;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.actionButton.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.actionButton.delete({ where: { id } });
  }
}
