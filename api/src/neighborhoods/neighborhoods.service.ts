import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NeighborhoodsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(districtId?: string) {
    return this.prisma.neighborhood.findMany({
      where: districtId ? { districtId } : undefined,
      orderBy: { name: 'asc' },
    });
  }
}
