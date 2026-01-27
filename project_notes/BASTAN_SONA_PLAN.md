## BASTAN SONA PROJE OZETI (OGRENME REHBERI)
Bu dosya, projede neler yapildigini dosya/dizin bazinda anlatir.
Yeni bir degisiklik yaptigimizda bu dosyaya da mutlaka ekleyecegiz.

## 1) PROJE KLASOR DIZILIMI (KISA HARITA)
- docker-compose.yml
- api/
  - src/
  - prisma/
  - generated/
  - package.json
- web/
  - app/
  - public/
  - package.json
- project_notes/
  - PROGRESS.md
  - NEXT_PLAN.md
  - DEPLOY.md
  - BASTAN_SONA_PLAN.md (bu dosya)

## 2) KULLANILAN TEKNOLOJILER VE AMACLARI
- Next.js (web):
  - Kullaniciya gorunen web sayfalari.
  - Ornek: Anasayfada ilanlar listelenir, ilan detay sayfasi gorunur.
- NestJS (api):
  - Veri ve is mantigi (backend).
  - Ornek: /listings endpointi ilanlari JSON olarak dondurur.
- PostgreSQL (db):
  - Kalici veri depolama (ilan, sehir, danisman vb).
  - Ornek: Bir ilan eklendiginde DB'de saklanir.
- Prisma:
  - DB'ye erisim icin ORM.
  - Ornek: prisma.listing.findMany() ile ilanlar cekilir.

## 3) API KLASORU (api/) — NE VAR, NE ISE YARIYOR
### 3.1 app.module.ts
- Tum moduller burada birlestirilir.
- Amac: API'nin hangi modulleri kullanacagini merkezden yonetmek.

### 3.2 auth (api/src/auth)
- auth.controller.ts: POST /auth/login
  - Kullanici giris endpointi.
  - Ornek: Admin giris yaptiginda JWT token uretilir.
- auth.service.ts:
  - Kullanici dogrulama ve JWT olusturma.
- jwt.strategy.ts:
  - JWT kontrolu ve payload okuma.
- guards/jwt-auth.guard.ts:
  - Korumali endpointlerde token zorunlulugu.
- guards/roles.guard.ts:
  - Rol bazli yetki kontrolu (ADMIN/MANAGER).
- shared/decorators/roles.decorator.ts:
  - Endpointlere rol atamak icin dekorator.

### 3.3 listings (api/src/listings)
- listings.controller.ts:
  - GET /listings, GET /listings/:id
  - POST /listings, PATCH /listings/:id, DELETE /listings/:id
  - Goruntuler: POST /listings/:id/images (URL)
  - Dosya yukleme: POST /listings/:id/images/upload
  - Kapak: PATCH /listings/:id/images/:imageId/cover
  - Sil: DELETE /listings/:id/images/:imageId
- listings.service.ts:
  - Filtreli listeleme (sehir, ilce, fiyat, kategori, durum vb).
  - Ornek: /listings?citySlug=konya&status=FOR_SALE
  - Gorsel optimizasyonu (max 1600px).

### 3.4 requests (api/src/requests)
- requests.controller.ts:
  - POST /requests/customer (musteri talebi)
  - GET /requests/customer (admin gorur)
  - POST /requests/consultant (danisman talebi)
  - GET /requests/consultant (admin gorur)
  - PATCH /requests/*/status (durum guncelleme)
- requests.service.ts:
  - Talep kaydetme ve durum guncelleme.

### 3.5 cities / branches / consultants
- cities.controller.ts:
  - GET /cities
  - POST/PATCH/DELETE (sadece admin/manager)
- branches.controller.ts:
  - GET /branches
  - POST/PATCH/DELETE (sadece admin/manager)
- consultants.controller.ts:
  - GET /consultants
  - POST/PATCH/DELETE (sadece admin/manager)
- Amac:
  - Sehir, sube ve danisman yonetimini admin paneline saglamak.

### 3.6 districts / neighborhoods
- GET /districts?cityId=...
- GET /neighborhoods?districtId=...
- Amac:
  - Sehir sayfasinda ilce/mahalle filtrelerini doldurmak.

### 3.7 prisma (api/prisma)
- schema.prisma:
  - Tum DB tablolarinin tanimi.
- seed.ts:
  - Ornek veri (sehir, sube, ilan, danisman).
  - Calistirma: npm run db:seed

### 3.8 uploads
- API tarafinda dosyadan yuklenen gorseller burada saklanir.
- /uploads/ prefix'i ile webden gorunur.

## 4) WEB KLASORU (web/) — NE VAR, NE ISE YARIYOR
### 4.1 app/layout.tsx
- Tum sayfalarda ortak layout.
- Ornek: TopBar + Header + Footer.

### 4.2 app/page.tsx (Anasayfa)
- Subeler listesi (API: /branches)
- Son ilanlar (API: /listings?take=6)
- Hizli islemler (talep formuna yonlendirir)

### 4.3 app/[city]/page.tsx (Sehir sayfasi)
- Sehre ozel ilanlar listesi.
- Filtreler:
  - Durum: Satilik/Kiralik
  - Kategori: Konut/Arsa/Ticari...
  - Fiyat min/max
  - Ilce/Mahalle

### 4.4 app/listings/[id]/page.tsx (Ilan detayi)
- Ilandan gelen detaylar gosterilir.
- Galeri ve harita entegrasyonu (koordinat varsa).

### 4.5 app/firsatlar/page.tsx
- Firsat ilanlari (isOpportunity=true).

### 4.6 app/admin/*
- admin/login: giris formu (JWT alir).
- admin: yonetim paneli ana sayfa.
- admin/listings: ilan ekle/guncelle/sil + gorsel yonetimi.
- admin/requests: talepleri gor/ durum guncelle.
- admin/cities, admin/branches, admin/consultants:
  - Sehir/sube/danisman yonetimi.

### 4.7 app/requests/*
- requests/customer:
  - Musteri talep formu (satmak/kiralamak/degerleme).
- requests/consultant:
  - Danisman talep formu (giris gerektirir).

### 4.8 lib/api.ts
- API ile konusmak icin fetch helper'lari.
- Ornek: fetchJson("/listings")

### 4.9 lib/listings.ts
- Fiyat formatlama, durum etiketi, gorsel URL cozumleme.
- Ornek: resolveImageUrl("/uploads/abc.jpg") -> http://localhost:3001/uploads/abc.jpg

## 5) ORNEK CALISMA SENARYOLARI
### Senaryo 1: Admin ilan ekler
1) /admin/login giris yapilir, token alinir.
2) /admin/listings sayfasinda ilan formu doldurulur.
3) API: POST /listings ile DB'ye kaydedilir.
4) Web anasayfada yeni ilan gorunur.

### Senaryo 2: Fotograf ekleme
1) /admin/listings sayfasinda ilan secilir.
2) URL ile gorsel eklenir veya dosya yuklenir.
3) API: /listings/:id/images veya /upload
4) Ilanda kapak gorsel gorunur.

### Senaryo 3: Musteri talebi
1) /requests/customer formu doldurulur.
2) API: POST /requests/customer
3) Admin /admin/requests ekraninda talebi gorur.

## 6) RUN/KURULUM OZETI
- docker-compose up -d
- cd api && npm install && npx prisma migrate deploy && npm run db:seed && npm run start:dev
- cd web && npm install && npm run dev

## 7) ILERIDE YAPILAN HER DEGISIKLIK
Bu dosyanin en altina "Guncelleme Notu" basligi ile tarih + aciklama eklenecek.
Ornek:
- 2026-01-25: X modulu eklendi, Y sayfasi guncellendi.

## Guncelleme Notu
- 2026-01-25: Admin yonetimi (sehir/sube/danisman), ilan gorsel yukleme/optimizasyon,
  sehir filtreleri (durum/kategori/fiyat/ilce/mahalle), harita entegrasyonu,
  talepler ve rol bazli yetki kontrolu tamamlandi.
- 2026-01-25: Prisma baglantisi adapter ile duzeltildi ve API yeniden ayaga kaldirildi.
