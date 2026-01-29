# OZCANAKTASWEB - YEDEKLEME VE KURULUM REHBERİ

> **Versiyon:** 1.0  
> **Tarih:** Ocak 2026  
> **Amaç:** Bu siteyi başka bir bilgisayarda birebir çalıştırmak için gerekli tüm adımlar

---

## 📋 İÇİNDEKİLER

1. [Yedeklenmesi Gereken Dosyalar](#1-yedeklenmesi-gereken-dosyalar)
2. [Hariç Tutulacak Dosyalar](#2-hariç-tutulacak-dosyalar)
3. [Gerekli Yazılımlar](#3-gerekli-yazılımlar)
4. [Yedekleme Adımları](#4-yedekleme-adımları)
5. [Yeni Bilgisayarda Kurulum](#5-yeni-bilgisayarda-kurulum)
6. [Database Restore](#6-database-restore)
7. [Çalıştırma Komutları](#7-çalıştırma-komutları)
8. [Sorun Giderme](#8-sorun-giderme)
9. [Hızlı Referans](#9-hızlı-referans)

---

## 1. YEDEKLENMESİ GEREKEN DOSYALAR

### ✅ KRİTİK DOSYALAR (MUTLAKA YEDEKLENMELİ)

| Dosya/Klasör | Konum | Açıklama |
|--------------|-------|----------|
| `api/` | `c:\ozcanaktasweb\api\` | Backend kaynak kodu (NestJS) |
| `web/` | `c:\ozcanaktasweb\web\` | Frontend kaynak kodu (Next.js) |
| `docker-compose.yml` | `c:\ozcanaktasweb\` | Database Docker ayarları |
| `.env` (api) | `c:\ozcanaktasweb\api\.env` | API çevre değişkenleri |
| `.env.local` (web) | `c:\ozcanaktasweb\web\.env.local` | Frontend çevre değişkenleri |
| `uploads/` | `c:\ozcanaktasweb\api\uploads\` | Yüklenen görseller |
| Database Dump | PostgreSQL export | Tüm veriler |

### 📁 DOSYA YAPISI

```
ozcanaktasweb/                    ← ANA KLASÖR
├── api/                          ← BACKEND (YEDEKLENMELİ)
│   ├── prisma/                   ← Database şeması
│   │   └── schema.prisma         ← ÖNEMLI: Tablo yapıları
│   ├── src/                      ← Kaynak kodlar
│   ├── uploads/                  ← Yüklenen görseller (YEDEKLENMELİ)
│   ├── package.json              ← Bağımlılıklar
│   └── .env                      ← GİZLİ AYARLAR (YEDEKLENMELİ)
│
├── web/                          ← FRONTEND (YEDEKLENMELİ)
│   ├── app/                      ← Sayfalar ve componentler
│   ├── lib/                      ← Yardımcı fonksiyonlar
│   ├── public/                   ← Statik dosyalar
│   ├── package.json              ← Bağımlılıklar
│   └── .env.local                ← GİZLİ AYARLAR (YEDEKLENMELİ)
│
├── docker-compose.yml            ← Database ayarları (YEDEKLENMELİ)
└── backups/                      ← Mevcut yedekler
```

---

## 2. HARİÇ TUTULACAK DOSYALAR

### ❌ YEDEKLENMEMESİ GEREKEN KLASÖRLER

Bu klasörler `npm install` ve `npm run build` komutlarıyla otomatik oluşturulur:

| Klasör | Neden Hariç? |
|--------|--------------|
| `node_modules/` | `npm install` ile yeniden yüklenir (çok büyük, ~500MB) |
| `.next/` | `npm run build` ile yeniden oluşturulur |
| `dist/` | API build çıktısı, `npm run build` ile oluşur |
| `.turbo/` | Cache dosyaları |

### 💾 YEDEK BOYUTU KARŞILAŞTIRMASI

| Yedekleme Türü | Yaklaşık Boyut |
|----------------|----------------|
| Sadece kaynak kod | ~50-100 MB |
| Kaynak kod + Database | ~100-200 MB |
| Kaynak kod + Database + Uploads | ~200-500 MB |
| HERŞEYİ dahil (node_modules ile) | ~1-2 GB (ÖNERİLMEZ) |

---

## 3. GEREKLİ YAZILIMLAR

Yeni bilgisayarda şunların kurulu olması gerekir:

### 3.1 Node.js (Zorunlu)

```
Versiyon: 18.x veya üzeri (önerilen: 20.x)
İndirme: https://nodejs.org/
```

**Kurulum kontrolü:**
```powershell
node --version
# Çıktı: v20.x.x olmalı

npm --version
# Çıktı: 10.x.x olmalı
```

### 3.2 Docker Desktop (Zorunlu - Database için)

```
İndirme: https://www.docker.com/products/docker-desktop/
```

**Kurulum kontrolü:**
```powershell
docker --version
# Çıktı: Docker version 24.x.x

docker-compose --version
# Çıktı: Docker Compose version v2.x.x
```

### 3.3 Git (İsteğe Bağlı - Versiyon kontrolü için)

```
İndirme: https://git-scm.com/
```

### 3.4 Visual Studio Code veya Cursor (Önerilen)

```
VS Code: https://code.visualstudio.com/
Cursor: https://cursor.sh/
```

---

## 4. YEDEKLEME ADIMLARI

### ADIM 1: Database Yedeği Alma

**PowerShell'de çalıştırın:**

```powershell
# Docker container adını kontrol et
docker ps

# Database yedeği al (container adı: ozcanaktasweb-postgres)
docker exec ozcanaktasweb-postgres pg_dump -U postgres ozcanaktasweb > database_backup.sql
```

**Alternatif (pgAdmin ile):**
1. pgAdmin'i açın
2. `ozcanaktasweb` database'ine sağ tıklayın
3. Backup > Format: Plain > Kaydet

### ADIM 2: Kaynak Kod Yedeği

**PowerShell'de çalıştırın:**

```powershell
# Proje klasörüne git
cd c:\ozcanaktasweb

# Gereksiz klasörleri hariç tutarak ZIP oluştur
# Robocopy ile geçici klasöre kopyala
$tempDir = "C:\temp\ozcanaktasweb-backup"
New-Item -ItemType Directory -Force -Path $tempDir

# Kaynak kodu kopyala (node_modules, .next, dist hariç)
robocopy "c:\ozcanaktasweb\api" "$tempDir\api" /E /XD node_modules dist .turbo
robocopy "c:\ozcanaktasweb\web" "$tempDir\web" /E /XD node_modules .next .turbo
Copy-Item "c:\ozcanaktasweb\docker-compose.yml" "$tempDir\"

# ZIP oluştur
$date = Get-Date -Format "yyyyMMdd_HHmmss"
Compress-Archive -Path "$tempDir\*" -DestinationPath "c:\ozcanaktasweb\backups\ozcanaktasweb-backup-$date.zip"

# Geçici klasörü sil
Remove-Item -Recurse -Force $tempDir
```

### ADIM 3: Uploads Klasörünü Yedekle

```powershell
# Uploads klasörünü ayrı ZIP yap
Compress-Archive -Path "c:\ozcanaktasweb\api\uploads" -DestinationPath "c:\ozcanaktasweb\backups\uploads-backup.zip"
```

### ADIM 4: .env Dosyalarını Yedekle

```powershell
# .env dosyalarını güvenli bir yere kopyala
Copy-Item "c:\ozcanaktasweb\api\.env" "c:\ozcanaktasweb\backups\api.env.backup"
Copy-Item "c:\ozcanaktasweb\web\.env.local" "c:\ozcanaktasweb\backups\web.env.backup"
```

### 📦 TAM YEDEK PAKETİ

Sonunda şu dosyalara sahip olmalısınız:

```
backups/
├── ozcanaktasweb-backup-YYYYMMDD_HHMMSS.zip  ← Kaynak kod
├── database_backup.sql                        ← Database
├── uploads-backup.zip                         ← Görseller
├── api.env.backup                             ← API ayarları
└── web.env.backup                             ← Web ayarları
```

---

## 5. YENİ BİLGİSAYARDA KURULUM

### ADIM 1: Dosyaları Kopyala

```powershell
# Ana klasörü oluştur
New-Item -ItemType Directory -Force -Path "c:\ozcanaktasweb"

# ZIP dosyasını çıkart
Expand-Archive -Path "ozcanaktasweb-backup-XXXXXX.zip" -DestinationPath "c:\ozcanaktasweb"

# Uploads klasörünü çıkart
Expand-Archive -Path "uploads-backup.zip" -DestinationPath "c:\ozcanaktasweb\api\"
```

### ADIM 2: .env Dosyalarını Oluştur

**API için (`c:\ozcanaktasweb\api\.env`):**

```env
# Database bağlantısı
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ozcanaktasweb?schema=public"

# JWT ayarları
JWT_SECRET="gizli-anahtar-buraya-yazin"
JWT_EXPIRES_IN="1d"

# Server ayarları
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

**Web için (`c:\ozcanaktasweb\web\.env.local`):**

```env
# API adresi
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### ADIM 3: Docker ile Database'i Başlat

```powershell
# Proje klasörüne git
cd c:\ozcanaktasweb

# Docker container'ı başlat
docker-compose up -d

# Kontrol et
docker ps
# ozcanaktasweb-postgres görünmeli
```

### ADIM 4: npm Paketlerini Yükle

```powershell
# API paketlerini yükle
cd c:\ozcanaktasweb\api
npm install

# Web paketlerini yükle
cd c:\ozcanaktasweb\web
npm install
```

**⏱️ Bu adım 5-10 dakika sürebilir!**

### ADIM 5: Prisma Client Oluştur

```powershell
cd c:\ozcanaktasweb\api

# Prisma client'ı oluştur
npx prisma generate

# Database şemasını uygula
npx prisma db push
```

---

## 6. DATABASE RESTORE

### ADIM 1: Database'in Boş Olduğundan Emin Ol

```powershell
# Docker'ın çalıştığından emin ol
docker ps

# Eğer eski veri varsa sil ve yeniden oluştur (DİKKAT!)
docker exec ozcanaktasweb-postgres psql -U postgres -c "DROP DATABASE IF EXISTS ozcanaktasweb;"
docker exec ozcanaktasweb-postgres psql -U postgres -c "CREATE DATABASE ozcanaktasweb;"
```

### ADIM 2: Yedeği Geri Yükle

```powershell
# SQL dosyasını container'a kopyala
docker cp database_backup.sql ozcanaktasweb-postgres:/tmp/

# Yedeği geri yükle
docker exec ozcanaktasweb-postgres psql -U postgres -d ozcanaktasweb -f /tmp/database_backup.sql
```

### ADIM 3: Kontrol Et

```powershell
# Tabloları listele
docker exec ozcanaktasweb-postgres psql -U postgres -d ozcanaktasweb -c "\dt"

# Kayıt sayılarını kontrol et
docker exec ozcanaktasweb-postgres psql -U postgres -d ozcanaktasweb -c "SELECT COUNT(*) FROM \"Listing\";"
```

---

## 7. ÇALIŞTIRMA KOMUTLARI

### 7.1 Geliştirme Modu (Development)

**Terminal 1 - API:**
```powershell
cd c:\ozcanaktasweb\api
npm run start:dev
# API http://localhost:3001 adresinde çalışır
```

**Terminal 2 - Web:**
```powershell
cd c:\ozcanaktasweb\web
npm run dev
# Web http://localhost:3000 adresinde çalışır
```

### 7.2 Production Modu

**API:**
```powershell
cd c:\ozcanaktasweb\api
npm run build
npm run start:prod
```

**Web:**
```powershell
cd c:\ozcanaktasweb\web
npm run build
npm run start
```

### 7.3 Tüm Servisleri Başlatma Sırası

```
1. Docker Desktop'ı aç
2. docker-compose up -d (database başlar)
3. API'yi başlat (npm run start:dev)
4. Web'i başlat (npm run dev)
```

### 7.4 Portlar

| Servis | Port | URL |
|--------|------|-----|
| Web (Frontend) | 3000 | http://localhost:3000 |
| API (Backend) | 3001 | http://localhost:3001 |
| PostgreSQL | 5432 | localhost:5432 |

---

## 8. SORUN GİDERME

### ❌ "npm install" hatası

```powershell
# Node modules'ı temizle ve tekrar dene
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### ❌ "Database connection refused" hatası

```powershell
# Docker'ın çalıştığını kontrol et
docker ps

# Container'ı yeniden başlat
docker-compose down
docker-compose up -d
```

### ❌ "Prisma generate" hatası

```powershell
# Prisma'yı yeniden yükle
npm install prisma @prisma/client
npx prisma generate
```

### ❌ "Port already in use" hatası

```powershell
# 3000 veya 3001 portunu kullanan işlemi bul ve kapat
netstat -ano | findstr :3001
taskkill /PID <PID_NUMARASI> /F
```

### ❌ ".env dosyası bulunamadı" hatası

.env dosyasının doğru konumda olduğundan emin olun:
- API: `c:\ozcanaktasweb\api\.env`
- Web: `c:\ozcanaktasweb\web\.env.local`

### ❌ "CORS error" hatası

API `.env` dosyasında CORS_ORIGIN değerini kontrol edin:
```env
CORS_ORIGIN="http://localhost:3000"
```

---

## 9. HIZLI REFERANS

### 📋 YEDEKLEME CHECKLIST

- [ ] Database yedeği alındı (`database_backup.sql`)
- [ ] Kaynak kod ZIP'lendi (node_modules hariç)
- [ ] Uploads klasörü yedeklendi
- [ ] `.env` dosyaları yedeklendi
- [ ] `docker-compose.yml` dahil edildi

### 📋 KURULUM CHECKLIST

- [ ] Node.js kuruldu (v18+)
- [ ] Docker Desktop kuruldu
- [ ] Dosyalar çıkartıldı
- [ ] `.env` dosyaları oluşturuldu
- [ ] Docker container başlatıldı
- [ ] `npm install` çalıştırıldı (her iki klasörde)
- [ ] `npx prisma generate` çalıştırıldı
- [ ] Database restore edildi
- [ ] API başlatıldı (port 3001)
- [ ] Web başlatıldı (port 3000)

### 🔑 ÖNEMLİ DOSYALAR

| Dosya | Konum | Amaç |
|-------|-------|------|
| `schema.prisma` | `api/prisma/` | Database tablo yapıları |
| `globals.css` | `web/app/` | Tüm CSS stilleri |
| `layout.tsx` | `web/app/` | SEO ve genel ayarlar |
| `page.tsx` | `web/app/` | Ana sayfa |
| `main.ts` | `api/src/` | API başlangıç noktası |

### 🌐 VARSAYILAN GİRİŞ BİLGİLERİ

```
URL: http://localhost:3000/admin/login
Kullanıcı: admin@example.com
Şifre: (database'de kayıtlı)
```

---

## 📞 DESTEK

Bu dokümantasyon, projeyi başka bir bilgisayara taşımak için gereken tüm bilgileri içerir.

Ek sorular için proje klasöründeki diğer dokümantasyon dosyalarına bakın:
- `PROJE_DOKUMANTASYONU.md` - Detaylı proje yapısı
- `project_notes/README.md` - Proje notları

---

**Son Güncelleme:** Ocak 2026
