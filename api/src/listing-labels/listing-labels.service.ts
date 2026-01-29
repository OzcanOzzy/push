import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListingLabelsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.listingLabel.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.listingLabel.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.listingLabel.findUnique({ where: { id } });
  }

  create(data: {
    name: string;
    slug: string;
    textColor?: string;
    bgColor?: string;
    borderRadius?: number;
    isRounded?: boolean;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    return this.prisma.listingLabel.create({ data });
  }

  update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      textColor?: string;
      bgColor?: string;
      borderRadius?: number;
      isRounded?: boolean;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.listingLabel.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.listingLabel.delete({ where: { id } });
  }

  async reorder(ids: string[]) {
    const updates = ids.map((id, index) =>
      this.prisma.listingLabel.update({
        where: { id },
        data: { sortOrder: index },
      }),
    );
    return this.prisma.$transaction(updates);
  }
}
