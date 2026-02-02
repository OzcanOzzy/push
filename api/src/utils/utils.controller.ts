import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';

@Controller('utils')
export class UtilsController {
  @Get('resolve-url')
  async resolveUrl(@Query('url') url: string): Promise<{ resolvedUrl: string }> {
    if (!url) {
      throw new HttpException('URL parametresi gerekli', HttpStatus.BAD_REQUEST);
    }

    try {
      // Kısa URL'yi takip et ve son URL'yi al
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
      });

      // Response'un son URL'sini al
      const resolvedUrl = response.url;
      console.log('Kısa URL çözüldü:', url, '->', resolvedUrl);

      return { resolvedUrl };
    } catch (error) {
      console.error('URL çözme hatası:', error);
      
      // Alternatif: GET ile dene
      try {
        const response = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
        });
        return { resolvedUrl: response.url };
      } catch {
        throw new HttpException('URL çözülemedi', HttpStatus.BAD_REQUEST);
      }
    }
  }
}
