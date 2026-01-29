## Özet
Bu proje Next.js (web), NestJS (api) ve PostgreSQL ile bir emlak sitesi altyapısı olarak kuruldu.

## Mevcut Durum - TAMAMLANDI

### API Backend (NestJS)
- **Auth**: JWT login
- **Listings**: CRUD + resim yükleme + kapak resmi + filtreleme
- **Cities**: CRUD + Türkiye lokasyon import
- **Districts**: Okuma (cityId ile filtreleme)
- **Neighborhoods**: Okuma (districtId ile filtreleme)
- **Branches**: CRUD
- **Consultants**: CRUD (user + consultant)
- **Requests**: Müşteri ve danışman talepleri + durum güncelleme
- **Settings**: Site ayarları (logo, renkler, iletişim)
- **Listing Attributes**: Dinamik özellik tanımları

### API Endpointleri
- POST /auth/login
- GET/POST/PATCH/DELETE /listings (+ /listings/:id/images)
- GET/POST/PATCH/DELETE /cities (+ /cities/import/tr)
- GET /districts?cityId=xxx
- GET /neighborhoods?districtId=xxx
- GET/POST/PATCH/DELETE /branches
- GET/POST/PATCH/DELETE /consultants
- POST /requests/customer, GET /requests/customer
- POST /requests/consultant, GET /requests/consultant
- PATCH /requests/customer/:id/status, /requests/consultant/:id/status
- GET/PATCH /settings
- GET/POST/PATCH/DELETE /listing-attributes

### Web Frontend (Next.js)

**Public Sayfalar:**
- `/` : Ana sayfa (şubeler, hızlı işlemler, hizmet bölgeleri, son ilanlar)
- `/[city]` : Şehir sayfası (dinamik özellik filtreleri dahil)
- `/listings/[id]` : İlan detay (özellikler, galeri, harita, danışman)
- `/firsatlar` : Fırsat ilanları
- `/arama` : Genel arama sayfası
- `/hakkimizda` : Hakkımızda sayfası
- `/iletisim` : İletişim sayfası
- `/requests/customer` : Müşteri talep formu
- `/requests/consultant` : Danışman talep formu

**Admin Panel:**
- `/admin` : Dashboard (istatistikler + hızlı işlemler)
- `/admin/login` : Giriş
- `/admin/listings` : İlan yönetimi (CRUD + resim)
- `/admin/cities` : Şehir yönetimi + Türkiye import
- `/admin/branches` : Şube yönetimi
- `/admin/consultants` : Danışman yönetimi
- `/admin/requests` : Talep yönetimi
- `/admin/settings` : Site ayarları
- `/admin/listing-attributes` : Özellik tanımları

### Özellikler
- ✅ Dinamik özellik filtreleri (oda sayısı, bina yaşı, vb.)
- ✅ Resim yükleme ve optimizasyon (max 1600px)
- ✅ Konum bazlı filtreleme (şehir/ilçe/mahalle)
- ✅ Fiyat aralığı filtreleme
- ✅ Kategori filtreleme
- ✅ Arama fonksiyonu
- ✅ WhatsApp ve telefon entegrasyonu
- ✅ Harita gösterimi (OpenStreetMap)
- ✅ Site ayarları ve tema renkleri
- ✅ Role-based access control

## Kurulum
```bash
# API
cd api
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run start:dev

# Web
cd web
npm install
npm run dev
```

## Docker
```bash
docker-compose up -d  # PostgreSQL
```
