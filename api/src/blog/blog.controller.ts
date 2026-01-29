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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';

const imageStorage = diskStorage({
  destination: './uploads/blog',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `blog-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('blog')
export class BlogController {
  constructor(private readonly service: BlogService) {}

  @Get()
  findAll(
    @Query('limit') limit?: string,
    @Query('showOnHome') showOnHome?: string,
  ) {
    return this.service.findAll({
      limit: limit ? parseInt(limit) : undefined,
      showOnHome: showOnHome === 'true' ? true : showOnHome === 'false' ? false : undefined,
    });
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  create(
    @Body()
    body: {
      slug: string;
      title: string;
      excerpt?: string;
      content?: string;
      coverImage?: string;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      isPublished?: boolean;
      publishedAt?: Date;
      showOnHome?: boolean;
    },
  ) {
    return this.service.create(body);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageStorage,
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    return {
      url: `/uploads/blog/${file.filename}`,
      filename: file.filename,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body()
    body: {
      slug?: string;
      title?: string;
      excerpt?: string;
      content?: string;
      coverImage?: string;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      isPublished?: boolean;
      publishedAt?: Date;
      showOnHome?: boolean;
    },
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
