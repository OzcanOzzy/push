import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyRequestDto, UpdatePropertyRequestStatusDto } from './dto/create-property-request.dto';
import { RequestStatus } from '@prisma/client';

@Injectable()
export class PropertyRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePropertyRequestDto) {
    return this.prisma.propertyRequest.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        cityId: dto.cityId,
        districtId: dto.districtId,
        neighborhoodId: dto.neighborhoodId,
        requestType: dto.requestType,
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

  async findAll(status?: RequestStatus, requestType?: string) {
    const where: any = {};
    if (status) where.requestStatus = status;
    if (requestType) where.requestType = requestType;
    
    return this.prisma.propertyRequest.findMany({
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
    return this.prisma.propertyRequest.findUnique({
      where: { id },
      include: {
        city: true,
        district: true,
        neighborhood: true,
      },
    });
  }

  async updateStatus(id: string, dto: UpdatePropertyRequestStatusDto) {
    return this.prisma.propertyRequest.update({
      where: { id },
      data: {
        requestStatus: dto.status as RequestStatus,
        adminNotes: dto.adminNotes,
      },
      include: {
        city: true,
        district: true,
        neighborhood: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.propertyRequest.delete({
      where: { id },
    });
  }

  // Excel export için tüm verileri getir
  async findAllForExport(ids?: string[]) {
    const where = ids && ids.length > 0 ? { id: { in: ids } } : {};
    
    return this.prisma.propertyRequest.findMany({
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
    const [total, newCount, inProgress, closed, sellCount, rentOutCount] = await Promise.all([
      this.prisma.propertyRequest.count(),
      this.prisma.propertyRequest.count({ where: { requestStatus: 'NEW' } }),
      this.prisma.propertyRequest.count({ where: { requestStatus: 'IN_PROGRESS' } }),
      this.prisma.propertyRequest.count({ where: { requestStatus: 'CLOSED' } }),
      this.prisma.propertyRequest.count({ where: { requestType: 'SELL' } }),
      this.prisma.propertyRequest.count({ where: { requestType: 'RENT_OUT' } }),
    ]);

    return { total, new: newCount, inProgress, closed, sell: sellCount, rentOut: rentOutCount };
  }
}
