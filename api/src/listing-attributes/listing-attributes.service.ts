import { Injectable } from '@nestjs/common';
import { ListingCategory, ListingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingAttributeDto } from './dto/create-listing-attribute.dto';
import { UpdateListingAttributeDto } from './dto/update-listing-attribute.dto';

@Injectable()
export class ListingAttributesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: {
    status?: ListingStatus;
    category?: ListingCategory;
    subPropertyType?: string;
  }) {
    const { status, category, subPropertyType } = params;
    
    // Filtreleme: status null veya eşleşen, category eşleşen, subPropertyType null veya eşleşen
    return this.prisma.listingAttributeDefinition.findMany({
      where: {
        ...(category ? { category } : {}),
        AND: [
          // Status: null (her iki durum için) veya eşleşen
          {
            OR: [
              { status: null },
              ...(status ? [{ status }] : []),
            ],
          },
          // SubPropertyType: null (tüm tipler için) veya eşleşen
          {
            OR: [
              { subPropertyType: null },
              ...(subPropertyType ? [{ subPropertyType }] : []),
            ],
          },
        ],
      },
      orderBy: [{ groupName: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  create(data: CreateListingAttributeDto) {
    return this.prisma.listingAttributeDefinition.create({
      data: {
        ...data,
        options: data.options ?? undefined,
      },
    });
  }

  update(id: string, data: UpdateListingAttributeDto) {
    return this.prisma.listingAttributeDefinition.update({
      where: { id },
      data: {
        ...data,
        options: data.options ?? undefined,
      },
    });
  }

  remove(id: string) {
    return this.prisma.listingAttributeDefinition.delete({ where: { id } });
  }
}
