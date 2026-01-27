import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AddListingImageDto } from './dto/add-listing-image.dto';
import { CreateListingDto } from './dto/create-listing.dto';
import { UploadListingImageDto } from './dto/upload-listing-image.dto';
import { UploadListingImagesDto } from './dto/upload-listing-images.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    status?: string;
    category?: string;
    cityId?: string;
    citySlug?: string;
    branchId?: string;
    branchSlug?: string;
    districtId?: string;
    neighborhoodId?: string;
    isOpportunity?: string;
    minPrice?: string;
    maxPrice?: string;
    take?: string;
    skip?: string;
    q?: string;
  }) {
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.cityId) {
      where.cityId = query.cityId;
    }
    if (query.citySlug) {
      where.city = { slug: query.citySlug };
    }
    if (query.branchId) {
      where.branchId = query.branchId;
    }
    if (query.branchSlug) {
      where.branch = { slug: query.branchSlug };
    }
    if (query.districtId) {
      where.districtId = query.districtId;
    }
    if (query.neighborhoodId) {
      where.neighborhoodId = query.neighborhoodId;
    }
    if (query.isOpportunity !== undefined) {
      where.isOpportunity = query.isOpportunity === 'true';
    }
    if (query.minPrice || query.maxPrice) {
      where.price = {
        gte: query.minPrice ? Number(query.minPrice) : undefined,
        lte: query.maxPrice ? Number(query.maxPrice) : undefined,
      };
    }
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const take = query.take ? Number(query.take) : undefined;
    const skip = query.skip ? Number(query.skip) : undefined;

    return this.prisma.listing.findMany({
      where,
      take: Number.isFinite(take) ? take : undefined,
      skip: Number.isFinite(skip) ? skip : undefined,
      include: {
        images: true,
        consultant: true,
        branch: true,
        city: true,
        district: true,
        neighborhood: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        images: true,
        consultant: true,
        branch: true,
        city: true,
        district: true,
        neighborhood: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  async create(userId: string, data: CreateListingDto) {
    const attributes = data.attributes
      ? (data.attributes as Prisma.InputJsonValue)
      : undefined;
    const createData: Prisma.ListingUncheckedCreateInput = {
      ...data,
      attributes,
      createdByUserId: userId,
    };

    return this.prisma.listing.create({
      data: createData,
    });
  }

  async update(id: string, data: UpdateListingDto) {
    const attributes = data.attributes
      ? (data.attributes as Prisma.InputJsonValue)
      : undefined;
    const updateData: Prisma.ListingUncheckedUpdateInput = {
      ...data,
      attributes,
    };

    return this.prisma.listing.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const images = await this.prisma.listingImage.findMany({
      where: { listingId: id },
    });
    await this.prisma.listingImage.deleteMany({
      where: { listingId: id },
    });
    await Promise.all(images.map((image) => this.tryRemoveFile(image.url)));
    return this.prisma.listing.delete({
      where: { id },
    });
  }

  async addImage(listingId: string, data: AddListingImageDto) {
    if (data.isCover) {
      await this.prisma.listingImage.updateMany({
        where: { listingId },
        data: { isCover: false },
      });
    }

    return this.prisma.listingImage.create({
      data: {
        listingId,
        url: data.url,
        isCover: data.isCover ?? false,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async setCoverImage(listingId: string, imageId: string) {
    const image = await this.prisma.listingImage.findFirst({
      where: { id: imageId, listingId },
    });

    if (!image) {
      throw new NotFoundException('Listing image not found');
    }

    await this.prisma.listingImage.updateMany({
      where: { listingId },
      data: { isCover: false },
    });

    return this.prisma.listingImage.update({
      where: { id: imageId },
      data: { isCover: true },
    });
  }

  async removeImage(listingId: string, imageId: string) {
    const image = await this.prisma.listingImage.findFirst({
      where: { id: imageId, listingId },
    });
    const result = await this.prisma.listingImage.deleteMany({
      where: { id: imageId, listingId },
    });
    if (image?.url) {
      await this.tryRemoveFile(image.url);
    }

    return { deleted: result.count };
  }

  async addUploadedImage(
    listingId: string,
    file: Express.Multer.File,
    data: UploadListingImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    await this.optimizeImage(file.path);

    const url = `/uploads/${file.filename}`;
    if (data.isCover) {
      await this.prisma.listingImage.updateMany({
        where: { listingId },
        data: { isCover: false },
      });
    }

    return this.prisma.listingImage.create({
      data: {
        listingId,
        url,
        isCover: data.isCover ?? false,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async addUploadedImages(
    listingId: string,
    files: Express.Multer.File[],
    data: UploadListingImagesDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Image files are required');
    }

    const setFirstAsCover = data.setFirstAsCover === 'true';
    const sortOrderStart = data.sortOrderStart
      ? Number(data.sortOrderStart)
      : 0;

    await Promise.all(files.map((file) => this.optimizeImage(file.path)));

    if (setFirstAsCover) {
      await this.prisma.listingImage.updateMany({
        where: { listingId },
        data: { isCover: false },
      });
    }

    const records = files.map((file, index) => ({
      listingId,
      url: `/uploads/${file.filename}`,
      isCover: setFirstAsCover ? index === 0 : false,
      sortOrder: sortOrderStart + index,
    }));

    await this.prisma.listingImage.createMany({ data: records });

    return { created: records.length };
  }

  private async tryRemoveFile(url: string) {
    if (!url.startsWith('/uploads/')) {
      return;
    }

    const relativePath = url.replace(/^\//, '');
    const filePath = join(process.cwd(), relativePath);
    try {
      await unlink(filePath);
    } catch {
      // ignore missing file
    }
  }

  private async optimizeImage(filePath: string) {
    try {
      const buffer = await sharp(filePath)
        .resize({ width: 1600, withoutEnlargement: true })
        .toBuffer();
      await writeFile(filePath, buffer);
    } catch {
      // ignore optimization errors
    }
  }
}
