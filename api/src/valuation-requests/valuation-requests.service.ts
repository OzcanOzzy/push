import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateValuationRequestDto, UpdateValuationRequestStatusDto } from './dto/create-valuation-request.dto';
import { RequestStatus } from '@prisma/client';

@Injectable()
export class ValuationRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateValuationRequestDto) {
    return this.prisma.valuationRequest.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        cityId: dto.cityId,
        districtId: dto.districtId,
        neighborhoodId: dto.neighborhoodId,
        listingStatus: dto.listingStatus,
        category: dto.category,
        subPropertyType: dto.subPropertyType,
        attributes: dto.attributes ? JSON.parse(JSON.stringify(dto.attributes)) : undefined,
        images: dto.images,
        videoUrl: dto.videoUrl,
        notes: dto.notes,
        address: dto.address,
      },
      include: {
        city: true,
        district: true,
        neighborhood: true,
      },
    });
  }

  async findAll(status?: RequestStatus) {
    const where = status ? { requestStatus: status } : {};
    
    return this.prisma.valuationRequest.findMany({
      where,
      include: {
        city: true,
        district: true,
        neighborhood: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.valuationRequest.findUnique({
      where: { id },
      include: {
        city: true,
        district: true,
        neighborhood: true,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateValuationRequestStatusDto) {
    return this.prisma.valuationRequest.update({
      where: { id },
      data: {
        requestStatus: dto.status as RequestStatus,
        adminNotes: dto.adminNotes,
        estimatedValue: dto.estimatedValue,
      },
      include: {
        city: true,
        district: true,
        neighborhood: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.valuationRequest.delete({
      where: { id },
    });
  }

  // Excel export için tüm verileri getir
  async findAllForExport(ids?: string[]) {
    const where = ids && ids.length > 0 ? { id: { in: ids } } : {};
    
    return this.prisma.valuationRequest.findMany({
      where,
      include: {
        city: true,
        district: true,
        neighborhood: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // İstatistikler
  async getStats() {
    const [total, newCount, inProgress, closed] = await Promise.all([
      this.prisma.valuationRequest.count(),
      this.prisma.valuationRequest.count({ where: { requestStatus: 'NEW' } }),
      this.prisma.valuationRequest.count({ where: { requestStatus: 'IN_PROGRESS' } }),
      this.prisma.valuationRequest.count({ where: { requestStatus: 'CLOSED' } }),
    ]);

    return { total, new: newCount, inProgress, closed };
  }
}
