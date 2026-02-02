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

  /**
   * Şube içi gelişmiş arama
   * - Kelime bazlı arama (her kelime ayrı ayrı aranır)
   * - "mahalle" kelimesi hariç tutulur
   * - İlan no ile direkt eşleşme
   * - Komşu mahalle desteği
   */
  async search(query: {
    branchSlug: string;
    q?: string;
    neighborhoodIds?: string[];
    includeNeighbors?: boolean;
    maxNeighborDistance?: number;
    status?: string;
    category?: string;
    districtId?: string;
    minPrice?: string;
    maxPrice?: string;
    roomCount?: string[];
    buildingAge?: string;
    subPropertyType?: string;
    take?: string;
    skip?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) {
    const where: Record<string, unknown> = {
      branch: { slug: query.branchSlug },
    };

    // İlan no ile arama (5 haneli numara)
    if (query.q) {
      const trimmedQ = query.q.trim();
      
      // İlan no formatı kontrolü (00001 gibi)
      if (/^\d{5}$/.test(trimmedQ)) {
        // İlan no ile direkt eşleşme - şube sınırlaması olmadan
        const listing = await this.prisma.listing.findUnique({
          where: { listingNo: trimmedQ },
          include: {
            images: true,
            consultant: true,
            branch: true,
            city: true,
            district: true,
            neighborhood: true,
          },
        });
        
        if (listing) {
          return {
            items: [listing],
            total: 1,
            isListingNoSearch: true,
            branchSlug: listing.branch.slug,
          };
        }
      }

      // Kelime bazlı arama
      // "mahalle" kelimesini ve türevlerini hariç tut
      const excludeWords = ['mahalle', 'mahallesi', 'mah', 'mah.'];
      const words = trimmedQ
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 1 && !excludeWords.includes(word));

      if (words.length > 0) {
        // Her kelime için OR koşulu (bir kelime bile eşleşirse göster)
        where.OR = words.flatMap((word) => [
          { title: { contains: word, mode: 'insensitive' } },
          { description: { contains: word, mode: 'insensitive' } },
          { neighborhood: { name: { contains: word, mode: 'insensitive' } } },
          { district: { name: { contains: word, mode: 'insensitive' } } },
          { attributes: { path: [], string_contains: word } },
        ]);
      }
    }

    // Mahalle filtresi
    if (query.neighborhoodIds && query.neighborhoodIds.length > 0) {
      let neighborhoodIds = [...query.neighborhoodIds];

      // Komşu mahalleleri de dahil et
      if (query.includeNeighbors) {
        const maxDistance = query.maxNeighborDistance || 3;
        const neighbors = await this.prisma.neighborhoodNeighbor.findMany({
          where: {
            neighborhoodId: { in: query.neighborhoodIds },
            distance: { lte: maxDistance },
          },
          select: { neighborId: true },
        });
        
        const neighborIds = neighbors.map((n) => n.neighborId);
        neighborhoodIds = [...new Set([...neighborhoodIds, ...neighborIds])];
      }

      where.neighborhoodId = { in: neighborhoodIds };
    }

    // Diğer filtreler
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.districtId) where.districtId = query.districtId;
    if (query.subPropertyType) where.subPropertyType = query.subPropertyType;
    
    if (query.minPrice || query.maxPrice) {
      where.price = {
        ...(query.minPrice ? { gte: Number(query.minPrice) } : {}),
        ...(query.maxPrice ? { lte: Number(query.maxPrice) } : {}),
      };
    }

    // Oda sayısı filtresi (attributes içinde)
    if (query.roomCount && query.roomCount.length > 0) {
      where.OR = [
        ...(where.OR as any[] || []),
        ...query.roomCount.map((room) => ({
          attributes: { path: ['roomCount'], equals: room },
        })),
      ];
    }

    // Bina yaşı filtresi
    if (query.buildingAge) {
      where.attributes = {
        ...(where.attributes as any || {}),
        path: ['buildingAge'],
        equals: query.buildingAge,
      };
    }

    const take = query.take ? Number(query.take) : 20;
    const skip = query.skip ? Number(query.skip) : 0;

    // Sıralama
    const orderBy: any = {};
    const sortField = query.sort || 'createdAt';
    const sortOrder = query.order || 'desc';
    orderBy[sortField] = sortOrder;

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        take: Number.isFinite(take) ? take : 20,
        skip: Number.isFinite(skip) ? skip : 0,
        include: {
          images: true,
          consultant: true,
          branch: true,
          city: true,
          district: true,
          neighborhood: true,
        },
        orderBy,
      }),
      this.prisma.listing.count({ where }),
    ]);

    return { items, total };
  }

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

  async findOne(identifier: string) {
    const include = {
      images: true,
      consultant: {
        include: {
          user: true,
        },
      },
      branch: true,
      city: true,
      district: true,
      neighborhood: true,
    };

    // Önce id ile dene
    let listing = await this.prisma.listing.findUnique({
      where: { id: identifier },
      include,
    });

    // Bulunamazsa slug ile dene
    if (!listing) {
      listing = await this.prisma.listing.findUnique({
        where: { slug: identifier },
        include,
      });
    }

    // Bulunamazsa listingNo ile dene (5 haneli numara formatı)
    if (!listing && /^\d{5}$/.test(identifier)) {
      listing = await this.prisma.listing.findUnique({
        where: { listingNo: identifier },
        include,
      });
    }

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  /**
   * Yeni ilan numarası üret (5 haneli: 00001, 00002, ...)
   */
  private async generateListingNo(): Promise<string> {
    const counter = await this.prisma.listingCounter.upsert({
      where: { id: 'default' },
      update: { lastNumber: { increment: 1 } },
      create: { id: 'default', lastNumber: 1 },
    });
    return counter.lastNumber.toString().padStart(5, '0');
  }

  /**
   * Google Maps URL'inden koordinat çıkar
   */
  private extractCoordsFromGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
    if (!url) return null;
    
    // Format: https://www.google.com/maps?q=37.8749,32.4932
    // Format: https://www.google.com/maps/@37.8749,32.4932,15z
    // Format: https://maps.google.com/maps?ll=37.8749,32.4932
    // Format: https://www.google.com/maps/place/.../@37.8749,32.4932,...
    
    const patterns = [
      /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
    
    return null;
  }

  /**
   * Otomatik SEO meta verileri oluştur
   */
  private generateSeoData(data: CreateListingDto, listingNo: string): {
    slug: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  } {
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ü/g, 'u')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const statusText = data.status === 'FOR_SALE' ? 'Satılık' : 'Kiralık';
    const slug = `${slugify(data.title)}-${listingNo}`;
    const metaTitle = data.metaTitle || `${statusText} ${data.title} - İlan No: ${listingNo}`;
    const metaDescription = data.metaDescription || 
      (data.description ? data.description.substring(0, 160) : `${statusText} gayrimenkul ilanı. İlan no: ${listingNo}`);
    const metaKeywords = data.metaKeywords || 
      `${statusText.toLowerCase()}, gayrimenkul, emlak, ${data.category?.toLowerCase() || ''}, ilan ${listingNo}`;

    return { slug, metaTitle, metaDescription, metaKeywords };
  }

  async create(userId: string, data: CreateListingDto) {
    // İlan numarası: Kullanıcı verdiyse onu kullan, yoksa otomatik üret
    let listingNo = data.listingNo;
    if (!listingNo) {
      listingNo = await this.generateListingNo();
    }

    // Google Maps URL'inden koordinat çıkar (varsa)
    if (data.googleMapsUrl && (!data.latitude || !data.longitude)) {
      const coords = this.extractCoordsFromGoogleMapsUrl(data.googleMapsUrl);
      if (coords) {
        data.latitude = coords.lat;
        data.longitude = coords.lng;
      }
    }

    // SEO verileri: Boş bırakılmışsa otomatik oluştur
    const seoData = this.generateSeoData(data, listingNo);

    const attributes = data.attributes
      ? (data.attributes as Prisma.InputJsonValue)
      : undefined;
    
    const createData: Prisma.ListingUncheckedCreateInput = {
      ...data,
      listingNo,
      slug: data.slug || seoData.slug,
      metaTitle: data.metaTitle || seoData.metaTitle,
      metaDescription: data.metaDescription || seoData.metaDescription,
      metaKeywords: data.metaKeywords || seoData.metaKeywords,
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

  // Video yükleme
  async setVideo(listingId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Video file is required');
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Eski video varsa sil
    if (listing.videoUrl) {
      await this.tryRemoveFile(listing.videoUrl);
    }

    const videoUrl = `/uploads/${file.filename}`;

    return this.prisma.listing.update({
      where: { id: listingId },
      data: { videoUrl },
    });
  }

  // Video silme
  async removeVideo(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.videoUrl) {
      await this.tryRemoveFile(listing.videoUrl);
    }

    return this.prisma.listing.update({
      where: { id: listingId },
      data: { videoUrl: null },
    });
  }

  // Sanal tur yükleme (360 panorama veya video)
  async setVirtualTour(listingId: string, file: Express.Multer.File, tourType: string) {
    if (!file) {
      throw new BadRequestException('Virtual tour file is required');
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Eski sanal tur varsa sil (sadece yüklenen dosyalar)
    if (listing.virtualTourUrl && listing.virtualTourUrl.startsWith('/uploads/')) {
      await this.tryRemoveFile(listing.virtualTourUrl);
    }

    const virtualTourUrl = `/uploads/${file.filename}`;

    return this.prisma.listing.update({
      where: { id: listingId },
      data: { 
        virtualTourUrl,
        virtualTourType: tourType || 'PANORAMA',
      },
    });
  }

  // Sanal tur silme
  async removeVirtualTour(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.virtualTourUrl && listing.virtualTourUrl.startsWith('/uploads/')) {
      await this.tryRemoveFile(listing.virtualTourUrl);
    }

    return this.prisma.listing.update({
      where: { id: listingId },
      data: { 
        virtualTourUrl: null,
        virtualTourType: null,
      },
    });
  }

  // Kullanıcının kendi ilanlarını getir
  async findByCreator(
    userId: string,
    query: { status?: string; category?: string; q?: string },
  ) {
    const where: Record<string, unknown> = {
      createdById: userId,
    };

    if (query.status) {
      where.status = query.status;
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { listingNo: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.listing.findMany({
      where,
      include: {
        images: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] },
        city: true,
        district: true,
        branch: true,
        consultant: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Yöneticiler için tüm ilanlar (filtreleme ile)
  async findAllForAdmin(query: {
    status?: string;
    category?: string;
    branchId?: string;
    consultantId?: string;
    createdById?: string;
    q?: string;
  }) {
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.branchId) {
      where.branchId = query.branchId;
    }
    if (query.consultantId) {
      where.consultantId = query.consultantId;
    }
    if (query.createdById) {
      where.createdById = query.createdById;
    }
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { listingNo: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.listing.findMany({
      where,
      include: {
        images: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] },
        city: true,
        district: true,
        branch: true,
        consultant: { include: { user: true } },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // İlan transfer (başka danışmana ata)
  async transferListing(listingId: string, newConsultantId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const consultant = await this.prisma.consultant.findUnique({
      where: { id: newConsultantId },
      include: { user: true },
    });

    if (!consultant) {
      throw new NotFoundException('Consultant not found');
    }

    return this.prisma.listing.update({
      where: { id: listingId },
      data: {
        consultantId: newConsultantId,
        createdByUserId: consultant.userId,
      },
    });
  }
}
