import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { CreateConsultantDto } from './dto/create-consultant.dto';
import { UpdateConsultantDto } from './dto/update-consultant.dto';

@Injectable()
export class ConsultantsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.consultant.findMany({
      include: {
        user: true,
        branch: {
          include: {
            city: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateConsultantDto) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: Role.CONSULTANT,
      },
    });

    return this.prisma.consultant.create({
      data: {
        userId: user.id,
        branchId: data.branchId,
        title: data.title,
        whatsappNumber: data.whatsappNumber,
        contactPhone: data.contactPhone,
        bio: data.bio,
      },
      include: { user: true, branch: true },
    });
  }

  async update(id: string, data: UpdateConsultantDto) {
    const consultant = await this.prisma.consultant.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!consultant) {
      throw new BadRequestException('Consultant not found');
    }

    if (data.email && data.email !== consultant.user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        throw new BadRequestException('Email already exists');
      }
    }

    const passwordHash = data.password
      ? await bcrypt.hash(data.password, 10)
      : undefined;

    await this.prisma.user.update({
      where: { id: consultant.userId },
      data: {
        name: data.name ?? undefined,
        email: data.email ?? undefined,
        passwordHash,
      },
    });

    return this.prisma.consultant.update({
      where: { id },
      data: {
        branchId: data.branchId && data.branchId.trim() !== '' ? data.branchId : undefined,
        title: data.title ?? undefined,
        whatsappNumber: data.whatsappNumber ?? undefined,
        contactPhone: data.contactPhone ?? undefined,
        bio: data.bio ?? undefined,
        photoUrl: data.photoUrl ?? undefined,
      },
      include: { user: true, branch: true },
    });
  }

  async remove(id: string) {
    const consultant = await this.prisma.consultant.findUnique({
      where: { id },
    });

    if (!consultant) {
      throw new BadRequestException('Consultant not found');
    }

    await this.prisma.listing.updateMany({
      where: { consultantId: id },
      data: { consultantId: null },
    });

    await this.prisma.consultantRequest.deleteMany({
      where: { consultantId: id },
    });

    await this.prisma.consultant.delete({ where: { id } });
    return this.prisma.user.delete({ where: { id: consultant.userId } });
  }
}
