import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NeighborhoodsService {
  constructor(private readonly prisma: PrismaService) {}

  // Mahalleleri getir (filtreleme destekli)
  findAll(params?: { districtId?: string; cityId?: string; branchId?: string }) {
    const where: any = {};

    if (params?.districtId) {
      where.districtId = params.districtId;
    }

    if (params?.cityId) {
      where.cityId = params.cityId;
    }

    // Şube bazlı filtreleme
    if (params?.branchId) {
      where.branchNeighborhoods = {
        some: { branchId: params.branchId },
      };
    }

    return this.prisma.neighborhood.findMany({
      where,
      include: {
        district: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  // Tek mahalle getir
  findOne(id: string) {
    return this.prisma.neighborhood.findUnique({
      where: { id },
      include: {
        city: true,
        district: true,
      },
    });
  }

  // Mahallenin komşularını getir
  async getNeighbors(id: string, maxDistance?: number) {
    const neighbors = await this.prisma.neighborhoodNeighbor.findMany({
      where: {
        neighborhoodId: id,
        ...(maxDistance ? { distance: { lte: maxDistance } } : {}),
      },
      include: {
        neighbor: {
          include: {
            district: true,
          },
        },
      },
      orderBy: { distance: 'asc' },
    });

    return neighbors.map((n) => ({
      ...n.neighbor,
      distance: n.distance,
    }));
  }

  // Mahalle koordinatlarını güncelle
  async updateCoordinates(id: string, latitude: number, longitude: number) {
    return this.prisma.neighborhood.update({
      where: { id },
      data: { latitude, longitude },
    });
  }

  // Toplu koordinat güncelleme
  async bulkUpdateCoordinates(
    updates: { id: string; latitude: number; longitude: number }[],
  ) {
    const results = await Promise.all(
      updates.map((u) =>
        this.prisma.neighborhood.update({
          where: { id: u.id },
          data: { latitude: u.latitude, longitude: u.longitude },
        }),
      ),
    );
    return { updated: results.length };
  }
}
