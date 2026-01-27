import { Injectable } from '@nestjs/common';
import { ListingCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingAttributeDto } from './dto/create-listing-attribute.dto';
import { UpdateListingAttributeDto } from './dto/update-listing-attribute.dto';

@Injectable()
export class ListingAttributesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(category?: ListingCategory) {
    return this.prisma.listingAttributeDefinition.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
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
