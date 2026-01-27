## Son Yapilanlar
- API: Branches endpointi eklendi (GET /branches).
- API: Listings filtreleri genisletildi (citySlug, branchSlug, take, skip).
- Seed: Prisma seed dosyasi ve `npm run db:seed` eklendi.
- Web: Ana sayfa, sehir ve ilan detay sayfalari API'ye baglandi.
- Web: Admin login formu ve giris kontrolu eklendi.
- Web: Admin ilan listesi ve ilan ekleme formu eklendi.
- Web: Admin ilan guncelleme ve silme eklendi.
- Web: Admin ilanlara URL ile gorsel ekleme/kapak/silme eklendi.
- Web: Musteri talep formu ve admin talepler listesi eklendi.
- Web: Firsatlar sayfasi eklendi.
- Web/API: Dosyadan gorsel yukleme eklendi (upload).
- API: Danisman listesi ve talep durum guncelleme eklendi.
- Web: Danisman talep formu ve talep durum guncelleme eklendi.
- Web/API: Sehir, sube ve danisman yonetimi eklendi.
- Web: Sehir sayfasi icin temel filtreler eklendi (durum/kategori).
- Web: Sehir sayfasina fiyat filtresi eklendi.
- Web/API: Ilce ve mahalle filtreleri eklendi.
- Web: Ilan detayda harita entegrasyonu (koordinat varsa).
- API: Gorsel optimizasyonu (max 1600px) eklendi.
- API: Rol bazli yetki kontrolu (ADMIN/MANAGER) eklendi.
- Web: Dinamik sitemap ve sayfa metadatasi eklendi.
- Proje: Uretim kurulum notlari eklendi (DEPLOY.md).
- API: Basit HTTP loglama eklendi.

## Tamamen Hazir Olmasi Icın Kalanlar
1) Tamamlandi.

## Calistirma Adimlari
1) Postgres:
   - `docker-compose up -d`
2) API:
   - `cd api`
   - `npm install`
   - `npx prisma migrate deploy`
   - `npm run db:seed`
   - `npm run start:dev`
3) Web:
   - `cd web`
   - `npm install`
   - `npm run dev`

## Notlar
- Varsayilan API: http://localhost:3001
- Varsayilan Web: http://localhost:3000
- Seed kullanicilar:
  - admin@ozcanaktas.com / ChangeMe123!
  - danisman@ozcanaktas.com / Consultant123!
