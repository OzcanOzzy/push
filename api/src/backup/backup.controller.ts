import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { BackupService } from './backup.service';
import type { BackupOptions } from './backup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

@Controller('admin/backup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /**
   * A'dan Z'ye TAM YEDEKLEME - Tek ZIP olarak indir
   * Cursor'a yüklendiğinde direkt çalışacak şekilde
   */
  @Post('complete')
  async createCompleteBackup() {
    const result = await this.backupService.createCompleteBackup();
    return {
      success: result.success,
      message: result.success
        ? 'Tam yedekleme başarıyla oluşturuldu! Tek ZIP dosyası olarak indirebilirsiniz.'
        : 'Yedekleme oluşturuldu ancak bazı hatalar var',
      data: {
        timestamp: result.timestamp,
        zipName: result.zipName,
        totalSize: this.backupService.formatFileSize(result.totalSize),
        errors: result.errors,
        downloadUrl: `/admin/backup/download-complete/${result.zipName}`,
      },
    };
  }

  /**
   * Tam yedekleme ZIP'ini indir
   */
  @Get('download-complete/:zipName')
  async downloadCompleteBackup(
    @Param('zipName') zipName: string,
    @Res() res: Response,
  ) {
    // Güvenlik: sadece .zip dosyalarına izin ver
    if (!zipName.endsWith('.zip') || zipName.includes('..')) {
      throw new HttpException('Geçersiz dosya adı', HttpStatus.BAD_REQUEST);
    }

    // Service'deki aynı yolu kullan
    const filePath = this.backupService.getCompleteBackupPath(zipName);

    if (!filePath || !fs.existsSync(filePath)) {
      throw new HttpException('Yedek dosyası bulunamadı', HttpStatus.NOT_FOUND);
    }

    res.download(filePath, zipName);
  }

  /**
   * Tam yedekleme oluştur (tüm bileşenler - parça parça)
   */
  @Post('full')
  async createFullBackup() {
    const result = await this.backupService.createFullBackup();
    return {
      success: result.success,
      message: result.success 
        ? 'Tam yedekleme başarıyla oluşturuldu' 
        : 'Yedekleme kısmen başarılı oldu, bazı hatalar oluştu',
      data: {
        timestamp: result.timestamp,
        backupName: path.basename(result.backupPath),
        files: result.files,
        totalSize: this.backupService.formatFileSize(result.totalSize),
        errors: result.errors,
      },
    };
  }

  /**
   * Seçici yedekleme oluştur
   */
  @Post('selective')
  async createSelectiveBackup(@Body() options: BackupOptions) {
    // En az bir seçenek seçilmiş olmalı
    if (
      !options.includeSourceCode &&
      !options.includeDatabase &&
      !options.includeUploads &&
      !options.includeSettings
    ) {
      throw new HttpException(
        'En az bir yedekleme seçeneği seçilmelidir',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.backupService.createBackup(options);
    return {
      success: result.success,
      message: result.success
        ? 'Seçili yedekleme başarıyla oluşturuldu'
        : 'Yedekleme kısmen başarılı oldu, bazı hatalar oluştu',
      data: {
        timestamp: result.timestamp,
        backupName: path.basename(result.backupPath),
        files: result.files,
        totalSize: this.backupService.formatFileSize(result.totalSize),
        errors: result.errors,
      },
    };
  }

  /**
   * Yedekleme listesini getir
   */
  @Get('list')
  async listBackups() {
    const backups = await this.backupService.listBackups();
    return {
      success: true,
      data: backups.map((b) => ({
        ...b,
        totalSizeFormatted: this.backupService.formatFileSize(b.totalSize),
      })),
    };
  }

  /**
   * Yedek dosyasını indir
   */
  @Get('download/:backupName/:fileName')
  async downloadBackup(
    @Param('backupName') backupName: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const filePath = this.backupService.getBackupFilePath(backupName, fileName);
    
    if (!filePath) {
      throw new HttpException('Dosya bulunamadı', HttpStatus.NOT_FOUND);
    }

    res.download(filePath, fileName);
  }

  /**
   * Yedeği sil
   */
  @Delete(':backupName')
  async deleteBackup(@Param('backupName') backupName: string) {
    const deleted = await this.backupService.deleteBackup(backupName);
    
    if (!deleted) {
      throw new HttpException('Yedek bulunamadı', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      message: 'Yedek başarıyla silindi',
    };
  }
}
