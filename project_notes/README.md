## Proje Durumu
Bu klasor, proje hakkinda "ne yapildi" ve "sonraki plan" bilgisini tutar.

### Mimari
- web: Next.js (app router)
- api: NestJS + Prisma
- db: PostgreSQL (docker-compose)

### API Ozeti
- Auth: POST /auth/login (JWT)
- Listings: GET /listings, GET /listings/:id, POST /listings, PATCH /listings/:id
- Requests: POST /requests/customer, GET /requests/customer, POST /requests/consultant, GET /requests/consultant
- Branches: GET /branches

### Web Sayfalari
- / : Ana sayfa (subeler + son ilanlar API'den)
- /[city] : Sehir sayfasi (API'den ilan listesi)
- /listings/[id] : Ilan detay (API'den ilan bilgisi)
- /admin : Yonetim panel taslagi
- /admin/login : Danisman giris taslagi

### Kurulum Ozeti
- Postgres: docker-compose ile (db: ozcanaktasweb, user/pass: postgres)
- API env: `api/.env` (DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN)
- Seed: `npm run db:seed` (api)
