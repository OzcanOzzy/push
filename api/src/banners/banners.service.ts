import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(position?: string) {
    const now = new Date();
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        ...(position && { position }),
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.banner.findMany({
      orderBy: [{ position: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async findOne(id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return banner;
  }

  async create(data: {
    title?: string;
    imageUrl: string;
    linkUrl?: string;
    position?: string;
    sortOrder?: number;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
    width?: number;
    height?: number;
  }) {
    return this.prisma.banner.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      imageUrl?: string;
      linkUrl?: string;
      position?: string;
      sortOrder?: number;
      isActive?: boolean;
      startDate?: Date;
      endDate?: Date;
      width?: number;
      height?: number;
    },
  ) {
    return this.prisma.banner.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.banner.delete({
      where: { id },
    });
  }
}
