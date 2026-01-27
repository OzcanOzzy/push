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
}
