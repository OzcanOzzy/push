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
      const rootFiles = ['docker-compose.yml', '.gitignore', 'PROGRESS.md'];
      for (const file of rootFiles) {
        const filePath = path.join(this.rootDir, file);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: file });
        }
      }

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
}
