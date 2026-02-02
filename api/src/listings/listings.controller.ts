import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPayloadDecorator } from '../shared/decorators/user-payload.decorator';
import type { UserPayload } from '../shared/types/user-payload';
import { AddListingImageDto } from './dto/add-listing-image.dto';
import { CreateListingDto } from './dto/create-listing.dto';
import { UploadListingImageDto } from './dto/upload-listing-image.dto';
import { UploadListingImagesDto } from './dto/upload-listing-images.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingsService } from './listings.service';

const uploadsDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

const multerOptions = {
  storage: diskStorage({
    destination: uploadsDir,
    filename: (_req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = extname(file.originalname);
      callback(null, `${uniqueSuffix}${extension}`);
    },
  }),
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
    } else {
      callback(new Error('Only image files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};

// Video yükleme için multer ayarları
const videoMulterOptions = {
  storage: diskStorage({
    destination: uploadsDir,
    filename: (_req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = extname(file.originalname);
      callback(null, `video-${uniqueSuffix}${extension}`);
    },
  }),
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('video/')) {
      callback(null, true);
    } else {
      callback(new Error('Only video files are allowed'), false);
    }
  },
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
};

// 360 panorama yükleme için multer ayarları
const panoramaMulterOptions = {
  storage: diskStorage({
    destination: uploadsDir,
    filename: (_req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = extname(file.originalname);
      callback(null, `panorama-${uniqueSuffix}${extension}`);
    },
  }),
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      callback(null, true);
    } else {
      callback(new Error('Only image or video files are allowed'), false);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
};

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findAll(
    @Query()
    query: {
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
    },
  ) {
    return this.listingsService.findAll(query);
  }

  // Şube içi gelişmiş arama
  @Get('search')
  search(
    @Query()
    query: {
      branchSlug: string;
      q?: string;
      neighborhoodIds?: string;
      includeNeighbors?: string;
      maxNeighborDistance?: string;
      status?: string;
      category?: string;
      districtId?: string;
      minPrice?: string;
      maxPrice?: string;
      roomCount?: string;
      buildingAge?: string;
      subPropertyType?: string;
      take?: string;
      skip?: string;
      sort?: string;
      order?: 'asc' | 'desc';
    },
  ) {
    return this.listingsService.search({
      ...query,
      neighborhoodIds: query.neighborhoodIds ? query.neighborhoodIds.split(',') : undefined,
      includeNeighbors: query.includeNeighbors === 'true',
      maxNeighborDistance: query.maxNeighborDistance ? parseFloat(query.maxNeighborDistance) : undefined,
      roomCount: query.roomCount ? query.roomCount.split(',') : undefined,
    });
  }

  // Kullanıcının kendi ilanları
  @UseGuards(JwtAuthGuard)
  @Get('my-listings')
  findMyListings(
    @UserPayloadDecorator() user: UserPayload,
    @Query() query: { status?: string; category?: string; q?: string },
  ) {
    return this.listingsService.findByCreator(user.sub, query);
  }

  // Tüm ilanlar (yöneticiler için)
  @UseGuards(JwtAuthGuard)
  @Get('all-listings')
  findAllListings(
    @UserPayloadDecorator() user: UserPayload,
    @Query() query: {
      status?: string;
      category?: string;
      branchId?: string;
      consultantId?: string;
      createdById?: string;
      q?: string;
    },
  ) {
    // Sadece ADMIN ve yönetici roller tüm ilanları görebilir
    const managerRoles = ['ADMIN', 'BROKER', 'FIRM_OWNER', 'REAL_ESTATE_EXPERT'];
    if (!managerRoles.includes(user.role)) {
      return this.listingsService.findByCreator(user.sub, query);
    }
    return this.listingsService.findAllForAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() body: CreateListingDto,
    @UserPayloadDecorator() user: UserPayload,
  ) {
    return this.listingsService.create(user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateListingDto) {
    return this.listingsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listingsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/images')
  addImage(@Param('id') id: string, @Body() body: AddListingImageDto) {
    return this.listingsService.addImage(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/images/:imageId/cover')
  setCover(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.listingsService.setCoverImage(id, imageId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/images/:imageId')
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.listingsService.removeImage(id, imageId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/images/upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadListingImageDto,
  ) {
    return this.listingsService.addUploadedImage(id, file, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/images/upload-many')
  @UseInterceptors(FilesInterceptor('files', 20, multerOptions))
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UploadListingImagesDto,
  ) {
    return this.listingsService.addUploadedImages(id, files, body);
  }

  // Video yükleme
  @UseGuards(JwtAuthGuard)
  @Post(':id/video/upload')
  @UseInterceptors(FileInterceptor('file', videoMulterOptions))
  uploadVideo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.listingsService.setVideo(id, file);
  }

  // Video silme
  @UseGuards(JwtAuthGuard)
  @Delete(':id/video')
  removeVideo(@Param('id') id: string) {
    return this.listingsService.removeVideo(id);
  }

  // 360 Panorama / Sanal tur yükleme
  @UseGuards(JwtAuthGuard)
  @Post(':id/virtual-tour/upload')
  @UseInterceptors(FileInterceptor('file', panoramaMulterOptions))
  uploadVirtualTour(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('tourType') tourType: string,
  ) {
    return this.listingsService.setVirtualTour(id, file, tourType || 'PANORAMA');
  }

  // Sanal tur silme
  @UseGuards(JwtAuthGuard)
  @Delete(':id/virtual-tour')
  removeVirtualTour(@Param('id') id: string) {
    return this.listingsService.removeVirtualTour(id);
  }

  // İlan transfer (başka danışmana ata)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/transfer')
  transferListing(
    @Param('id') id: string,
    @Body() body: { consultantId: string },
  ) {
    return this.listingsService.transferListing(id, body.consultantId);
  }
}
