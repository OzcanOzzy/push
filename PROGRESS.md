## Ozet
Bu proje Next.js (web), NestJS (api) ve PostgreSQL ile bir emlak sitesi altyapisi olarak kuruldu.
Asagida mevcut durum ve siradaki adimlar var.

## Mevcut durum
- web: Next.js app router ile sabit sayfa taslaklari (anasayfa, sehir, ilan detayi, admin paneli, admin login).
- api: NestJS + Prisma ile auth (JWT), listings ve requests endpointleri hazir.
- db: Postgres icin docker-compose mevcut.

## API endpointleri
- POST /auth/login
- GET /listings
- GET /listings/:id
- POST /listings (JWT gerekiyor)
- PATCH /listings/:id (JWT gerekiyor)
- POST /requests/customer
- GET /requests/customer (JWT gerekiyor)
- POST /requests/consultant (JWT gerekiyor)
- GET /requests/consultant (JWT gerekiyor)

## UI sayfalari
- / : Ana sayfa (subeler, hizli islemler, harita placeholder, son ilanlar)
- /[city] : Sehir sayfasi (filtreler + ilan listesi)
- /listings/[id] : Ilan detay sayfasi
- /admin : Yonetim panel taslagi
- /admin/login : Danisman girisi

## Kurulum notlari
- Postgres docker-compose ile ayakta:
  - container: ozcanaktasweb-postgres
  - db: ozcanaktasweb
  - user: postgres / pass: postgres
- Prisma schema: api/prisma/schema.prisma
- Seed dosyasi: api/prisma/seed.ts (npm run db:seed)

## Siradaki adimlar (plan)
1) API icin .env olustur (DATABASE_URL, JWT_SECRET).
2) Prisma migrate + seed veri (sehir, sube, ilan, danisman).
3) Web tarafini API ile bagla:
   - Ana sayfada son ilanlari API'den cek.
   - /[city] sayfasinda sehir slug ile ilanlari listele.
   - /listings/[id] sayfasinda ilan detayi cek.
4) Admin login ve JWT saklama (cookie/local storage) + korumali istekler.
5) Iletisim ve talep formlarini API'ye bagla.
