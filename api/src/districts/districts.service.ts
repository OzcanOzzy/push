import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DistrictsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(cityId?: string) {
    return this.prisma.district.findMany({
      where: cityId ? { cityId } : undefined,
      orderBy: { name: 'asc' },
    });
  }
}
