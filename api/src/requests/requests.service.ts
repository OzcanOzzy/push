import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsultantRequestDto } from './dto/create-consultant-request.dto';
import { CreateCustomerRequestDto } from './dto/create-customer-request.dto';
import { Prisma, RequestStatus } from '@prisma/client';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  createCustomerRequest(data: CreateCustomerRequestDto) {
    const createData: Prisma.CustomerRequestUncheckedCreateInput = {
      ...data,
      criteria: data.criteria ? (data.criteria as Prisma.InputJsonValue) : undefined,
    };

    return this.prisma.customerRequest.create({
      data: createData,
    });
  }

  createConsultantRequest(userId: string, data: CreateConsultantRequestDto) {
    const createData: Prisma.ConsultantRequestUncheckedCreateInput = {
      ...data,
      criteria: data.criteria ? (data.criteria as Prisma.InputJsonValue) : undefined,
      createdByUserId: userId,
    };

    return this.prisma.consultantRequest.create({
      data: createData,
    });
  }

  getCustomerRequests(status?: string) {
    const statusFilter = this.toRequestStatus(status);
    return this.prisma.customerRequest.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  getConsultantRequests(status?: string) {
    const statusFilter = this.toRequestStatus(status);
    return this.prisma.consultantRequest.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        consultant: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  updateCustomerStatus(id: string, status: RequestStatus) {
    return this.prisma.customerRequest.update({
      where: { id },
      data: { status },
    });
  }

  updateConsultantStatus(id: string, status: RequestStatus) {
    return this.prisma.consultantRequest.update({
      where: { id },
      data: { status },
    });
  }

  private toRequestStatus(status?: string) {
    if (!status) {
      return undefined;
    }

    return Object.values(RequestStatus).includes(status as RequestStatus)
      ? (status as RequestStatus)
      : undefined;
  }
}
