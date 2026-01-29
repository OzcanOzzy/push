import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CityButtonsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.cityButton.findMany({
      where: { isActive: true },
      include: { city: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.cityButton.findMany({
      include: { city: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const button = await this.prisma.cityButton.findUnique({
      where: { id },
      include: { city: true },
    });
    if (!button) {
      throw new NotFoundException('City button not found');
    }
    return button;
  }

  async create(data: {
    name: string;
    slug: string;
    imageUrl?: string;
    icon?: string;
    iconColor?: string;
    bgColor?: string;
    borderColor?: string;
    width?: number;
    height?: number;
    sortOrder?: number;
    isActive?: boolean;
    cityId?: string;
    // Branch contact info
    address?: string;
    phone?: string;
    whatsappNumber?: string;
    email?: string;
    consultantName?: string;
    latitude?: number;
    longitude?: number;
  }) {
    return this.prisma.cityButton.create({
      data,
      include: { city: true },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      imageUrl?: string;
      icon?: string;
      iconColor?: string;
      bgColor?: string;
      borderColor?: string;
      width?: number;
      height?: number;
      sortOrder?: number;
      isActive?: boolean;
      cityId?: string;
      // Branch contact info
      address?: string;
      phone?: string;
      whatsappNumber?: string;
      email?: string;
      consultantName?: string;
      latitude?: number;
      longitude?: number;
    },
  ) {
    return this.prisma.cityButton.update({
      where: { id },
      data,
      include: { city: true },
    });
  }

  async remove(id: string) {
    return this.prisma.cityButton.delete({
      where: { id },
    });
  }

  async reorder(ids: string[]) {
    const updates = ids.map((id, index) =>
      this.prisma.cityButton.update({
        where: { id },
        data: { sortOrder: index },
      }),
    );
    await this.prisma.$transaction(updates);
    return this.findAllAdmin();
  }
}
