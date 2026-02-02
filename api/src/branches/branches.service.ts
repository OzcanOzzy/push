import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

// Varsayılan komşu mahalle mesafesi (km)
const DEFAULT_NEIGHBOR_DISTANCE = 3;

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  // Tüm şubeleri getir
  async findAll(citySlug?: string, districtSlug?: string) {
    return this.prisma.branch.findMany({
      where: {
        ...(citySlug ? { city: { slug: citySlug } } : {}),
        ...(districtSlug ? { district: { slug: districtSlug } } : {}),
      },
      include: { 
        city: true,
        district: true,
        neighborhoods: {
          include: {
            neighborhood: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  // Slug ile şube getir
  async findBySlug(slug: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { slug },
      include: {
        city: true,
        district: true,
        neighborhoods: {
          include: {
            neighborhood: {
              include: {
                district: true,
              },
            },
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  // ID ile şube getir
  async findById(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        city: true,
        district: true,
        neighborhoods: {
          include: {
            neighborhood: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  // Şube oluştur
  async create(dto: CreateBranchDto) {
    const { neighborhoodIds, ...branchData } = dto;

    // Slug kontrolü
    const existing = await this.prisma.branch.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException('Bu slug zaten kullanılıyor');
    }

    // Şubeyi oluştur
    const branch = await this.prisma.branch.create({
      data: branchData,
      include: {
        city: true,
        district: true,
      },
    });

    // Mahalle ilişkilerini ekle
    if (neighborhoodIds && neighborhoodIds.length > 0) {
      await this.setNeighborhoods(branch.id, neighborhoodIds);
    }

    return this.findById(branch.id);
  }

  // Şube güncelle
  async update(id: string, dto: UpdateBranchDto) {
    const { neighborhoodIds, ...branchData } = dto;

    // Şube var mı kontrol et
    await this.findById(id);

    // Slug kontrolü (değiştiyse)
    if (dto.slug) {
      const existing = await this.prisma.branch.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (existing) {
        throw new BadRequestException('Bu slug zaten kullanılıyor');
      }
    }

    // Şubeyi güncelle
    await this.prisma.branch.update({
      where: { id },
      data: branchData,
    });

    // Mahalle ilişkilerini güncelle
    if (neighborhoodIds !== undefined) {
      await this.setNeighborhoods(id, neighborhoodIds);
    }

    return this.findById(id);
  }

  // Şube sil
  async remove(id: string) {
    const listingCount = await this.prisma.listing.count({ where: { branchId: id } });
    if (listingCount) {
      throw new BadRequestException('Şubeye ait ilanlar var. Önce ilanları silin.');
    }

    // Mahalle ilişkilerini sil
    await this.prisma.branchNeighborhood.deleteMany({
      where: { branchId: id },
    });

    return this.prisma.branch.delete({ where: { id } });
  }

  // Şubenin mahallelerini ayarla
  async setNeighborhoods(branchId: string, neighborhoodIds: string[]) {
    // Mevcut ilişkileri sil
    await this.prisma.branchNeighborhood.deleteMany({
      where: { branchId },
    });

    // Yeni ilişkileri ekle
    if (neighborhoodIds.length > 0) {
      await this.prisma.branchNeighborhood.createMany({
        data: neighborhoodIds.map((neighborhoodId) => ({
          branchId,
          neighborhoodId,
        })),
        skipDuplicates: true,
      });
    }

    return this.getNeighborhoods(branchId);
  }

  // Şubenin mahallelerini getir
  async getNeighborhoods(branchId: string) {
    const neighborhoods = await this.prisma.branchNeighborhood.findMany({
      where: { branchId },
      include: {
        neighborhood: {
          include: {
            district: true,
          },
        },
      },
    });

    return neighborhoods.map((bn) => bn.neighborhood);
  }

  // Şubenin ilçelerini getir (mahallelerden türetilmiş)
  async getDistricts(branchId: string) {
    const branch = await this.findById(branchId);
    
    // Eğer şube ilçe bazlıysa sadece o ilçeyi döndür
    if (branch.districtId) {
      return [branch.district];
    }

    // Mahallelerden ilçeleri türet
    const neighborhoods = await this.getNeighborhoods(branchId);
    const districtMap = new Map();
    
    for (const n of neighborhoods) {
      if (n.district && !districtMap.has(n.district.id)) {
        districtMap.set(n.district.id, n.district);
      }
    }

    return Array.from(districtMap.values());
  }

  // Belirli bir mahallenin komşularını getir
  async getNeighborhoodNeighbors(neighborhoodId: string, maxDistance?: number) {
    const distance = maxDistance || DEFAULT_NEIGHBOR_DISTANCE;
    
    const neighbors = await this.prisma.neighborhoodNeighbor.findMany({
      where: {
        neighborhoodId,
        distance: { lte: distance },
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

  // Tüm mahallelerin komşularını hesapla (koordinat bazlı)
  async calculateAllNeighbors(cityId?: string, maxDistance: number = DEFAULT_NEIGHBOR_DISTANCE) {
    // Koordinatı olan mahalleleri getir
    const whereClause = cityId ? { cityId, latitude: { not: null }, longitude: { not: null } } : { latitude: { not: null }, longitude: { not: null } };
    
    const neighborhoods = await this.prisma.neighborhood.findMany({
      where: whereClause as any,
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
      },
    });

    if (neighborhoods.length === 0) {
      return { message: 'Koordinatı olan mahalle bulunamadı', processed: 0 };
    }

    // Mevcut komşulukları temizle
    if (cityId) {
      const neighborhoodIds = neighborhoods.map((n) => n.id);
      await this.prisma.neighborhoodNeighbor.deleteMany({
        where: {
          OR: [
            { neighborhoodId: { in: neighborhoodIds } },
            { neighborId: { in: neighborhoodIds } },
          ],
        },
      });
    } else {
      await this.prisma.neighborhoodNeighbor.deleteMany({});
    }

    // Komşulukları hesapla
    const neighborPairs: { neighborhoodId: string; neighborId: string; distance: number }[] = [];

    for (let i = 0; i < neighborhoods.length; i++) {
      for (let j = i + 1; j < neighborhoods.length; j++) {
        const n1 = neighborhoods[i];
        const n2 = neighborhoods[j];

        if (!n1.latitude || !n1.longitude || !n2.latitude || !n2.longitude) continue;

        const distance = this.calculateDistance(
          Number(n1.latitude),
          Number(n1.longitude),
          Number(n2.latitude),
          Number(n2.longitude),
        );

        if (distance <= maxDistance) {
          neighborPairs.push({
            neighborhoodId: n1.id,
            neighborId: n2.id,
            distance: Math.round(distance * 100) / 100,
          });
          // Karşılıklı ilişki
          neighborPairs.push({
            neighborhoodId: n2.id,
            neighborId: n1.id,
            distance: Math.round(distance * 100) / 100,
          });
        }
      }
    }

    // Toplu kaydet
    if (neighborPairs.length > 0) {
      await this.prisma.neighborhoodNeighbor.createMany({
        data: neighborPairs,
        skipDuplicates: true,
      });
    }

    return {
      message: 'Komşu mahalleler hesaplandı',
      processed: neighborhoods.length,
      neighborPairsCreated: neighborPairs.length / 2,
      maxDistance,
    };
  }

  // Haversine formülü ile mesafe hesapla (km)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
