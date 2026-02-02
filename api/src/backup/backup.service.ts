import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import archiver from 'archiver';

const execAsync = promisify(exec);

export interface BackupOptions {
  includeSourceCode?: boolean;
  includeDatabase?: boolean;
  includeUploads?: boolean;
  includeSettings?: boolean;
}

export interface BackupResult {
  success: boolean;
  timestamp: string;
  backupPath: string;
  files: {
    sourceCode?: string;
    database?: string;
    uploads?: string;
    settings?: string;
  };
  errors: string[];
  totalSize: number;
}

export interface CompleteBackupResult {
  success: boolean;
  timestamp: string;
  zipPath: string;
  zipName: string;
  totalSize: number;
  errors: string[];
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly rootDir = path.resolve(__dirname, '..', '..', '..');
  private readonly backupDir = path.join(this.rootDir, 'backups');

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {
    // Backup klasörünü oluştur
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Tam yedekleme - Tüm bileşenleri yedekler
   */
  async createFullBackup(): Promise<BackupResult> {
    return this.createBackup({
      includeSourceCode: true,
      includeDatabase: true,
      includeUploads: true,
      includeSettings: true,
    });
  }

  /**
   * A'dan Z'ye TAM YEDEKLEME - Tek ZIP dosyası olarak indirilir
   * Cursor'a yüklendiğinde direkt çalışacak şekilde hazırlanır
   */
  async createCompleteBackup(): Promise<CompleteBackupResult> {
    const timestamp = this.getTimestamp();
    const zipName = `ozcanaktasweb3_complete_${timestamp}.zip`;
    const zipPath = path.join(this.backupDir, zipName);
    
    const result: CompleteBackupResult = {
      success: true,
      timestamp,
      zipPath,
      zipName,
      totalSize: 0,
      errors: [],
    };

    return new Promise(async (resolve) => {
      try {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
          result.totalSize = archive.pointer();
          this.logger.log(`Tam yedekleme tamamlandı: ${zipPath} (${this.formatFileSize(result.totalSize)})`);
          resolve(result);
        });

        archive.on('error', (err) => {
          result.success = false;
          result.errors.push(`Arşiv hatası: ${err.message}`);
          resolve(result);
        });

        archive.pipe(output);

        // ============================================
        // 1. API KLASÖRÜ (node_modules, dist hariç)
        // ============================================
        const apiDir = path.join(this.rootDir, 'api');
        if (fs.existsSync(apiDir)) {
          archive.directory(apiDir, 'api', (entry) => {
            const excludePatterns = ['node_modules', 'dist', '.git', 'coverage'];
            for (const pattern of excludePatterns) {
              if (entry.name.includes(`${pattern}/`) || entry.name.includes(`${pattern}\\`)) {
                return false;
              }
            }
            return entry;
          });
          this.logger.log('API klasörü eklendi');
        }

        // ============================================
        // 2. WEB KLASÖRÜ (node_modules, .next hariç)
        // ============================================
        const webDir = path.join(this.rootDir, 'web');
        if (fs.existsSync(webDir)) {
          archive.directory(webDir, 'web', (entry) => {
            const excludePatterns = ['node_modules', '.next', 'dist', '.git', 'coverage', 'out'];
            for (const pattern of excludePatterns) {
              if (entry.name.includes(`${pattern}/`) || entry.name.includes(`${pattern}\\`)) {
                return false;
              }
            }
            return entry;
          });
          this.logger.log('Web klasörü eklendi');
        }

        // ============================================
        // 3. UPLOADS KLASÖRÜ (tüm görseller)
        // ============================================
        const uploadPaths = [
          path.join(this.rootDir, 'uploads'),
          path.join(this.rootDir, 'api', 'uploads'),
        ];
        for (const uploadDir of uploadPaths) {
          if (fs.existsSync(uploadDir)) {
            archive.directory(uploadDir, 'uploads');
            this.logger.log(`Uploads klasörü eklendi: ${uploadDir}`);
            break;
          }
        }

        // ============================================
        // 4. ROOT DOSYAları
        // ============================================
        const rootFiles = [
          'docker-compose.yml',
          '.gitignore',
          'PROGRESS.md',
          'README.md',
          '.env',
          '.env.example',
        ];
        for (const file of rootFiles) {
          const filePath = path.join(this.rootDir, file);
          if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: file });
          }
        }

        // ============================================
        // 5. PROJECT_NOTES KLASÖRÜ
        // ============================================
        const notesDir = path.join(this.rootDir, 'project_notes');
        if (fs.existsSync(notesDir)) {
          archive.directory(notesDir, 'project_notes');
          this.logger.log('Project notes klasörü eklendi');
        }

        // ============================================
        // 6. DATABASE EXPORT (JSON)
        // ============================================
        try {
          const dbData = await this.exportDatabaseToJson();
          archive.append(JSON.stringify(dbData, null, 2), { name: 'database_backup.json' });
          this.logger.log('Database export eklendi');
        } catch (dbError) {
          result.errors.push(`Database export hatası: ${dbError.message}`);
        }

        // ============================================
        // 7. SITE AYARLARI
        // ============================================
        try {
          const settings = await this.settingsService.getSettings();
          const settingsData = {
            siteSettings: settings,
            exportedAt: new Date().toISOString(),
          };
          archive.append(JSON.stringify(settingsData, null, 2), { name: 'site_settings.json' });
          this.logger.log('Site ayarları eklendi');
        } catch (settingsError) {
          result.errors.push(`Ayarlar export hatası: ${settingsError.message}`);
        }

        // ============================================
        // 8. GERİ YÜKLEME REHBERİ
        // ============================================
        const restoreGuide = this.generateCompleteRestoreGuide(timestamp);
        archive.append(restoreGuide, { name: 'GERİ_YUKLEME_REHBERI.md' });

        // ============================================
        // 9. HIZLI BAŞLATMA SCRIPTI
        // ============================================
        const setupScript = this.generateSetupScript();
        archive.append(setupScript, { name: 'setup.sh' });
        
        const setupBat = this.generateSetupBat();
        archive.append(setupBat, { name: 'setup.bat' });

        // ============================================
        // 10. PROJE BİLGİLERİ
        // ============================================
        const projectInfo = {
          projectName: 'ozcanaktasweb3',
          backupDate: new Date().toISOString(),
          timestamp,
          nodeVersion: process.version,
          platform: process.platform,
          contents: [
            'api/ - NestJS Backend API',
            'web/ - Next.js Frontend',
            'uploads/ - Yüklenen görseller',
            'database_backup.json - Veritabanı yedeği',
            'site_settings.json - Site ayarları',
            'project_notes/ - Proje notları',
          ],
          ports: {
            api: 3001,
            web: 3000,
            database: 5432,
          },
        };
        archive.append(JSON.stringify(projectInfo, null, 2), { name: 'PROJECT_INFO.json' });

        archive.finalize();
      } catch (error) {
        result.success = false;
        result.errors.push(`Genel hata: ${error.message}`);
        resolve(result);
      }
    });
  }

  /**
   * Database'i JSON olarak export et
   */
  private async exportDatabaseToJson(): Promise<Record<string, any>> {
    const data: Record<string, any> = {
      exportedAt: new Date().toISOString(),
      tables: {},
    };

    const tables = [
      { name: 'siteSettings', method: () => this.prisma.siteSetting.findMany() },
      { name: 'users', method: () => this.prisma.user.findMany() },
      { name: 'consultants', method: () => this.prisma.consultant.findMany() },
      { name: 'cities', method: () => this.prisma.city.findMany() },
      { name: 'districts', method: () => this.prisma.district.findMany() },
      { name: 'neighborhoods', method: () => this.prisma.neighborhood.findMany() },
      { name: 'branches', method: () => this.prisma.branch.findMany() },
      { name: 'listings', method: () => this.prisma.listing.findMany({ include: { images: true } }) },
      { name: 'listingImages', method: () => this.prisma.listingImage.findMany() },
      { name: 'listingAttributeDefinitions', method: () => this.prisma.listingAttributeDefinition.findMany() },
      { name: 'cityButtons', method: () => this.prisma.cityButton.findMany() },
      { name: 'actionButtons', method: () => this.prisma.actionButton.findMany() },
      { name: 'banners', method: () => this.prisma.banner.findMany() },
      { name: 'menuItems', method: () => this.prisma.menuItem.findMany() },
      { name: 'socialLinks', method: () => this.prisma.socialLink.findMany() },
      { name: 'footerItems', method: () => this.prisma.footerItem.findMany() },
      { name: 'listingLabels', method: () => this.prisma.listingLabel.findMany() },
      { name: 'blogPosts', method: () => this.prisma.blogPost.findMany() },
      { name: 'customerRequests', method: () => this.prisma.customerRequest.findMany() },
      { name: 'consultantRequests', method: () => this.prisma.consultantRequest.findMany() },
    ];

    for (const table of tables) {
      try {
        data.tables[table.name] = await table.method();
      } catch {
        // Tablo yoksa atla
      }
    }

    return data;
  }

  /**
   * Linux/Mac için setup script
   */
  private generateSetupScript(): string {
    return `#!/bin/bash
# ozcanaktasweb3 Hızlı Kurulum Scripti
# Bu scripti çalıştırmak için: chmod +x setup.sh && ./setup.sh

echo "=========================================="
echo "  ozcanaktasweb3 Kurulum Başlatılıyor"
echo "=========================================="

# Renk kodları
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

# 1. Node.js kontrolü
echo -e "\${YELLOW}[1/6] Node.js kontrol ediliyor...\${NC}"
if ! command -v node &> /dev/null; then
    echo "Node.js bulunamadı! Lütfen önce Node.js yükleyin: https://nodejs.org"
    exit 1
fi
echo -e "\${GREEN}✓ Node.js $(node -v) bulundu\${NC}"

# 2. API bağımlılıkları
echo -e "\${YELLOW}[2/6] API bağımlılıkları yükleniyor...\${NC}"
cd api
npm install
echo -e "\${GREEN}✓ API bağımlılıkları yüklendi\${NC}"

# 3. Web bağımlılıkları
echo -e "\${YELLOW}[3/6] Web bağımlılıkları yükleniyor...\${NC}"
cd ../web
npm install
echo -e "\${GREEN}✓ Web bağımlılıkları yüklendi\${NC}"

# 4. .env dosyalarını kontrol et
echo -e "\${YELLOW}[4/6] .env dosyaları kontrol ediliyor...\${NC}"
cd ../api
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "⚠ api/.env dosyası .env.example'dan oluşturuldu. Lütfen düzenleyin!"
    fi
fi
cd ../web
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "⚠ web/.env dosyası .env.example'dan oluşturuldu. Lütfen düzenleyin!"
    fi
fi
echo -e "\${GREEN}✓ .env dosyaları kontrol edildi\${NC}"

# 5. Prisma client oluştur
echo -e "\${YELLOW}[5/6] Prisma client oluşturuluyor...\${NC}"
cd ../api
npx prisma generate
echo -e "\${GREEN}✓ Prisma client oluşturuldu\${NC}"

# 6. Tamamlandı
echo -e "\${YELLOW}[6/6] Kurulum tamamlandı!\${NC}"
echo ""
echo "=========================================="
echo -e "\${GREEN}  KURULUM BAŞARILI!\${NC}"
echo "=========================================="
echo ""
echo "Projeyi başlatmak için:"
echo ""
echo "  Terminal 1 (API):"
echo "    cd api && npm run start:dev"
echo ""
echo "  Terminal 2 (Web):"
echo "    cd web && npm run dev"
echo ""
echo "Adresler:"
echo "  - Frontend: http://localhost:3000"
echo "  - API: http://localhost:3001"
echo "  - Admin: http://localhost:3000/admin"
echo ""
`;
  }

  /**
   * Windows için setup script
   */
  private generateSetupBat(): string {
    return `@echo off
REM ozcanaktasweb3 Hizli Kurulum Scripti (Windows)
REM Bu scripti calistirmak icin: setup.bat

echo ==========================================
echo   ozcanaktasweb3 Kurulum Baslatiliyor
echo ==========================================

REM 1. Node.js kontrolu
echo [1/6] Node.js kontrol ediliyor...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js bulunamadi! Lutfen once Node.js yukleyin: https://nodejs.org
    pause
    exit /b 1
)
echo Node.js bulundu

REM 2. API bagimliliklari
echo [2/6] API bagimliliklari yukleniyor...
cd api
call npm install
cd ..

REM 3. Web bagimliliklari
echo [3/6] Web bagimliliklari yukleniyor...
cd web
call npm install
cd ..

REM 4. .env dosyalarini kontrol et
echo [4/6] .env dosyalari kontrol ediliyor...
cd api
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo api/.env dosyasi olusturuldu. Lutfen duzenleyin!
    )
)
cd ../web
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo web/.env dosyasi olusturuldu. Lutfen duzenleyin!
    )
)
cd ..

REM 5. Prisma client olustur
echo [5/6] Prisma client olusturuluyor...
cd api
call npx prisma generate
cd ..

REM 6. Tamamlandi
echo [6/6] Kurulum tamamlandi!
echo.
echo ==========================================
echo   KURULUM BASARILI!
echo ==========================================
echo.
echo Projeyi baslatmak icin:
echo.
echo   Terminal 1 (API):
echo     cd api ^&^& npm run start:dev
echo.
echo   Terminal 2 (Web):
echo     cd web ^&^& npm run dev
echo.
echo Adresler:
echo   - Frontend: http://localhost:3000
echo   - API: http://localhost:3001
echo   - Admin: http://localhost:3000/admin
echo.
pause
`;
  }

  /**
   * Tam yedekleme için detaylı geri yükleme rehberi
   */
  private generateCompleteRestoreGuide(timestamp: string): string {
    return `# 🗂️ ozcanaktasweb3 Tam Yedek Geri Yükleme Rehberi

## 📋 Yedekleme Bilgileri
- **Tarih:** ${new Date().toLocaleString('tr-TR')}
- **Timestamp:** ${timestamp}
- **Proje:** ozcanaktasweb3 Emlak Sitesi

---

## 🚀 HIZLI KURULUM (Otomatik)

### Windows için:
\`\`\`
setup.bat
\`\`\`

### Linux/Mac için:
\`\`\`bash
chmod +x setup.sh
./setup.sh
\`\`\`

---

## 📝 MANUEL KURULUM

### Adım 1: Dosyaları Çıkart
ZIP dosyasını istediğiniz bir klasöre çıkartın.

### Adım 2: Cursor'da Aç
1. Cursor'u açın
2. File > Open Folder
3. Çıkarttığınız klasörü seçin

### Adım 3: .env Dosyalarını Düzenle

**api/.env** dosyasını kontrol edin:
\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key"
PORT=3001
\`\`\`

**web/.env** dosyasını kontrol edin:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

### Adım 4: Bağımlılıkları Yükle

Terminal 1:
\`\`\`bash
cd api
npm install
\`\`\`

Terminal 2:
\`\`\`bash
cd web
npm install
\`\`\`

### Adım 5: PostgreSQL Veritabanı

#### Docker ile (Önerilen):
\`\`\`bash
docker-compose up -d db
\`\`\`

#### Manuel kurulum:
1. PostgreSQL'i yükleyin
2. Yeni database oluşturun
3. DATABASE_URL'i güncelleyin

### Adım 6: Prisma Kurulumu
\`\`\`bash
cd api
npx prisma generate
npx prisma db push
\`\`\`

### Adım 7: Veritabanını Geri Yükle (Opsiyonel)
Eğer \`database_backup.json\` dosyası varsa, admin panelden import edebilirsiniz.
Veya API başladıktan sonra seed verilerini yükleyin.

### Adım 8: Projeyi Başlat

Terminal 1 (API):
\`\`\`bash
cd api
npm run start:dev
\`\`\`

Terminal 2 (Web):
\`\`\`bash
cd web
npm run dev
\`\`\`

---

## 🌐 Adresler

| Servis | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Admin Panel | http://localhost:3000/admin |
| API | http://localhost:3001 |

---

## ⚠️ Olası Sorunlar ve Çözümler

### 1. Eski Tema/Renk Görünüyorsa
\`\`\`bash
cd web
rm -rf .next
npm run dev
\`\`\`
Tarayıcı cache'ini de temizleyin: Ctrl+Shift+Delete

### 2. Database Bağlantı Hatası
- PostgreSQL'in çalıştığından emin olun
- DATABASE_URL'in doğru olduğunu kontrol edin
- Docker kullanıyorsanız: \`docker-compose up -d db\`

### 3. Port Çakışması
\`\`\`bash
# Port kullanan process'i bul
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Process'i sonlandır (Windows)
taskkill /PID <PID> /F
\`\`\`

### 4. node_modules Hatası
\`\`\`bash
# Temiz kurulum
rm -rf node_modules package-lock.json
npm install
\`\`\`

### 5. Prisma Hatası
\`\`\`bash
cd api
npx prisma generate
npx prisma db push --force-reset
\`\`\`

---

## 📁 Klasör Yapısı

\`\`\`
ozcanaktasweb3/
├── api/                    # NestJS Backend
│   ├── src/               # Kaynak kodlar
│   ├── prisma/            # Database şeması
│   ├── uploads/           # Yüklenen dosyalar
│   └── .env               # Ortam değişkenleri
├── web/                    # Next.js Frontend
│   ├── app/               # Sayfalar ve bileşenler
│   ├── public/            # Statik dosyalar
│   └── .env               # Ortam değişkenleri
├── uploads/                # Yedek görseller
├── database_backup.json    # Veritabanı yedeği
├── site_settings.json      # Site ayarları
├── setup.sh               # Linux/Mac kurulum scripti
├── setup.bat              # Windows kurulum scripti
└── GERİ_YUKLEME_REHBERI.md # Bu dosya
\`\`\`

---

## 🔐 Varsayılan Giriş Bilgileri

Admin panele giriş için yedeği aldığınız sitedeki kullanıcı bilgilerini kullanın.
Eğer unuttuysanız, database'den sıfırlayabilirsiniz.

---

## 💡 İpuçları

1. **İlk başlatmada** tüm modüller yüklendikten sonra sayfayı yenileyin
2. **Görseller görünmüyorsa** uploads klasörünün doğru yerde olduğunu kontrol edin
3. **API hatalarında** terminal çıktısını kontrol edin
4. **.next klasörünü silmek** çoğu cache sorununu çözer

---

Başarılı kurulumlar! 🎉
`;
  }

  /**
   * Seçici yedekleme - Sadece seçilen bileşenleri yedekler
   */
  async createBackup(options: BackupOptions): Promise<BackupResult> {
    const timestamp = this.getTimestamp();
    const backupFolderName = `backup_${timestamp}`;
    const backupPath = path.join(this.backupDir, backupFolderName);

    // Yedekleme klasörünü oluştur
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    const result: BackupResult = {
      success: true,
      timestamp,
      backupPath,
      files: {},
      errors: [],
      totalSize: 0,
    };

    try {
      // 1. Kaynak Kod Yedeklemesi
      if (options.includeSourceCode) {
        try {
          const sourceCodeFile = await this.backupSourceCode(backupPath, timestamp);
          result.files.sourceCode = sourceCodeFile;
          result.totalSize += this.getFileSize(sourceCodeFile);
          this.logger.log(`Kaynak kod yedeklendi: ${sourceCodeFile}`);
        } catch (error) {
          result.errors.push(`Kaynak kod yedekleme hatası: ${error.message}`);
          this.logger.error('Kaynak kod yedekleme hatası:', error);
        }
      }

      // 2. Database Yedeklemesi
      if (options.includeDatabase) {
        try {
          const databaseFile = await this.backupDatabase(backupPath, timestamp);
          result.files.database = databaseFile;
          result.totalSize += this.getFileSize(databaseFile);
          this.logger.log(`Database yedeklendi: ${databaseFile}`);
        } catch (error) {
          result.errors.push(`Database yedekleme hatası: ${error.message}`);
          this.logger.error('Database yedekleme hatası:', error);
        }
      }

      // 3. Uploads Yedeklemesi
      if (options.includeUploads) {
        try {
          const uploadsFile = await this.backupUploads(backupPath, timestamp);
          if (uploadsFile) {
            result.files.uploads = uploadsFile;
            result.totalSize += this.getFileSize(uploadsFile);
            this.logger.log(`Uploads yedeklendi: ${uploadsFile}`);
          } else {
            result.errors.push('Uploads klasörü bulunamadı veya boş');
          }
        } catch (error) {
          result.errors.push(`Uploads yedekleme hatası: ${error.message}`);
          this.logger.error('Uploads yedekleme hatası:', error);
        }
      }

      // 4. Ayarlar Yedeklemesi (JSON)
      if (options.includeSettings) {
        try {
          const settingsFile = await this.backupSettings(backupPath, timestamp);
          result.files.settings = settingsFile;
          result.totalSize += this.getFileSize(settingsFile);
          this.logger.log(`Ayarlar yedeklendi: ${settingsFile}`);
        } catch (error) {
          result.errors.push(`Ayarlar yedekleme hatası: ${error.message}`);
          this.logger.error('Ayarlar yedekleme hatası:', error);
        }
      }

      // Sonuç durumunu belirle
      result.success = result.errors.length === 0;

    } catch (error) {
      result.success = false;
      result.errors.push(`Genel yedekleme hatası: ${error.message}`);
      this.logger.error('Genel yedekleme hatası:', error);
    }

    return result;
  }

  /**
   * Kaynak kod yedeklemesi (zip)
   */
  private async backupSourceCode(backupPath: string, timestamp: string): Promise<string> {
    const outputFile = path.join(backupPath, `source_code_${timestamp}.zip`);
    
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputFile);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve(outputFile));
      archive.on('error', (err) => reject(err));

      archive.pipe(output);

      // API klasörü (node_modules, dist hariç)
      const apiDir = path.join(this.rootDir, 'api');
      if (fs.existsSync(apiDir)) {
        archive.directory(apiDir, 'api', (entry) => {
          // node_modules, dist, .next gibi klasörleri hariç tut
          const excludePatterns = ['node_modules', 'dist', '.next', 'build', '.git'];
          for (const pattern of excludePatterns) {
            if (entry.name.includes(pattern)) {
              return false;
            }
          }
          return entry;
        });
      }

      // Web klasörü (node_modules, .next hariç)
      const webDir = path.join(this.rootDir, 'web');
      if (fs.existsSync(webDir)) {
        archive.directory(webDir, 'web', (entry) => {
          const excludePatterns = ['node_modules', 'dist', '.next', 'build', '.git'];
          for (const pattern of excludePatterns) {
            if (entry.name.includes(pattern)) {
              return false;
            }
          }
          return entry;
        });
      }

      // Root seviyesindeki önemli dosyalar
      const rootFiles = ['docker-compose.yml', '.gitignore', 'PROGRESS.md', 'README.md'];
      for (const file of rootFiles) {
        const filePath = path.join(this.rootDir, file);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: file });
        }
      }

      // .env dosyalarını dahil et (kritik!)
      const envFiles = [
        { path: path.join(this.rootDir, 'api', '.env'), name: 'api/.env' },
        { path: path.join(this.rootDir, 'web', '.env'), name: 'web/.env' },
        { path: path.join(this.rootDir, 'api', '.env.example'), name: 'api/.env.example' },
        { path: path.join(this.rootDir, 'web', '.env.example'), name: 'web/.env.example' },
      ];
      for (const env of envFiles) {
        if (fs.existsSync(env.path)) {
          archive.file(env.path, { name: env.name });
        }
      }

      // Geri yükleme rehberi oluştur
      const restoreGuide = this.generateRestoreGuide();
      archive.append(restoreGuide, { name: 'RESTORE_GUIDE.md' });

      // project_notes klasörü
      const notesDir = path.join(this.rootDir, 'project_notes');
      if (fs.existsSync(notesDir)) {
        archive.directory(notesDir, 'project_notes');
      }

      archive.finalize();
    });
  }

  /**
   * Database yedeklemesi (SQL dump)
   */
  private async backupDatabase(backupPath: string, timestamp: string): Promise<string> {
    const outputFile = path.join(backupPath, `database_${timestamp}.sql`);
    
    // DATABASE_URL'den bağlantı bilgilerini çıkar
    const databaseUrl = process.env.DATABASE_URL || '';
    
    // PostgreSQL connection string parse et
    // Format: postgresql://user:password@host:port/database
    const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!urlMatch) {
      // Eğer pg_dump kullanılamıyorsa, Prisma ile JSON export yap
      return this.backupDatabaseWithPrisma(backupPath, timestamp);
    }

    const [, user, password, host, port, database] = urlMatch;

    try {
      // pg_dump komutu
      const command = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -f "${outputFile}" --clean --if-exists`;
      
      await execAsync(command);
      return outputFile;
    } catch (error) {
      this.logger.warn('pg_dump çalıştırılamadı, Prisma ile JSON export yapılıyor...');
      // pg_dump yoksa Prisma ile JSON export
      return this.backupDatabaseWithPrisma(backupPath, timestamp);
    }
  }

  /**
   * Prisma ile database export (JSON formatında)
   */
  private async backupDatabaseWithPrisma(backupPath: string, timestamp: string): Promise<string> {
    const outputFile = path.join(backupPath, `database_${timestamp}.json`);
    
    const data: Record<string, any> = {};

    // Tüm tabloları export et
    try {
      data.siteSettings = await this.prisma.siteSetting.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.users = await this.prisma.user.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.consultants = await this.prisma.consultant.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.cities = await this.prisma.city.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.districts = await this.prisma.district.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.neighborhoods = await this.prisma.neighborhood.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.branches = await this.prisma.branch.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.listings = await this.prisma.listing.findMany({ include: { images: true } });
    } catch (e) { /* tablo yok */ }

    try {
      data.listingImages = await this.prisma.listingImage.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.listingAttributeDefinitions = await this.prisma.listingAttributeDefinition.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.cityButtons = await this.prisma.cityButton.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.actionButtons = await this.prisma.actionButton.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.banners = await this.prisma.banner.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.menuItems = await this.prisma.menuItem.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.socialLinks = await this.prisma.socialLink.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.footerItems = await this.prisma.footerItem.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.listingLabels = await this.prisma.listingLabel.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.blogPosts = await this.prisma.blogPost.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.customerRequests = await this.prisma.customerRequest.findMany();
    } catch (e) { /* tablo yok */ }

    try {
      data.consultantRequests = await this.prisma.consultantRequest.findMany();
    } catch (e) { /* tablo yok */ }

    // JSON dosyasına yaz
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');
    
    return outputFile;
  }

  /**
   * Uploads klasörü yedeklemesi
   */
  private async backupUploads(backupPath: string, timestamp: string): Promise<string | null> {
    // Uploads klasörünün muhtemel konumları
    const possiblePaths = [
      path.join(this.rootDir, 'uploads'),
      path.join(this.rootDir, 'api', 'uploads'),
      path.join(this.rootDir, 'web', 'public', 'uploads'),
      path.join(this.rootDir, 'web', 'uploads'),
    ];

    let uploadsDir: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p) && fs.readdirSync(p).length > 0) {
        uploadsDir = p;
        break;
      }
    }

    if (!uploadsDir) {
      return null;
    }

    const outputFile = path.join(backupPath, `uploads_${timestamp}.zip`);
    
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputFile);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve(outputFile));
      archive.on('error', (err) => reject(err));

      archive.pipe(output);
      archive.directory(uploadsDir!, 'uploads');
      archive.finalize();
    });
  }

  /**
   * Site ayarları yedeklemesi (JSON)
   */
  private async backupSettings(backupPath: string, timestamp: string): Promise<string> {
    const outputFile = path.join(backupPath, `settings_${timestamp}.json`);
    
    const settings = await this.settingsService.getSettings();
    
    // Ek ayarlar da dahil et
    const fullSettings = {
      siteSettings: settings,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    fs.writeFileSync(outputFile, JSON.stringify(fullSettings, null, 2), 'utf8');
    
    return outputFile;
  }

  /**
   * Yedekleme listesini getir
   */
  async listBackups(): Promise<Array<{
    name: string;
    date: string;
    files: string[];
    totalSize: number;
  }>> {
    if (!fs.existsSync(this.backupDir)) {
      return [];
    }

    const backupFolders = fs.readdirSync(this.backupDir)
      .filter(f => f.startsWith('backup_'))
      .sort()
      .reverse();

    return backupFolders.map(folder => {
      const folderPath = path.join(this.backupDir, folder);
      const files = fs.readdirSync(folderPath);
      const totalSize = files.reduce((sum, file) => {
        return sum + this.getFileSize(path.join(folderPath, file));
      }, 0);

      // Timestamp'i folder adından çıkar
      const timestampMatch = folder.match(/backup_(\d{8}_\d{6})/);
      const date = timestampMatch 
        ? this.parseTimestamp(timestampMatch[1])
        : folder;

      return {
        name: folder,
        date,
        files,
        totalSize,
      };
    });
  }

  /**
   * Belirli bir yedeği indir
   */
  getBackupFilePath(backupName: string, fileName: string): string | null {
    const filePath = path.join(this.backupDir, backupName, fileName);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }

  /**
   * Tam yedekleme ZIP dosyasının yolunu döndür
   */
  getCompleteBackupPath(zipName: string): string | null {
    const filePath = path.join(this.backupDir, zipName);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }

  /**
   * Yedeği sil
   */
  async deleteBackup(backupName: string): Promise<boolean> {
    const backupPath = path.join(this.backupDir, backupName);
    if (fs.existsSync(backupPath)) {
      fs.rmSync(backupPath, { recursive: true, force: true });
      return true;
    }
    return false;
  }

  // Yardımcı metodlar
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString()
      .replace(/[-:]/g, '')
      .replace('T', '_')
      .substring(0, 15);
  }

  private parseTimestamp(timestamp: string): string {
    // 20260128_123456 -> 2026-01-28 12:34:56
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(9, 11);
    const min = timestamp.substring(11, 13);
    const sec = timestamp.substring(13, 15);
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
  }

  private getFileSize(filePath: string): number {
    try {
      return fs.statSync(filePath).size;
    } catch {
      return 0;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Geri yükleme rehberi oluştur
   */
  private generateRestoreGuide(): string {
    const timestamp = new Date().toISOString();
    return `# Yedek Geri Yükleme Rehberi

## Yedekleme Bilgileri
- Oluşturulma Tarihi: ${timestamp}
- Proje: ozcanaktasweb3

## Geri Yükleme Adımları

### 1. Dosyaları Çıkart
\`\`\`bash
# source_code_XXXXXXXX_XXXXXX.zip dosyasını çıkart
unzip source_code_*.zip -d ./ozcanaktasweb3
\`\`\`

### 2. .env Dosyalarını Kontrol Et
- \`api/.env\` dosyasının mevcut olduğundan emin olun
- \`web/.env\` dosyasının mevcut olduğundan emin olun
- DATABASE_URL'in doğru olduğunu kontrol edin

### 3. Bağımlılıkları Yükle
\`\`\`bash
# API için
cd api
npm install

# Web için
cd ../web
npm install
\`\`\`

### 4. Database'i Geri Yükle
\`\`\`bash
# SQL dosyası varsa
psql -h HOST -U USER -d DATABASE < database_*.sql

# JSON dosyası varsa, admin panelden import edin
\`\`\`

### 5. Prisma Client Oluştur
\`\`\`bash
cd api
npx prisma generate
npx prisma db push
\`\`\`

### 6. Uploads Klasörünü Geri Yükle
\`\`\`bash
unzip uploads_*.zip -d ./api/
\`\`\`

### 7. Projeyi Başlat
\`\`\`bash
# API (Terminal 1)
cd api
npm run start:dev

# Web (Terminal 2)
cd web
npm run dev
\`\`\`

## Olası Sorunlar ve Çözümler

### Eski Tema/Renk Görünüyorsa
1. Tarayıcı cache'ini temizleyin (Ctrl+Shift+Delete)
2. .next klasörünü silin ve yeniden build edin:
   \`\`\`bash
   cd web
   rm -rf .next
   npm run build
   npm run dev
   \`\`\`

### Database Bağlantı Hatası
1. PostgreSQL'in çalıştığından emin olun
2. DATABASE_URL'in doğru olduğunu kontrol edin
3. Docker kullanıyorsanız: \`docker-compose up -d db\`

### Port Çakışması
- API: 3001 portunu kullanır
- Web: 3000 portunu kullanır
- Bu portların boş olduğundan emin olun

## Dosya Listesi
- \`source_code_*.zip\` - Kaynak kodlar + .env dosyaları
- \`database_*.sql/json\` - Database yedeği
- \`uploads_*.zip\` - Yüklenen görseller
- \`settings_*.json\` - Site ayarları
`;
  }
}
