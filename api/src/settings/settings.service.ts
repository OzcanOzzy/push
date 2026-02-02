import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const DEFAULT_ID = 'default';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const existing = await this.prisma.siteSetting.findUnique({
      where: { id: DEFAULT_ID },
    });
    if (existing) {
      return existing;
    }
    return this.prisma.siteSetting.create({
      data: {
        id: DEFAULT_ID,
        siteName: 'Emlaknomi',
        ownerName: 'Özcan Aktaş',
        ownerTitle: 'Danışman',
        phoneNumber: '0543 306 14 99',
        whatsappNumber: '0543 306 14 99',
        email: 'emlaknomiozcan@gmail.com',
        supportEmail: 'destek@ozcanaktas.com',
        primaryColor: '#1a436e',
        accentColor: '#e20b0b',
        backgroundColor: '#e9e9f0',
        textColor: '#122033',
      },
    });
  }

  updateSettings(data: UpdateSettingsDto) {
    // Sadece Prisma schema'da olan alanları filtrele
    const allowedFields = [
      'siteName', 'logoUrl', 'ownerName', 'ownerTitle', 'showOwnerTitle',
      'phoneNumber', 'whatsappNumber', 'email', 'supportEmail', 'address',
      'primaryColor', 'accentColor', 'backgroundColor', 'textColor',
      'heroBackgroundUrl', 'heroOverlayColor', 'heroOverlayOpacity',
      'bannerWidth', 'bannerHeight', 'bannerOpacity',
      'logoWidth', 'logoHeight', 'logoPositionX', 'logoPositionY',
      'logoTagline', 'logoTaglineFont', 'logoTaglineFontSize', 'logoTaglineColor',
      'logoSubtitleText', 'logoSubtitleFont', 'logoSubtitleFontSize',
      'logoSubtitleColor', 'logoSubtitleBgColor', 'showLogoSubtitle',
      'faviconUrl',
      'profileImageUrl', 'profileImageWidth', 'profileImageHeight',
      'profilePositionX', 'profilePositionY', 'profileOpacity',
      'profileTitleLabel', 'profileTitleFont', 'profileTitleSize', 'profileTitleColor',
      'profileNameFont', 'profileNameSize', 'profileNameColor',
      'viewAllBtnText', 'viewAllBtnBgColor', 'viewAllBtnTextColor',
    ];

    const filteredData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in data && data[key as keyof UpdateSettingsDto] !== undefined) {
        filteredData[key] = data[key as keyof UpdateSettingsDto];
      }
    }

    return this.prisma.siteSetting.upsert({
      where: { id: DEFAULT_ID },
      update: filteredData,
      create: {
        id: DEFAULT_ID,
        siteName: data.siteName ?? 'Emlaknomi',
        logoUrl: data.logoUrl ?? null,
        ownerName: data.ownerName ?? 'Özcan Aktaş',
        ownerTitle: data.ownerTitle ?? 'Danışman',
        phoneNumber: data.phoneNumber ?? '0543 306 14 99',
        whatsappNumber: data.whatsappNumber ?? '0543 306 14 99',
        email: data.email ?? 'emlaknomiozcan@gmail.com',
        supportEmail: data.supportEmail ?? 'destek@ozcanaktas.com',
        primaryColor: data.primaryColor ?? '#1a436e',
        accentColor: data.accentColor ?? '#e20b0b',
        backgroundColor: data.backgroundColor ?? '#e9e9f0',
        textColor: data.textColor ?? '#122033',
        ...filteredData,
      },
    });
  }
}
