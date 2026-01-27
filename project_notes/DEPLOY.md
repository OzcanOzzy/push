## Uretim Ortami Notlari

### Gereken Degiskenler
- api/.env:
  - DATABASE_URL
  - JWT_SECRET
  - JWT_EXPIRES_IN
  - CORS_ORIGIN
- web/.env:
  - NEXT_PUBLIC_API_URL
  - NEXT_PUBLIC_SITE_URL

### API Uretim
1) `npm install`
2) `npx prisma migrate deploy`
3) `npm run start:prod`

### Web Uretim
1) `npm install`
2) `npm run build`
3) `npm run start`

### Dosya Yukleme
- API tarafinda `uploads/` klasoru kalici bir volume olarak saklanmali.
- Reverse proxy ile `/uploads/*` erisimi acik olmalidir.
