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
import * as path from 'path';

@Controller('admin/backup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /**
   * Tam yedekleme oluştur (tüm bileşenler)
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
