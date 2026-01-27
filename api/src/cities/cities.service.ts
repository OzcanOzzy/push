import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { importTurkeyLocations } from '../locations/import-tr-locations';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.city.findMany({
      orderBy: { name: 'asc' },
    });
  }

  create(data: { name: string; slug: string }) {
    return this.prisma.city.create({ data });
  }

  update(id: string, data: { name?: string; slug?: string }) {
    return this.prisma.city.update({ where: { id }, data });
  }

  async remove(id: string) {
    const [listingCount, branchCount, districtCount, neighborhoodCount] =
      await Promise.all([
        this.prisma.listing.count({ where: { cityId: id } }),
        this.prisma.branch.count({ where: { cityId: id } }),
        this.prisma.district.count({ where: { cityId: id } }),
        this.prisma.neighborhood.count({ where: { cityId: id } }),
      ]);

    if (listingCount || branchCount || districtCount || neighborhoodCount) {
      throw new BadRequestException(
        'City has related data. Remove listings/branches first.',
      );
    }

    return this.prisma.city.delete({ where: { id } });
  }

  async importTurkeyLocations() {
    return importTurkeyLocations(this.prisma);
  }
}
