# OZCANAKTASWEB - KOMPLE PROJE DOKÜMANTASYONU

> **Versiyon:** 1.0  
> **Tarih:** Ocak 2026  
> **Amaç:** Projeyi hiç bilmeyen birinin öğrenebileceği detaylı teknik dokümantasyon

---

# 📋 İÇİNDEKİLER (BAŞLIK LİSTESİ)

## BÖLÜM 1: GENEL BAKIŞ
- [1.1 Proje Hakkında](#11-proje-hakkında)
- [1.2 Teknoloji Yığını](#12-teknoloji-yığını)
- [1.3 Proje Yapısı](#13-proje-yapısı)

## BÖLÜM 2: BACKEND (API)
- [2.1 API Klasör Yapısı](#21-api-klasör-yapısı)
- [2.2 Modüller Detaylı](#22-modüller-detaylı)
- [2.3 API Endpoint'leri](#23-api-endpointleri)
- [2.4 Çevre Değişkenleri](#24-çevre-değişkenleri)

## BÖLÜM 3: FRONTEND (WEB)
- [3.1 Web Klasör Yapısı](#31-web-klasör-yapısı)
- [3.2 Sayfalar](#32-sayfalar)
- [3.3 Componentler](#33-componentler)
- [3.4 Layout ve Metadata](#34-layout-ve-metadata)

## BÖLÜM 4: CSS VE TASARIM
- [4.1 CSS Değişkenleri](#41-css-değişkenleri)
- [4.2 Header (Üst Bar)](#42-header-üst-bar)
- [4.3 Logo Alanı](#43-logo-alanı)
- [4.4 Sosyal Medya İkonları](#44-sosyal-medya-i̇konları)
- [4.5 Arama Barı](#45-arama-barı)
- [4.6 Banner/Hero](#46-bannerhero)
- [4.7 Şube Butonları](#47-şube-butonları)
- [4.8 Aksiyon Butonları](#48-aksiyon-butonları)
- [4.9 İlan Kartları](#49-i̇lan-kartları)
- [4.10 Footer](#410-footer)
- [4.11 Mobil Ayarlar](#411-mobil-ayarlar)
- [4.12 Admin Panel](#412-admin-panel)

## BÖLÜM 5: DATABASE
- [5.1 Tablo Listesi](#51-tablo-listesi)
- [5.2 SiteSetting Tablosu](#52-sitesetting-tablosu)
- [5.3 Diğer Tablolar](#53-diğer-tablolar)
- [5.4 İlişkiler](#54-i̇lişkiler)

## BÖLÜM 6: ADMIN PANEL
- [6.1 Admin Sayfaları](#61-admin-sayfaları)
- [6.2 Admin Ayarları](#62-admin-ayarları)

## BÖLÜM 7: ÖZEL KONULAR
- [7.1 Authentication](#71-authentication)
- [7.2 Dosya Yükleme](#72-dosya-yükleme)
- [7.3 SEO](#73-seo)
- [7.4 Mobil Uyumluluk](#74-mobil-uyumluluk)

## BÖLÜM 8: SORUN GİDERME
- [8.1 Sık Karşılaşılan Hatalar](#81-sık-karşılaşılan-hatalar)
- [8.2 Debug İpuçları](#82-debug-i̇puçları)

---

# BÖLÜM 1: GENEL BAKIŞ

## 1.1 Proje Hakkında

**Proje Adı:** ozcanaktasweb  
**Tür:** Emlak Web Sitesi  
**Özellikler:**
- İlan yönetimi (satılık, kiralık, fırsat)
- Şube/şehir bazlı listeleme
- Danışman yönetimi
- Admin paneli ile tam kontrol
- Mobil uyumlu tasarım
- SEO optimize

## 1.2 Teknoloji Yığını

| Katman | Teknoloji | Versiyon | Açıklama |
|--------|-----------|----------|----------|
| Frontend | Next.js | 16.1.4 | React tabanlı web framework |
| Frontend | React | 19.2.3 | UI library |
| Backend | NestJS | 11.0.1 | Node.js backend framework |
| Database | PostgreSQL | 16 | İlişkisel veritabanı |
| ORM | Prisma | 7.3.0 | Database toolkit |
| Container | Docker | - | Database için |
| Styling | CSS | - | globals.css dosyası |
| Maps | Leaflet | 1.9.4 | Harita entegrasyonu |
| Auth | JWT | - | Token tabanlı kimlik doğrulama |

## 1.3 Proje Yapısı

```
c:\ozcanaktasweb\
│
├── api\                          # BACKEND (NestJS)
│   ├── prisma\                   # Database şeması ve migration'lar
│   │   ├── schema.prisma         # ÖNEMLİ: Tüm tablo tanımları
│   │   ├── migrations\           # Database değişiklik geçmişi
│   │   └── seed.ts               # Başlangıç verileri
│   ├── src\                      # Kaynak kodlar
│   │   ├── app.module.ts         # Ana modül
│   │   ├── main.ts               # Başlangıç noktası
│   │   ├── auth\                 # Kimlik doğrulama
│   │   ├── listings\             # İlan işlemleri
│   │   ├── settings\             # Site ayarları
│   │   └── [diğer modüller]\     # Her özellik için modül
│   ├── uploads\                  # Yüklenen dosyalar
│   ├── package.json              # Bağımlılıklar
│   └── .env                      # Gizli ayarlar
│
├── web\                          # FRONTEND (Next.js)
│   ├── app\                      # Sayfalar ve componentler
│   │   ├── page.tsx              # Ana sayfa
│   │   ├── layout.tsx            # Genel layout
│   │   ├── globals.css           # ÖNEMLİ: Tüm stiller
│   │   ├── admin\                # Admin paneli sayfaları
│   │   ├── components\           # Ortak componentler
│   │   └── [sayfa klasörleri]\   # Her sayfa için klasör
│   ├── lib\                      # Yardımcı fonksiyonlar
│   │   ├── api.ts                # API çağrıları
│   │   └── settings.ts           # Ayar tipleri
│   ├── public\                   # Statik dosyalar
│   ├── package.json              # Bağımlılıklar
│   └── .env.local                # Gizli ayarlar
│
├── docker-compose.yml            # Database container ayarları
├── backups\                      # Yedek dosyaları
└── project_notes\                # Proje notları
```

---

# BÖLÜM 2: BACKEND (API)

## 2.1 API Klasör Yapısı

**KONUM:** `c:\ozcanaktasweb\api\`

### Kök Dosyalar

| Dosya | Ne İşe Yarar? |
|-------|---------------|
| `package.json` | Paketler ve npm komutları |
| `tsconfig.json` | TypeScript ayarları |
| `nest-cli.json` | NestJS CLI ayarları |
| `.env` | Çevre değişkenleri (GİZLİ) |
| `prisma.config.ts` | Prisma yapılandırması |

### src/ Klasörü

```
api/src/
├── main.ts                 # Uygulama başlangıcı
├── app.module.ts           # Ana modül (tüm modülleri birleştirir)
├── app.controller.ts       # Ana controller (health check)
├── app.service.ts          # Ana servis
│
├── prisma/                 # Database bağlantısı
│   ├── prisma.module.ts
│   └── prisma.service.ts   # Prisma client
│
├── auth/                   # Kimlik doğrulama modülü
├── listings/               # İlan modülü
├── settings/               # Site ayarları modülü
├── banners/                # Banner modülü
├── branches/               # Şube modülü
├── cities/                 # Şehir modülü
├── districts/              # İlçe modülü
├── neighborhoods/          # Mahalle modülü
├── consultants/            # Danışman modülü
├── requests/               # Talep modülü
├── city-buttons/           # Şehir butonları modülü
├── action-buttons/         # Aksiyon butonları modülü
├── menu-items/             # Menü modülü
├── footer-items/           # Footer modülü
├── social-links/           # Sosyal medya modülü
├── listing-labels/         # İlan etiketleri modülü
├── listing-attributes/     # İlan özellikleri modülü
├── pages/                  # Dinamik sayfalar modülü
├── blog/                   # Blog modülü
├── page-design/            # Sayfa tasarım modülü
├── backup/                 # Yedekleme modülü
│
├── middleware/             # Ara katman yazılımları
│   └── request-logger.middleware.ts
│
└── shared/                 # Paylaşılan kodlar
    ├── decorators/         # Özel decorator'lar
    └── types/              # Tip tanımları
```

## 2.2 Modüller Detaylı

### Her Modülün Yapısı

Her modül 3 ana dosyadan oluşur:

```
modül-adı/
├── modül-adı.module.ts     # Modül tanımı
├── modül-adı.controller.ts # HTTP endpoint'leri
├── modül-adı.service.ts    # İş mantığı
└── dto/                    # Veri transfer objeleri (opsiyonel)
    ├── create-xxx.dto.ts
    └── update-xxx.dto.ts
```

---

### 2.2.1 AUTH MODÜLÜ (Kimlik Doğrulama)

**KONUM:** `api/src/auth/`

**NE İŞE YARAR:** Kullanıcı girişi ve yetkilendirme

**DOSYALAR:**
```
auth/
├── auth.module.ts          # Modül tanımı
├── auth.controller.ts      # Login endpoint
├── auth.service.ts         # Giriş işlemleri
├── jwt.strategy.ts         # JWT doğrulama stratejisi
├── dto/
│   └── login.dto.ts        # Giriş form verisi
└── guards/
    ├── jwt-auth.guard.ts   # JWT kontrolü
    └── roles.guard.ts      # Rol kontrolü
```

**API ENDPOINT'LERİ:**

| Method | URL | Açıklama | Yetki |
|--------|-----|----------|-------|
| POST | `/auth/login` | Kullanıcı girişi | Herkese açık |

**ÖRNEK KULLANIM:**
```javascript
// Giriş isteği
fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'şifre123'
  })
})

// Cevap
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "xxx",
    "email": "admin@example.com",
    "name": "Admin",
    "role": "ADMIN"
  }
}
```

---

### 2.2.2 LISTINGS MODÜLÜ (İlanlar)

**KONUM:** `api/src/listings/`

**NE İŞE YARAR:** İlan ekleme, düzenleme, silme, listeleme

**API ENDPOINT'LERİ:**

| Method | URL | Açıklama | Yetki |
|--------|-----|----------|-------|
| GET | `/listings` | İlanları listele | Herkese açık |
| GET | `/listings/:id` | Tek ilan getir | Herkese açık |
| POST | `/listings` | Yeni ilan ekle | JWT gerekli |
| PATCH | `/listings/:id` | İlan güncelle | JWT gerekli |
| DELETE | `/listings/:id` | İlan sil | JWT gerekli |
| POST | `/listings/:id/images/upload` | Görsel yükle | JWT gerekli |

**FİLTRE PARAMETRELERİ:**
```
GET /listings?status=active&category=sale&citySlug=konya&minPrice=100000&maxPrice=500000
```

| Parametre | Açıklama | Örnek |
|-----------|----------|-------|
| `status` | İlan durumu | `active`, `draft`, `sold` |
| `category` | Kategori | `sale`, `rent` |
| `citySlug` | Şehir slug | `konya`, `istanbul` |
| `branchId` | Şube ID | `cuid...` |
| `minPrice` | Min fiyat | `100000` |
| `maxPrice` | Max fiyat | `500000` |
| `isOpportunity` | Fırsat mı? | `true`, `false` |
| `take` | Kaç adet? | `10` |
| `skip` | Kaç atlansın? | `0` |
| `q` | Arama | `daire` |

---

### 2.2.3 SETTINGS MODÜLÜ (Site Ayarları)

**KONUM:** `api/src/settings/`

**NE İŞE YARAR:** Site geneli ayarları (renkler, logo, footer, mobil vb.)

**API ENDPOINT'LERİ:**

| Method | URL | Açıklama | Yetki |
|--------|-----|----------|-------|
| GET | `/settings` | Ayarları getir | Herkese açık |
| PATCH | `/settings` | Ayarları güncelle | JWT + ADMIN/MANAGER |
| POST | `/settings/upload` | Görsel yükle | JWT + ADMIN/MANAGER |

**ÖNEMLİ:** SiteSetting tablosu 150+ alan içerir. Detayları DATABASE bölümünde.

---

### 2.2.4 BANNERS MODÜLÜ

**KONUM:** `api/src/banners/`

**API ENDPOINT'LERİ:**

| Method | URL | Açıklama | Yetki |
|--------|-----|----------|-------|
| GET | `/banners` | Aktif banner'ları getir | Herkese açık |
| GET | `/banners/admin` | Tüm banner'ları getir | JWT + ADMIN |
| POST | `/banners` | Banner ekle | JWT + ADMIN |
| PATCH | `/banners/:id` | Banner güncelle | JWT + ADMIN |
| DELETE | `/banners/:id` | Banner sil | JWT + ADMIN |

---

### 2.2.5 CITY-BUTTONS MODÜLÜ (Şehir Butonları)

**KONUM:** `api/src/city-buttons/`

**NE İŞE YARAR:** Ana sayfadaki şehir/şube butonları

**API ENDPOINT'LERİ:**

| Method | URL | Açıklama | Yetki |
|--------|-----|----------|-------|
| GET | `/city-buttons` | Aktif butonları getir | Herkese açık |
| GET | `/city-buttons/admin` | Tüm butonları getir | JWT + ADMIN |
| POST | `/city-buttons` | Buton ekle | JWT + ADMIN |
| POST | `/city-buttons/upload` | Görsel yükle | JWT + ADMIN |
| POST | `/city-buttons/reorder` | Sıralama değiştir | JWT + ADMIN |
| PATCH | `/city-buttons/:id` | Buton güncelle | JWT + ADMIN |
| DELETE | `/city-buttons/:id` | Buton sil | JWT + ADMIN |

---

### 2.2.6 DİĞER MODÜLLER

Aynı yapıda diğer modüller:

| Modül | URL Prefix | Açıklama |
|-------|------------|----------|
| `action-buttons` | `/action-buttons` | Ana sayfa aksiyon butonları |
| `branches` | `/branches` | Şube yönetimi |
| `cities` | `/cities` | Şehir yönetimi |
| `districts` | `/districts` | İlçe yönetimi |
| `neighborhoods` | `/neighborhoods` | Mahalle yönetimi |
| `consultants` | `/consultants` | Danışman yönetimi |
| `requests` | `/requests` | Müşteri/danışman talepleri |
| `menu-items` | `/menu-items` | Menü yönetimi |
| `footer-items` | `/footer-items` | Footer içerikleri |
| `social-links` | `/social-links` | Sosyal medya linkleri |
| `listing-labels` | `/listing-labels` | İlan etiketleri |
| `listing-attributes` | `/listing-attributes` | İlan özellikleri |
| `pages` | `/pages` | Dinamik sayfalar |
| `blog` | `/blog` | Blog yazıları |
| `page-design` | `/page-design` | Sayfa tasarımları |
| `backup` | `/admin/backup` | Yedekleme işlemleri |

## 2.3 API Endpoint'leri

### Tam Liste

**AUTH:**
```
POST   /auth/login                 # Giriş yap
```

**LISTINGS:**
```
GET    /listings                   # İlanları listele
GET    /listings/:id               # Tek ilan getir
POST   /listings                   # İlan ekle
PATCH  /listings/:id               # İlan güncelle
DELETE /listings/:id               # İlan sil
POST   /listings/:id/images        # Görsel URL ekle
POST   /listings/:id/images/upload # Görsel yükle
POST   /listings/:id/images/upload-many  # Çoklu görsel yükle
PATCH  /listings/:id/images/:imageId/cover  # Kapak yap
DELETE /listings/:id/images/:imageId       # Görsel sil
```

**SETTINGS:**
```
GET    /settings                   # Ayarları getir
PATCH  /settings                   # Ayarları güncelle
POST   /settings/upload            # Görsel yükle
```

**BANNERS:**
```
GET    /banners                    # Aktif banner'lar
GET    /banners/admin              # Tüm banner'lar (admin)
GET    /banners/:id                # Tek banner
POST   /banners                    # Banner ekle
PATCH  /banners/:id                # Banner güncelle
DELETE /banners/:id                # Banner sil
```

**CITY-BUTTONS:**
```
GET    /city-buttons               # Aktif butonlar
GET    /city-buttons/admin         # Tüm butonlar (admin)
GET    /city-buttons/:id           # Tek buton
POST   /city-buttons               # Buton ekle
POST   /city-buttons/upload        # Görsel yükle
POST   /city-buttons/reorder       # Sıralama
PATCH  /city-buttons/:id           # Buton güncelle
DELETE /city-buttons/:id           # Buton sil
```

**ACTION-BUTTONS:**
```
GET    /action-buttons             # Aktif butonlar
GET    /action-buttons/admin       # Tüm butonlar (admin)
POST   /action-buttons             # Buton ekle
POST   /action-buttons/upload      # Görsel yükle
PATCH  /action-buttons/:id         # Buton güncelle
DELETE /action-buttons/:id         # Buton sil
```

**BRANCHES:**
```
GET    /branches                   # Şubeleri listele
POST   /branches                   # Şube ekle
PATCH  /branches/:id               # Şube güncelle
DELETE /branches/:id               # Şube sil
```

**CITIES:**
```
GET    /cities                     # Şehirleri listele
POST   /cities                     # Şehir ekle
POST   /cities/import/tr           # Türkiye şehirlerini import et
PATCH  /cities/:id                 # Şehir güncelle
DELETE /cities/:id                 # Şehir sil
```

**DISTRICTS:**
```
GET    /districts                  # İlçeleri listele (?cityId=xxx)
```

**NEIGHBORHOODS:**
```
GET    /neighborhoods              # Mahalleleri listele (?districtId=xxx)
```

**CONSULTANTS:**
```
GET    /consultants                # Danışmanları listele
POST   /consultants                # Danışman ekle
PATCH  /consultants/:id            # Danışman güncelle
DELETE /consultants/:id            # Danışman sil
```

**REQUESTS:**
```
POST   /requests/customer          # Müşteri talebi ekle (herkese açık)
GET    /requests/customer          # Müşteri taleplerini listele
POST   /requests/consultant        # Danışman talebi ekle
GET    /requests/consultant        # Danışman taleplerini listele
PATCH  /requests/customer/:id/status   # Talep durumu güncelle
PATCH  /requests/consultant/:id/status # Talep durumu güncelle
```

**MENU-ITEMS:**
```
GET    /menu-items                 # Aktif menü öğeleri
GET    /menu-items/admin           # Tüm menü öğeleri
POST   /menu-items                 # Menü öğesi ekle
POST   /menu-items/reorder         # Sıralama
PATCH  /menu-items/:id             # Menü güncelle
DELETE /menu-items/:id             # Menü sil
```

**FOOTER-ITEMS:**
```
GET    /footer-items               # Aktif footer öğeleri
GET    /footer-items/admin         # Tüm footer öğeleri
POST   /footer-items               # Footer öğesi ekle
POST   /footer-items/reorder       # Sıralama
PATCH  /footer-items/:id           # Footer güncelle
DELETE /footer-items/:id           # Footer sil
```

**SOCIAL-LINKS:**
```
GET    /social-links               # Aktif sosyal linkler
GET    /social-links/admin         # Tüm sosyal linkler
POST   /social-links               # Link ekle
POST   /social-links/reorder       # Sıralama
PATCH  /social-links/:id           # Link güncelle
DELETE /social-links/:id           # Link sil
```

**LISTING-LABELS:**
```
GET    /listing-labels             # Aktif etiketler
GET    /listing-labels/admin       # Tüm etiketler
POST   /listing-labels             # Etiket ekle
POST   /listing-labels/reorder     # Sıralama
PATCH  /listing-labels/:id         # Etiket güncelle
DELETE /listing-labels/:id         # Etiket sil
```

**LISTING-ATTRIBUTES:**
```
GET    /listing-attributes         # Özellik tanımları (?category=sale)
POST   /listing-attributes         # Özellik ekle
PATCH  /listing-attributes/:id     # Özellik güncelle
DELETE /listing-attributes/:id     # Özellik sil
```

**PAGES:**
```
GET    /pages                      # Yayınlanan sayfalar
GET    /pages/admin/all            # Tüm sayfalar
GET    /pages/slug/:slug           # Slug ile getir
GET    /pages/:id                  # ID ile getir
POST   /pages                      # Sayfa ekle
PATCH  /pages/:id                  # Sayfa güncelle
DELETE /pages/:id                  # Sayfa sil
```

**BLOG:**
```
GET    /blog                       # Yayınlanan yazılar
GET    /blog/admin/all             # Tüm yazılar
GET    /blog/slug/:slug            # Slug ile getir
POST   /blog                       # Yazı ekle
POST   /blog/upload                # Görsel yükle
PATCH  /blog/:id                   # Yazı güncelle
DELETE /blog/:id                   # Yazı sil
```

**PAGE-DESIGN:**
```
GET    /page-design                # Tüm tasarımlar
GET    /page-design/:pageType      # Sayfa tasarımı getir
POST   /page-design/:pageType      # Tasarım kaydet
DELETE /page-design/:pageType      # Tasarım sil
```

**BACKUP:**
```
POST   /admin/backup/full          # Tam yedek al
POST   /admin/backup/selective     # Seçili yedek al
GET    /admin/backup/list          # Yedekleri listele
GET    /admin/backup/download/:name/:file  # Yedek indir
DELETE /admin/backup/:name         # Yedek sil
```

## 2.4 Çevre Değişkenleri

**DOSYA:** `api/.env`

```env
# DATABASE - PostgreSQL bağlantısı
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ozcanaktasweb?schema=public"

# JWT - Token ayarları
JWT_SECRET="cok-gizli-bir-anahtar-buraya"
JWT_EXPIRES_IN="1d"

# SERVER - Sunucu ayarları
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `DATABASE_URL` | PostgreSQL bağlantı URL'i | Zorunlu |
| `JWT_SECRET` | Token şifreleme anahtarı | `dev-secret` |
| `JWT_EXPIRES_IN` | Token geçerlilik süresi | `1d` |
| `PORT` | API portu | `3001` |
| `CORS_ORIGIN` | İzin verilen frontend URL | `http://localhost:3000` |

---

# BÖLÜM 3: FRONTEND (WEB)

## 3.1 Web Klasör Yapısı

**KONUM:** `c:\ozcanaktasweb\web\`

```
web/
├── app/                          # Sayfalar ve componentler
│   ├── page.tsx                  # Ana sayfa (/)
│   ├── layout.tsx                # Genel layout
│   ├── globals.css               # TÜM STİLLER (ÖNEMLİ!)
│   ├── favicon.ico               # Site ikonu
│   ├── robots.ts                 # SEO - robots.txt
│   ├── sitemap.ts                # SEO - sitemap.xml
│   │
│   ├── components/               # Ortak componentler
│   │   ├── CorporateHeader.tsx   # Üst bar
│   │   ├── CorporateFooter.tsx   # Alt bar
│   │   ├── ListingsMap.tsx       # Harita
│   │   ├── LocationPicker.tsx    # Konum seçici
│   │   ├── SettingsProvider.tsx  # Ayar context'i
│   │   └── PageWrapper.tsx       # Sayfa sarmalayıcı
│   │
│   ├── [city]/                   # Dinamik şehir sayfaları
│   │   └── page.tsx              # /konya, /istanbul vb.
│   │
│   ├── admin/                    # Admin paneli (24 sayfa)
│   │   ├── page.tsx              # Admin ana sayfa
│   │   ├── login/page.tsx        # Giriş sayfası
│   │   ├── settings/page.tsx     # Site ayarları
│   │   ├── listings/page.tsx     # İlan yönetimi
│   │   └── [...diğerleri]
│   │
│   ├── arama/page.tsx            # Arama sayfası
│   ├── firsatlar/page.tsx        # Fırsatlar sayfası
│   ├── hakkimizda/page.tsx       # Hakkımızda sayfası
│   ├── iletisim/page.tsx         # İletişim sayfası
│   ├── subeler/page.tsx          # Şubeler sayfası
│   │
│   ├── listings/                 # İlan detay
│   │   └── [id]/page.tsx         # /listings/xxx
│   │
│   └── requests/                 # Talep formları
│       ├── customer/page.tsx     # Müşteri talep formu
│       └── consultant/page.tsx   # Danışman talep formu
│
├── lib/                          # Yardımcı fonksiyonlar
│   ├── api.ts                    # API çağrıları
│   ├── settings.ts               # Ayar tipleri
│   └── listings.ts               # İlan yardımcıları
│
├── public/                       # Statik dosyalar
│   ├── logo.png                  # Logo
│   ├── profile.png               # Profil resmi
│   └── [...svg dosyaları]
│
├── package.json                  # Paketler
├── next.config.ts                # Next.js ayarları
├── tsconfig.json                 # TypeScript ayarları
└── .env.local                    # Çevre değişkenleri
```

## 3.2 Sayfalar

### 3.2.1 Ana Sayfa

**DOSYA:** `web/app/page.tsx`

**URL:** `http://localhost:3000/`

**İÇERİK:**
- Hero banner
- Şehir/şube butonları
- Aksiyon butonları
- Harita (ilanlar)
- Son eklenen ilanlar

**ARANACAK KELİMELER:**
- `home-page` - Ana sayfa container class'ı
- `hero` - Banner alanı
- `branches` - Şube butonları
- `action-buttons` - Aksiyon butonları
- `listings-grid` - İlan grid'i

---

### 3.2.2 Şehir/Şube Sayfası

**DOSYA:** `web/app/[city]/page.tsx`

**URL:** `http://localhost:3000/konya`, `http://localhost:3000/istanbul` vb.

**İÇERİK:**
- Şehre özel ilanlar
- Filtreler (kategori, fiyat, özellik)
- İlan listesi
- Şube iletişim bilgileri

**DİNAMİK PARAMETRE:** `[city]` = şehir slug'ı

---

### 3.2.3 İlan Detay Sayfası

**DOSYA:** `web/app/listings/[id]/page.tsx`

**URL:** `http://localhost:3000/listings/xxx`

**İÇERİK:**
- Görsel galerisi
- İlan detayları
- Özellikler
- Konum haritası
- İletişim butonları
- Danışman bilgileri

---

### 3.2.4 Arama Sayfası

**DOSYA:** `web/app/arama/page.tsx`

**URL:** `http://localhost:3000/arama`

**İÇERİK:**
- Hızlı filtreler
- Gelişmiş filtreler
- Sonuç listesi

---

### 3.2.5 Admin Sayfaları

**KONUM:** `web/app/admin/`

| Sayfa | Dosya | URL | Açıklama |
|-------|-------|-----|----------|
| Dashboard | `page.tsx` | `/admin` | Ana panel |
| Giriş | `login/page.tsx` | `/admin/login` | Giriş formu |
| Ayarlar | `settings/page.tsx` | `/admin/settings` | Site ayarları |
| İlanlar | `listings/page.tsx` | `/admin/listings` | İlan yönetimi |
| Şubeler | `branches/page.tsx` | `/admin/branches` | Şube yönetimi |
| Şehirler | `cities/page.tsx` | `/admin/cities` | Şehir yönetimi |
| Danışmanlar | `consultants/page.tsx` | `/admin/consultants` | Danışman yönetimi |
| Banner'lar | `banners/page.tsx` | `/admin/banners` | Banner yönetimi |
| Şehir Butonları | `city-buttons/page.tsx` | `/admin/city-buttons` | Şehir butonları |
| Aksiyon Butonları | `action-buttons/page.tsx` | `/admin/action-buttons` | Aksiyon butonları |
| Menü | `menu/page.tsx` | `/admin/menu` | Menü yönetimi |
| Footer | `footer-items/page.tsx` | `/admin/footer-items` | Footer yönetimi |
| Sosyal Medya | `social-links/page.tsx` | `/admin/social-links` | Sosyal linkler |
| İlan Etiketleri | `listing-labels/page.tsx` | `/admin/listing-labels` | Etiket yönetimi |
| İlan Özellikleri | `listing-attributes/page.tsx` | `/admin/listing-attributes` | Özellik tanımları |
| Sayfalar | `pages/page.tsx` | `/admin/pages` | Dinamik sayfalar |
| Blog | `blog/page.tsx` | `/admin/blog` | Blog yönetimi |
| Sayfa Tasarım | `page-design/page.tsx` | `/admin/page-design` | Sayfa tasarımları |
| Mobil Ayarlar | `mobile-settings/page.tsx` | `/admin/mobile-settings` | Mobil ayarlar |
| SEO | `seo/page.tsx` | `/admin/seo` | SEO ayarları |
| Talepler | `requests/page.tsx` | `/admin/requests` | Talep yönetimi |
| Yedekleme | `backup/page.tsx` | `/admin/backup` | Yedekleme |
| İlan Hazırla | `ilan-hazirla/page.tsx` | `/admin/ilan-hazirla` | İlan hazırlama aracı |
| Talep Gir | `talep-gir/page.tsx` | `/admin/talep-gir` | Talep girişi |

## 3.3 Componentler

**KONUM:** `web/app/components/`

### 3.3.1 CorporateHeader.tsx (Üst Bar)

**NE İŞE YARAR:** Sitenin üst barı - navigasyon, logo, sosyal medya, arama

**YAPI:**
```
Header
├── Nav Row (Mavi bar)
│   ├── Menü linkleri
│   └── Danışman Girişi butonu
│
└── Logo Row (Beyaz bar)
    ├── Sosyal medya ikonları (sol)
    ├── Logo + Alt yazı (orta)
    └── Arama barı (sağ)
```

**ARANACAK CLASS'LAR:**
- `.corp-header` - Ana header container
- `.corp-nav-row` - Üst navigasyon barı
- `.corp-logo-row` - Logo satırı
- `.corp-social` - Sosyal medya ikonları
- `.corp-search` - Arama barı

---

### 3.3.2 CorporateFooter.tsx (Alt Bar)

**NE İŞE YARAR:** Sitenin alt barı - iletişim, linkler, sosyal medya

**YAPI:**
```
Footer
├── Logo + Açıklama
├── Hızlı Linkler
├── İletişim Bilgileri
└── Sosyal Medya
```

**ARANACAK CLASS'LAR:**
- `.corp-footer` - Ana footer container
- `.corp-footer-inner` - İç container
- `.corp-footer-col` - Sütunlar

---

### 3.3.3 ListingsMap.tsx (Harita)

**NE İŞE YARAR:** İlanları harita üzerinde gösterir

**KULLANILAN TEKNOLOJİ:** Leaflet + react-leaflet

**ÖZELLİKLER:**
- İlan konumlarını marker olarak gösterir
- Popup ile ilan özeti
- Dinamik import (SSR yok)

---

### 3.3.4 SettingsProvider.tsx

**NE İŞE YARAR:** Site ayarlarını tüm uygulamada erişilebilir yapar

**KULLANIM:**
```typescript
// Component içinde
const settings = useSettings();
console.log(settings.siteName);
```

## 3.4 Layout ve Metadata

**DOSYA:** `web/app/layout.tsx`

**NE İŞE YARAR:**
- Tüm sayfalar için ortak layout
- SEO metadata
- Font yükleme
- Analytics kodları

**İÇERİK:**
```typescript
// Metadata
export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: settings.metaTitle,
    description: settings.metaDescription,
    // ... diğer SEO alanları
  };
}

// Layout
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Fontlar */}
        {/* Analytics */}
        {/* Critical CSS */}
      </head>
      <body>
        <SettingsProvider>
          <CorporateHeader />
          {children}
          <CorporateFooter />
        </SettingsProvider>
      </body>
    </html>
  );
}
```

---

# BÖLÜM 4: CSS VE TASARIM

**ANA DOSYA:** `web/app/globals.css`

> ⚠️ **ÖNEMLİ:** Bu dosya ~2100 satır içerir ve tüm stilleri barındırır.

## 4.1 CSS Değişkenleri

**KONUM:** Satır 1-50 arası

**ARANACAK:** `:root`

```css
:root {
  /* RENKLER */
  --color-primary: #0a4ea3;      /* Ana mavi renk */
  --color-accent: #e53935;       /* Vurgu kırmızı */
  --color-bg: #f4f6f9;           /* Arkaplan gri */
  --color-card: #ffffff;         /* Kart beyaz */
  --color-text: #1e293b;         /* Metin koyu */
  --color-muted: #64748b;        /* Soluk metin */
  --color-border: #e2e8f0;       /* Kenarlık */
  
  /* FONTLAR */
  --font-primary: 'Manrope', 'Inter', sans-serif;
  
  /* BOYUTLAR */
  --radius: 12px;                /* Köşe yuvarlaklığı */
  --shadow: 0 1px 3px rgba(0,0,0,0.1);  /* Gölge */
}
```

**ÖRNEK DEĞİŞİKLİK - Ana Rengi Yeşil Yapma:**
```css
:root {
  --color-primary: #10b981;  /* Mavi yerine yeşil */
}
```

## 4.2 Header (Üst Bar)

**KONUM:** Satır 245-300 arası

**ARANACAK:** `.corp-header`, `.corp-nav-row`

```css
/* Ana header container */
.corp-header {
  background: var(--color-primary);  /* Mavi arkaplan */
  color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Üst navigasyon barı */
.corp-nav-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 18px;              /* İç boşluk */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Navigasyon linkleri */
.corp-nav a {
  padding: 8px 14px;
  font-size: 14px;                 /* Yazı boyutu */
  color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  transition: background-color 180ms;
}

.corp-nav a:hover {
  background: rgba(255, 255, 255, 0.15);
}
```

**ÖRNEK DEĞİŞİKLİK - Header Yüksekliğini Artırma:**
```css
.corp-nav-row {
  padding: 15px 18px;  /* 10px yerine 15px */
}
```

**ÖRNEK DEĞİŞİKLİK - Link Yazı Boyutunu Büyütme:**
```css
.corp-nav a {
  font-size: 16px;  /* 14px yerine 16px */
}
```

## 4.3 Logo Alanı

**KONUM:** Satır 300-340 arası

**ARANACAK:** `.corp-logo-row`, `.corp-logo`, `.corp-logo-img`

```css
/* Logo satırı */
.corp-logo-row {
  background: #ffffff;
  padding: 14px 0;
}

/* Logo container */
.corp-logo-row-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 18px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;  /* 3 sütun */
  align-items: center;
  gap: 20px;
}

/* Logo */
.corp-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

/* Logo görseli */
.corp-logo-img {
  height: 44px;                    /* Logo yüksekliği */
  width: auto;
}

/* Logo alt yazısı */
.corp-logo-sub {
  font-size: 11px;                 /* Alt yazı boyutu */
  color: var(--color-muted);
  font-style: italic;
}
```

**ÖRNEK DEĞİŞİKLİK - Logo Boyutunu Büyütme:**
```css
.corp-logo-img {
  height: 60px;  /* 44px yerine 60px */
}
```

## 4.4 Sosyal Medya İkonları

**KONUM:** Satır 390-410 arası

**ARANACAK:** `.corp-social`

```css
.corp-social {
  display: flex;
  gap: 8px;
}

.corp-social a {
  width: 36px;                     /* İkon kutu genişliği */
  height: 36px;                    /* İkon kutu yüksekliği */
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 16px;                 /* İkon boyutu */
  transition: background-color 180ms ease;
}

.corp-social a:hover {
  background: rgba(255, 255, 255, 0.25);
}
```

**ÖRNEK DEĞİŞİKLİK - İkon Boyutunu Küçültme:**
```css
.corp-social a {
  width: 28px;   /* 36px yerine 28px */
  height: 28px;
  font-size: 12px;  /* 16px yerine 12px */
}
```

## 4.5 Arama Barı

**KONUM:** Satır 345-395 arası

**ARANACAK:** `.corp-search`, `.corp-search-input`

```css
.corp-search {
  display: flex;
  justify-content: flex-end;
}

.corp-search-form {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.corp-search-input {
  width: 120px;                    /* Arama kutusu genişliği */
  padding: 6px 8px;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 13px;
}

.corp-search-btn {
  width: 32px;                     /* Buton genişliği */
  height: 32px;                    /* Buton yüksekliği */
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
}
```

**ÖRNEK DEĞİŞİKLİK - Arama Kutusunu Genişletme:**
```css
.corp-search-input {
  width: 180px;  /* 120px yerine 180px */
}
```

## 4.6 Banner/Hero

**KONUM:** Çeşitli yerler

**ARANACAK:** `.hero`, `.banner`

```css
/* Hero section */
.hero {
  padding: 8px;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

/* Banner */
.banner {
  width: 100%;
  height: auto;
  aspect-ratio: 21/9;              /* En-boy oranı */
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Ana sayfada banner */
.home-page .banner {
  max-height: 300px;               /* Maksimum yükseklik */
  min-height: 180px;               /* Minimum yükseklik */
}
```

**ÖRNEK DEĞİŞİKLİK - Banner Yüksekliğini Artırma:**
```css
.home-page .banner {
  max-height: 400px;  /* 300px yerine 400px */
  min-height: 250px;  /* 180px yerine 250px */
}
```

## 4.7 Şube Butonları

**KONUM:** Satır 600-700 arası

**ARANACAK:** `.branch-btn`, `.branches`

```css
/* Şube butonları container */
.home-page .branches {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  padding: 12px 0;
}

/* Tek buton */
.home-page .branch-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 12px;             /* Köşe yuvarlaklığı */
  text-decoration: none;
  transition: transform 200ms, box-shadow 200ms;
}

.home-page .branch-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Buton içindeki görsel */
.home-page .branch-btn img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 8px;
}

/* Buton başlığı */
.home-page .branch-btn .title {
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
}
```

**ÖRNEK DEĞİŞİKLİK - Butonları Büyütme:**
```css
.home-page .branch-btn {
  padding: 24px 16px;  /* Daha fazla padding */
}

.home-page .branch-btn img {
  width: 64px;   /* 48px yerine 64px */
  height: 64px;
}
```

## 4.8 Aksiyon Butonları

**KONUM:** Satır 750-800 arası

**ARANACAK:** `.action-btn`, `.action-buttons`

```css
/* Aksiyon butonları container */
.home-page .action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  padding: 12px 0;
}

/* Tek buton */
.home-page .action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  background: var(--color-primary);
  color: #ffffff;
  border-radius: 10px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  transition: transform 200ms, opacity 200ms;
}

.home-page .action-btn:hover {
  transform: scale(1.02);
  opacity: 0.9;
}

/* Buton ikonu */
.home-page .action-btn i {
  font-size: 20px;
  margin-bottom: 6px;
}
```

**ÖRNEK DEĞİŞİKLİK - Buton Rengini Değiştirme:**
```css
.home-page .action-btn {
  background: #10b981;  /* Mavi yerine yeşil */
}
```

## 4.9 İlan Kartları

**KONUM:** Satır 850-950 arası

**ARANACAK:** `.listing-card`

```css
/* İlan kartı */
.listing-card {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 200ms, box-shadow 200ms;
}

.listing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* Kart görseli */
.listing-card-image {
  aspect-ratio: 4/3;
  object-fit: cover;
  width: 100%;
}

/* Kart içeriği */
.listing-card-content {
  padding: 12px;
}

/* Kart başlığı */
.listing-card-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text);
  margin-bottom: 4px;
}

/* Kart fiyatı */
.listing-card-price {
  font-weight: 700;
  font-size: 16px;
  color: var(--color-primary);
}

/* Kart etiketi (Satılık, Kiralık, Fırsat) */
.listing-card-label {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #ffffff;
  background: var(--color-accent);
}
```

**ÖRNEK DEĞİŞİKLİK - Kart Köşelerini Daha Yuvarlak Yapma:**
```css
.listing-card {
  border-radius: 20px;  /* 12px yerine 20px */
}
```

## 4.10 Footer

**KONUM:** Satır 415-500 arası

**ARANACAK:** `.corp-footer`

```css
/* Footer ana container */
.corp-footer {
  background: #0a4ea3;             /* Mavi arkaplan */
  color: #ffffff;
  padding: 40px 0 24px;
}

/* Footer içerik */
.corp-footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 18px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);  /* 4 sütun */
  gap: 32px;
}

/* Footer sütunu */
.corp-footer-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Footer başlık */
.corp-footer-title {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 8px;
}

/* Footer link */
.corp-footer-link {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-decoration: none;
  transition: color 180ms;
}

.corp-footer-link:hover {
  color: #ffffff;
}

/* Copyright */
.corp-footer-copyright {
  text-align: center;
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}
```

**ÖRNEK DEĞİŞİKLİK - Footer Arkaplan Rengini Değiştirme:**
```css
.corp-footer {
  background: #1e293b;  /* Mavi yerine koyu gri */
}
```

## 4.11 Mobil Ayarlar

**KONUM:** Satır 1500+ arası

**ARANACAK:** `@media (max-width: 768px)`

### Mobil CSS Değişkenleri

```css
/* Mobil CSS Değişkenleri (Admin panelden kontrol edilebilir) */
:root {
  --mobile-header-padding: 4px 8px;
  --mobile-nav-font-size: 10px;
  --mobile-logo-row-padding: 12px 8px;
  --mobile-logo-height: 28px;
  --mobile-logo-sub-size: 9px;
  --mobile-social-size: 22px;
  --mobile-search-width: 40px;
  --mobile-search-height: 24px;
  --mobile-banner-height: 120px;
  --mobile-banner-radius: 8px;
  --mobile-branch-columns: 3;
  --mobile-branch-gap: 6px;
  --mobile-branch-radius: 8px;
  --mobile-action-columns: 2;
  --mobile-action-gap: 6px;
  --mobile-action-height: 60px;
  --mobile-action-font-size: 10px;
  --mobile-action-radius: 8px;
  --mobile-listing-columns: 2;
  --mobile-listing-gap: 8px;
}
```

### Mobil Breakpoint'ler

| Breakpoint | Ekran Genişliği | Kullanım |
|------------|-----------------|----------|
| Tablet | `max-width: 1024px` | Tablet ve küçük laptop |
| Mobil | `max-width: 768px` | Telefon (yatay) |
| Küçük Mobil | `max-width: 480px` | Telefon (dikey) |
| Çok Küçük | `max-width: 360px` | Küçük telefonlar |

### Mobil Header

```css
@media (max-width: 768px) {
  .corp-header {
    padding: 0;
  }

  .corp-nav-row {
    padding: var(--mobile-header-padding, 4px 8px);
    flex-wrap: nowrap;
    gap: 2px;
    overflow-x: auto;  /* Yatay scroll */
  }

  .corp-nav a {
    padding: 4px 6px;
    font-size: var(--mobile-nav-font-size, 10px);
    white-space: nowrap;
  }

  .corp-logo-row-inner {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 8px;
    padding: var(--mobile-logo-row-padding, 12px 8px);
  }

  .corp-logo-img {
    height: var(--mobile-logo-height, 28px);
  }

  .corp-social a {
    width: var(--mobile-social-size, 22px) !important;
    height: var(--mobile-social-size, 22px) !important;
  }
}
```

### Mobil Şube Butonları

```css
@media (max-width: 768px) {
  .home-page .branches {
    display: grid !important;
    grid-template-columns: repeat(var(--mobile-branch-columns, 3), 1fr) !important;
    gap: var(--mobile-branch-gap, 6px) !important;
  }

  .home-page .branch-btn {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    padding: 10px 6px;
    border-radius: var(--mobile-branch-radius, 8px);
  }
}
```

## 4.12 Admin Panel

**KONUM:** Satır 1100-1400 arası

**ARANACAK:** `.admin-`

```css
/* Admin sayfa container */
.admin-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding: 20px 0;
}

/* Admin container */
.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Admin header */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

/* Admin başlık */
.admin-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
}

/* Admin kart */
.admin-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

/* Admin buton */
.btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  font-size: 14px;
}

.btn-primary {
  background: var(--color-primary);
  color: #ffffff;
  border: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
```

---

# BÖLÜM 5: DATABASE

**DOSYA:** `api/prisma/schema.prisma`

## 5.1 Tablo Listesi

| # | Tablo | Açıklama |
|---|-------|----------|
| 1 | User | Kullanıcılar (giriş yapanlar) |
| 2 | Consultant | Danışmanlar |
| 3 | Branch | Şubeler |
| 4 | City | Şehirler |
| 5 | District | İlçeler |
| 6 | Neighborhood | Mahalleler |
| 7 | Listing | İlanlar |
| 8 | ListingImage | İlan görselleri |
| 9 | ListingAttributeDefinition | İlan özellik tanımları |
| 10 | CustomerRequest | Müşteri talepleri |
| 11 | ConsultantRequest | Danışman talepleri |
| 12 | SiteSetting | Site ayarları (ÇOK ÖNEMLİ!) |
| 13 | FooterItem | Footer öğeleri |
| 14 | ListingLabel | İlan etiketleri |
| 15 | CityButton | Şehir butonları |
| 16 | Banner | Banner'lar |
| 17 | ActionButton | Aksiyon butonları |
| 18 | PageSetting | Dinamik sayfalar |
| 19 | BlogPost | Blog yazıları |
| 20 | MenuItem | Menü öğeleri |
| 21 | PageDesign | Sayfa tasarımları |
| 22 | SocialLink | Sosyal medya linkleri |

## 5.2 SiteSetting Tablosu

**Bu tablo site genelindeki TÜM ayarları içerir.**

### Temel Ayarlar

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | String | Varsayılan: "default" |
| siteName | String | Site adı |
| logoUrl | String? | Logo URL |
| ownerName | String? | Site sahibi adı |
| ownerTitle | String? | Site sahibi unvanı |
| showOwnerTitle | Boolean | Unvan gösterilsin mi? |
| phoneNumber | String? | Telefon |
| whatsappNumber | String? | WhatsApp |
| email | String? | E-posta |
| supportEmail | String? | Destek e-posta |
| primaryColor | String? | Ana renk |
| accentColor | String? | Vurgu rengi |
| backgroundColor | String? | Arkaplan rengi |
| textColor | String? | Metin rengi |

### Banner/Hero Ayarları

| Alan | Tip | Açıklama |
|------|-----|----------|
| heroBackgroundUrl | String? | Hero arkaplan görseli |
| heroOverlayColor | String? | Overlay rengi |
| heroOverlayOpacity | Float? | Overlay opaklığı |
| bannerWidth | Int? | Banner genişliği |
| bannerHeight | Int? | Banner yüksekliği |
| bannerOpacity | Float? | Banner opaklığı |

### Logo Ayarları

| Alan | Tip | Açıklama |
|------|-----|----------|
| logoWidth | Int? | Logo genişliği |
| logoHeight | Int? | Logo yüksekliği |
| logoPositionX | Int? | Logo X konumu |
| logoPositionY | Int? | Logo Y konumu |
| logoTagline | String? | Logo sloganı |
| logoTaglineFont | String? | Slogan fontu |
| logoTaglineFontSize | Int? | Slogan font boyutu |
| logoTaglineColor | String? | Slogan rengi |
| logoSubtitleText | String? | Alt yazı metni |
| logoSubtitleFont | String? | Alt yazı fontu |
| logoSubtitleFontSize | Int? | Alt yazı boyutu |
| logoSubtitleColor | String? | Alt yazı rengi |
| logoSubtitleBgColor | String? | Alt yazı arkaplanı |
| showLogoSubtitle | Boolean | Alt yazı gösterilsin mi? |

### Header Ayarları

| Alan | Tip | Açıklama |
|------|-----|----------|
| headerBgColor | String? | Header arkaplan rengi |
| headerBgGradient | String? | Header gradient |
| headerBgImage | String? | Header arkaplan görseli |
| headerBgOpacity | Float? | Header opaklığı |
| headerNavFont | String? | Navigasyon fontu |
| headerNavFontSize | Int? | Navigasyon font boyutu |
| headerNavColor | String? | Navigasyon rengi |

### Footer Ayarları

| Alan | Tip | Açıklama |
|------|-----|----------|
| footerBgColor | String? | Footer arkaplan rengi |
| footerBgGradient | String? | Footer gradient |
| footerTextColor | String? | Footer metin rengi |
| footerFont | String? | Footer fontu |
| footerFontSize | Int? | Footer font boyutu |
| footerLogoSubtitle | String? | Footer logo altı yazı |
| footerAddress | String? | Adres |
| footerAddress2 | String? | Adres 2 |
| footerPhone | String? | Telefon |
| footerPhone2 | String? | Telefon 2 |
| footerEmail | String? | E-posta |
| footerWorkingHours | String? | Çalışma saatleri |
| footerCopyright | String? | Copyright metni |
| footerShowMap | Boolean | Harita gösterilsin mi? |
| footerMapUrl | String? | Harita URL |

### Şehir Butonları Ayarları

| Alan | Tip | Açıklama |
|------|-----|----------|
| homeCityBtnWidth | Int? | Buton genişliği |
| homeCityBtnHeight | Int? | Buton yüksekliği |
| homeCityBtnGap | Int? | Butonlar arası boşluk |
| homeCityBtnBorderRadius | Int? | Köşe yuvarlaklığı |
| homeCityBtnAlign | String? | Hizalama (left, center, right) |
| cityBtnTitleColor | String? | Başlık rengi |
| cityBtnTitleSize | Int? | Başlık boyutu |
| cityBtnTitleFont | String? | Başlık fontu |
| cityBtnSubtitleColor | String? | Alt başlık rengi |
| cityBtnSubtitleSize | Int? | Alt başlık boyutu |
| cityBtnBadgeText | String? | Rozet metni |
| cityBtnBadgeColor | String? | Rozet rengi |
| cityBtnBadgeBgColor | String? | Rozet arkaplan rengi |
| cityBtnBadgeIcon | String? | Rozet ikonu |
| cityBtnShowBadge | Boolean | Rozet gösterilsin mi? |

### Aksiyon Butonları Ayarları

| Alan | Tip | Açıklama |
|------|-----|----------|
| homeActionBtnWidth | Int? | Buton genişliği |
| homeActionBtnHeight | Int? | Buton yüksekliği |
| homeActionBtnGap | Int? | Butonlar arası boşluk |
| homeActionBtnBorderRadius | Int? | Köşe yuvarlaklığı |
| homeActionBtnFontSize | Int? | Font boyutu |

### SEO Ayarları

| Alan | Tip | Açıklama |
|------|-----|----------|
| metaTitle | String? | Sayfa başlığı |
| metaDescription | String? | Sayfa açıklaması |
| metaKeywords | String? | Anahtar kelimeler |
| ogImage | String? | Paylaşım görseli |
| canonicalUrl | String? | Canonical URL |
| googleAnalyticsId | String? | GA4 ID |
| googleTagManagerId | String? | GTM ID |
| facebookPixelId | String? | Facebook Pixel ID |
| googleSiteVerification | String? | Google doğrulama |
| bingSiteVerification | String? | Bing doğrulama |
| yandexVerification | String? | Yandex doğrulama |

### Schema.org Ayarları

| Alan | Tip | Açıklama |
|------|-----|----------|
| schemaOrgType | String? | Schema türü |
| schemaOrgName | String? | İşletme adı |
| schemaOrgDescription | String? | İşletme açıklaması |
| schemaOrgTelephone | String? | Telefon |
| schemaOrgAddress | String? | Adres |
| schemaOrgCity | String? | Şehir |
| schemaOrgRegion | String? | Bölge |
| schemaOrgPostalCode | String? | Posta kodu |
| schemaOrgCountry | String? | Ülke |
| schemaOrgPriceRange | String? | Fiyat aralığı |
| schemaOrgOpeningHours | String? | Çalışma saatleri |

### Mobil Ayarlar

| Alan | Tip | Açıklama |
|------|-----|----------|
| mobileHeaderPadding | String? | Header padding |
| mobileNavFontSize | Int? | Nav font boyutu |
| mobileLogoRowPadding | String? | Logo satırı padding |
| mobileLogoHeight | Int? | Logo yüksekliği |
| mobileLogoSubSize | Int? | Logo alt yazı boyutu |
| mobileLogoAlign | String? | Logo hizalama |
| mobileSocialSize | Int? | Sosyal ikon boyutu |
| mobileSocialShow | Boolean | Sosyal ikonlar gösterilsin mi? |
| mobileSearchWidth | Int? | Arama genişliği |
| mobileSearchHeight | Int? | Arama yüksekliği |
| mobileSearchShow | Boolean | Arama gösterilsin mi? |
| mobileBannerHeight | Int? | Banner yüksekliği |
| mobileBannerAspectRatio | String? | Banner en-boy oranı |
| mobileBannerFullWidth | Boolean | Tam genişlik mi? |
| mobileBannerBorderRadius | Int? | Banner köşe yuvarlaklığı |
| mobileBranchColumns | Int? | Şube buton sütun sayısı |
| mobileBranchGap | Int? | Şube buton boşluğu |
| mobileBranchSize | Int? | Şube buton boyutu |
| mobileBranchBorderRadius | Int? | Şube buton köşe yuvarlaklığı |
| mobileBranchAlign | String? | Şube buton hizalama |
| mobileActionColumns | Int? | Aksiyon buton sütun sayısı |
| mobileActionGap | Int? | Aksiyon buton boşluğu |
| mobileActionHeight | Int? | Aksiyon buton yüksekliği |
| mobileActionFontSize | Int? | Aksiyon buton font boyutu |
| mobileActionBorderRadius | Int? | Aksiyon buton köşe yuvarlaklığı |
| mobileListingColumns | Int? | İlan kartı sütun sayısı |
| mobileListingGap | Int? | İlan kartı boşluğu |

## 5.3 Diğer Tablolar

### User (Kullanıcılar)

```prisma
model User {
  id           String     @id @default(cuid())
  email        String     @unique
  passwordHash String
  name         String
  role         UserRole   @default(CONSULTANT)
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

enum UserRole {
  ADMIN
  MANAGER
  BRANCH_MANAGER
  CONSULTANT
}
```

### Listing (İlanlar)

```prisma
model Listing {
  id              String          @id @default(cuid())
  title           String
  description     String?
  status          ListingStatus   @default(draft)
  category        ListingCategory
  propertyType    PropertyType
  price           Float
  currency        String          @default("TRY")
  areaGross       Float?
  areaNet         Float?
  latitude        Float?
  longitude       Float?
  attributes      Json?
  isOpportunity   Boolean         @default(false)
  branchId        String
  cityId          String
  districtId      String?
  neighborhoodId  String?
  consultantId    String?
  createdByUserId String
  publishedAt     DateTime?
  slug            String?         @unique
  seoUrl          String?
  metaTitle       String?
  metaDescription String?
  metaKeywords    String?
  canonicalUrl    String?
  ogImage         String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  // İlişkiler
  branch          Branch          @relation(...)
  city            City            @relation(...)
  district        District?       @relation(...)
  neighborhood    Neighborhood?   @relation(...)
  consultant      Consultant?     @relation(...)
  createdBy       User            @relation(...)
  images          ListingImage[]
}

enum ListingStatus {
  draft
  active
  sold
  rented
  inactive
}

enum ListingCategory {
  sale    // Satılık
  rent    // Kiralık
}

enum PropertyType {
  apartment      // Daire
  house          // Müstakil Ev
  villa          // Villa
  land           // Arsa
  commercial     // Ticari
  office         // Ofis
  shop           // Dükkan
  warehouse      // Depo
  other          // Diğer
}
```

### CityButton (Şehir Butonları)

```prisma
model CityButton {
  id             String   @id @default(cuid())
  name           String
  slug           String   @unique
  imageUrl       String?
  icon           String?
  iconColor      String?
  bgColor        String?
  borderColor    String?
  width          Int?
  height         Int?
  sortOrder      Int      @default(0)
  isActive       Boolean  @default(true)
  cityId         String?
  address        String?
  phone          String?
  whatsappNumber String?
  email          String?
  consultantName String?
  latitude       Float?
  longitude      Float?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  city           City?    @relation(...)
}
```

### Banner

```prisma
model Banner {
  id          String    @id @default(cuid())
  title       String?
  imageUrl    String
  linkUrl     String?
  position    String    @default("home-top")
  sortOrder   Int       @default(0)
  isActive    Boolean   @default(true)
  startDate   DateTime?
  endDate     DateTime?
  width       Int?
  height      Int?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### ActionButton

```prisma
model ActionButton {
  id        String   @id @default(cuid())
  name      String
  linkUrl   String?
  imageUrl  String?
  bgColor   String?
  textColor String?
  icon      String?
  width     Int?
  height    Int?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 5.4 İlişkiler

```
User ─────────┬───────> Consultant (1:1)
              └───────> Listing (1:N, createdBy)

Consultant ───┬───────> Branch (N:1)
              └───────> Listing (1:N)

Branch ───────┬───────> City (N:1)
              ├───────> Listing (1:N)
              └───────> Consultant (1:N)

City ─────────┬───────> District (1:N)
              ├───────> Neighborhood (1:N)
              ├───────> Branch (1:N)
              ├───────> Listing (1:N)
              ├───────> CustomerRequest (1:N)
              └───────> CityButton (1:N)

District ─────┬───────> Neighborhood (1:N)
              ├───────> Listing (1:N)
              └───────> CustomerRequest (1:N)

Neighborhood ─┬───────> Listing (1:N)
              └───────> CustomerRequest (1:N)

Listing ──────────────> ListingImage (1:N)
```

---

# BÖLÜM 6: ADMIN PANEL

## 6.1 Admin Sayfaları

### Giriş Yapma

**URL:** `http://localhost:3000/admin/login`

**İŞLEM:**
1. E-posta ve şifre girin
2. "Giriş Yap" butonuna tıklayın
3. JWT token localStorage'a kaydedilir
4. Admin panele yönlendirilirsiniz

### Dashboard

**URL:** `http://localhost:3000/admin`

**İÇERİK:**
- İstatistikler (toplam ilan, şube, danışman sayısı)
- Hızlı erişim butonları
- Son aktiviteler

### Site Ayarları

**URL:** `http://localhost:3000/admin/settings`

**İÇERİK:**
- Temel bilgiler (site adı, logo, iletişim)
- Renk ayarları
- Header ayarları
- Footer ayarları
- SEO ayarları

### Mobil Ayarlar

**URL:** `http://localhost:3000/admin/mobile-settings`

**İÇERİK:**
- Header & Logo
- Banner
- Şube Butonları
- Aksiyon Butonları
- İlan Kartları

**SEKMELER:**
1. Header & Logo - Üst bar ve logo ayarları
2. Banner - Banner yükseklik ve köşe ayarları
3. Şube Butonları - Sütun sayısı, boşluk, boyut
4. Aksiyon Butonları - Sütun sayısı, yükseklik, font
5. İlan Kartları - Grid ayarları

## 6.2 Admin Ayarları

### Ayar Değiştirme Akışı

```
Admin Panel  ───>  API (PATCH /settings)  ───>  Database (SiteSetting)
     │
     └───>  CSS Variables  ───>  globals.css
```

### Hangi Ayar Nerede?

| Ayar | Admin Panel Konumu | API Endpoint | Database Alanı |
|------|-------------------|--------------|----------------|
| Site Adı | Ayarlar > Temel | PATCH /settings | siteName |
| Logo | Ayarlar > Logo | POST /settings/upload | logoUrl |
| Ana Renk | Ayarlar > Renkler | PATCH /settings | primaryColor |
| Header Arkaplan | Ayarlar > Header | PATCH /settings | headerBgColor |
| Footer Arkaplan | Ayarlar > Footer | PATCH /settings | footerBgColor |
| SEO Başlık | SEO | PATCH /settings | metaTitle |
| Mobil Logo Boyutu | Mobil Ayarlar | PATCH /settings | mobileLogoHeight |
| Banner Yüksekliği | Mobil Ayarlar | PATCH /settings | mobileBannerHeight |
| Şube Buton Sütunu | Mobil Ayarlar | PATCH /settings | mobileBranchColumns |

---

# BÖLÜM 7: ÖZEL KONULAR

## 7.1 Authentication

### Token Alma

```javascript
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'şifre'
  })
});

const data = await response.json();
const token = data.access_token;

// Token'ı sakla
localStorage.setItem('auth_token', token);
```

### Token Kullanma

```javascript
const token = localStorage.getItem('auth_token');

const response = await fetch('http://localhost:3001/listings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Yeni İlan',
    // ...
  })
});
```

### Rol Kontrolü

| Rol | Yetkiler |
|-----|----------|
| ADMIN | Her şeye tam erişim |
| MANAGER | Çoğu admin özelliği |
| BRANCH_MANAGER | Kendi şubesini yönetme |
| CONSULTANT | Kendi ilanlarını yönetme |

## 7.2 Dosya Yükleme

### Upload Endpoint'leri

| Endpoint | Amaç | Max Boyut |
|----------|------|-----------|
| POST /settings/upload | Ayar görselleri | 5MB |
| POST /listings/:id/images/upload | İlan görseli | 10MB |
| POST /listings/:id/images/upload-many | Çoklu görsel | 10MB x 20 |
| POST /banners (form-data) | Banner görseli | 10MB |
| POST /city-buttons/upload | Şehir buton görseli | 5MB |
| POST /action-buttons/upload | Aksiyon buton görseli | 5MB |

### Örnek Upload

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3001/settings/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log(data.url); // /uploads/xxx.jpg
```

### Dosya Konumu

Yüklenen dosyalar: `api/uploads/`

URL formatı: `http://localhost:3001/uploads/dosya-adi.jpg`

## 7.3 SEO

### Metadata

Layout'ta otomatik oluşturulur:

```typescript
export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: settings.metaTitle || settings.siteName,
    description: settings.metaDescription,
    keywords: settings.metaKeywords,
    openGraph: {
      title: settings.metaTitle,
      description: settings.metaDescription,
      images: [{ url: settings.ogImage }],
    },
    // ...
  };
}
```

### Schema.org

JSON-LD formatında:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Site Adı",
  "description": "Açıklama",
  "telephone": "+90...",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "...",
    "addressLocality": "...",
    "addressCountry": "TR"
  }
}
</script>
```

### Sitemap

**DOSYA:** `web/app/sitemap.ts`

Otomatik oluşturulur:
- Ana sayfa
- Şehir sayfaları
- İlan detay sayfaları
- Statik sayfalar

### Robots.txt

**DOSYA:** `web/app/robots.ts`

```typescript
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://site.com/sitemap.xml',
  };
}
```

## 7.4 Mobil Uyumluluk

### Responsive Tasarım

CSS Media Query'ler ile:

```css
/* Tablet */
@media (max-width: 1024px) { ... }

/* Mobil */
@media (max-width: 768px) { ... }

/* Küçük Mobil */
@media (max-width: 480px) { ... }

/* Çok Küçük */
@media (max-width: 360px) { ... }
```

### Mobil CSS Variables

Admin panelden değiştirilebilir:

```css
:root {
  --mobile-header-padding: 4px 8px;
  --mobile-logo-height: 28px;
  --mobile-branch-columns: 3;
  /* ... */
}
```

### Mobil Viewport

Layout'ta:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

---

# BÖLÜM 8: SORUN GİDERME

## 8.1 Sık Karşılaşılan Hatalar

### "Cannot connect to database"

**Sebep:** PostgreSQL çalışmıyor

**Çözüm:**
```powershell
docker-compose up -d
docker ps  # Container'ın çalıştığını kontrol et
```

### "JWT expired"

**Sebep:** Token süresi dolmuş

**Çözüm:**
```javascript
localStorage.removeItem('auth_token');
// Yeniden giriş yapın
```

### "CORS error"

**Sebep:** API izinleri yanlış

**Çözüm:** `api/.env` dosyasında:
```env
CORS_ORIGIN="http://localhost:3000"
```

### "Prisma migration failed"

**Sebep:** Schema değişikliği

**Çözüm:**
```powershell
cd api
npx prisma db push --force-reset  # DİKKAT: Veriyi siler!
```

### "Module not found"

**Sebep:** Paketler eksik

**Çözüm:**
```powershell
npm install
```

### "Port already in use"

**Sebep:** Port başka uygulama tarafından kullanılıyor

**Çözüm:**
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

## 8.2 Debug İpuçları

### API Logları

Terminal'de API çalışırken loglar görünür.

### Browser DevTools

- Console: JavaScript hataları
- Network: API istekleri
- Application > Local Storage: Token

### Database Kontrolü

```powershell
# PostgreSQL'e bağlan
docker exec -it ozcanaktasweb-postgres psql -U postgres -d ozcanaktasweb

# Tabloları listele
\dt

# Kayıtları gör
SELECT * FROM "SiteSetting";

# Çıkış
\q
```

### Prisma Studio

```powershell
cd api
npx prisma studio
# Browser'da http://localhost:5555 açılır
```

---

# EK: HIZLI REFERANS KARTLARI

## Dosya Konumları

| Ne? | Nerede? |
|-----|---------|
| Tüm CSS | `web/app/globals.css` |
| Ana Sayfa | `web/app/page.tsx` |
| Header | `web/app/components/CorporateHeader.tsx` |
| Footer | `web/app/components/CorporateFooter.tsx` |
| Layout | `web/app/layout.tsx` |
| API Başlangıç | `api/src/main.ts` |
| Database Şema | `api/prisma/schema.prisma` |
| Site Ayarları | `api/src/settings/` |
| İlan Modülü | `api/src/listings/` |

## Komutlar

| Ne? | Komut |
|-----|-------|
| API başlat | `cd api && npm run start:dev` |
| Web başlat | `cd web && npm run dev` |
| Database başlat | `docker-compose up -d` |
| Prisma client | `npx prisma generate` |
| Database push | `npx prisma db push` |
| Prisma studio | `npx prisma studio` |

## Portlar

| Servis | Port |
|--------|------|
| Web | 3000 |
| API | 3001 |
| PostgreSQL | 5432 |
| Prisma Studio | 5555 |

## CSS Class Referansı

| Element | Class |
|---------|-------|
| Header | `.corp-header` |
| Nav Bar | `.corp-nav-row` |
| Logo Satırı | `.corp-logo-row-inner` |
| Logo | `.corp-logo` |
| Sosyal İkonlar | `.corp-social` |
| Arama | `.corp-search` |
| Footer | `.corp-footer` |
| Ana Sayfa | `.home-page` |
| Banner | `.banner`, `.hero` |
| Şube Butonları | `.branches`, `.branch-btn` |
| Aksiyon Butonları | `.action-buttons`, `.action-btn` |
| İlan Kartı | `.listing-card` |
| Admin | `.admin-page`, `.admin-card` |

---

**Son Güncelleme:** Ocak 2026

**Hazırlayan:** Cursor AI

**Lisans:** Bu dokümantasyon proje ile birlikte dağıtılabilir.
