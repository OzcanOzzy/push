import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { ValuationRequestsService } from './valuation-requests.service';
import { CreateValuationRequestDto, UpdateValuationRequestStatusDto } from './dto/create-valuation-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role, RequestStatus } from '@prisma/client';

const multerOptions = {
  storage: diskStorage({
    destination: './uploads/valuation-requests',
    filename: (req, file, cb) => {
      const uniqueSuffix = uuidv4();
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
};

@Controller('valuation-requests')
export class ValuationRequestsController {
  constructor(private readonly service: ValuationRequestsService) {}

  // Public - Form gönderimi
  @Post()
  async create(@Body() dto: CreateValuationRequestDto) {
    return this.service.create(dto);
  }

  // Public - Fotoğraf/Video yükleme
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 20, multerOptions))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = files.map((file) => `/uploads/valuation-requests/${file.filename}`);
    return { success: true, urls };
  }

  // Admin - Listeleme
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.BROKER, Role.FIRM_OWNER, Role.REAL_ESTATE_EXPERT)
  async findAll(@Query('status') status?: string) {
    const requestStatus = status as RequestStatus | undefined;
    return this.service.findAll(requestStatus);
  }

  // Admin - İstatistikler
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.BROKER, Role.FIRM_OWNER, Role.REAL_ESTATE_EXPERT)
  async getStats() {
    return this.service.getStats();
  }

  // Admin - Excel Export
  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.BROKER, Role.FIRM_OWNER, Role.REAL_ESTATE_EXPERT)
  async exportToExcel(@Query('ids') ids: string, @Res() res: Response) {
    const idArray = ids ? ids.split(',').filter(Boolean) : [];
    const data = await this.service.findAllForExport(idArray);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Değerleme Talepleri');

    // Başlıklar
    worksheet.columns = [
      { header: 'Tarih', key: 'createdAt', width: 20 },
      { header: 'Ad Soyad', key: 'fullName', width: 25 },
      { header: 'Telefon', key: 'phone', width: 15 },
      { header: 'E-posta', key: 'email', width: 25 },
      { header: 'Şehir', key: 'city', width: 15 },
      { header: 'İlçe', key: 'district', width: 15 },
      { header: 'Mahalle', key: 'neighborhood', width: 20 },
      { header: 'Durum', key: 'listingStatus', width: 12 },
      { header: 'Kategori', key: 'category', width: 15 },
      { header: 'Alt Kategori', key: 'subPropertyType', width: 15 },
      { header: 'Notlar', key: 'notes', width: 30 },
      { header: 'Adres', key: 'address', width: 30 },
      { header: 'Talep Durumu', key: 'requestStatus', width: 15 },
      { header: 'Admin Notları', key: 'adminNotes', width: 30 },
      { header: 'Tahmini Değer', key: 'estimatedValue', width: 15 },
    ];

    // Veriler
    data.forEach((item) => {
      worksheet.addRow({
        createdAt: new Date(item.createdAt).toLocaleString('tr-TR'),
        fullName: item.fullName,
        phone: item.phone,
        email: item.email || '',
        city: item.city?.name || '',
        district: item.district?.name || '',
        neighborhood: item.neighborhood?.name || '',
        listingStatus: item.listingStatus === 'FOR_SALE' ? 'Satılık' : 'Kiralık',
        category: this.getCategoryLabel(item.category),
        subPropertyType: item.subPropertyType || '',
        notes: item.notes || '',
        address: item.address || '',
        requestStatus: this.getStatusLabel(item.requestStatus),
        adminNotes: item.adminNotes || '',
        estimatedValue: item.estimatedValue ? Number(item.estimatedValue) : '',
      });
    });

    // Stil
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0A4EA3' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=degerleme-talepleri-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  // Admin - Detay
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.BROKER, Role.FIRM_OWNER, Role.REAL_ESTATE_EXPERT)
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // Admin - Durum güncelle
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.BROKER, Role.FIRM_OWNER, Role.REAL_ESTATE_EXPERT)
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateValuationRequestStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  // Admin - Sil
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      HOUSING: 'Konut',
      LAND: 'Arsa',
      COMMERCIAL: 'Ticari',
      TRANSFER: 'Devren',
      FIELD: 'Tarla',
      GARDEN: 'Bahçe',
      HOBBY_GARDEN: 'Hobi Bahçesi',
    };
    return labels[category] || category;
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      NEW: 'Yeni',
      IN_PROGRESS: 'İşlemde',
      CLOSED: 'Tamamlandı',
    };
    return labels[status] || status;
  }
}
