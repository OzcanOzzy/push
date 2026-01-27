import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(citySlug?: string) {
    return this.prisma.branch.findMany({
      where: citySlug ? { city: { slug: citySlug } } : undefined,
      include: { city: true },
      orderBy: { name: 'asc' },
    });
  }

  create(data: { name: string; slug: string; cityId: string; address?: string }) {
    return this.prisma.branch.create({ data });
  }

  update(
    id: string,
    data: { name?: string; slug?: string; cityId?: string; address?: string },
  ) {
    return this.prisma.branch.update({ where: { id }, data });
  }

  async remove(id: string) {
    const listingCount = await this.prisma.listing.count({ where: { branchId: id } });
    if (listingCount) {
      throw new BadRequestException('Branch has listings. Remove listings first.');
    }
    return this.prisma.branch.delete({ where: { id } });
  }
}
