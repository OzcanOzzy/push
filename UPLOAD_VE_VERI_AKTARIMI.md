# Uploads Kopyalama + İlan Verisi Aktarma + "Nerede Ne Var?" Rehberi

Bu rehber üç bölümden oluşur:
1. **A)** Lokal `api/uploads` klasörünü sunucuya kopyalama
2. **B)** Listing + ListingImage verisini lokalde export edip production’a import etme
3. **C)** Projenin nerede durduğu: lokal, GitHub, sunucu – detaylı açıklama

---

## A) Lokal `api/uploads` klasörünü sunucuya kopyalama

Bu işlem **sizin bilgisayarınızda** (Windows) yapılır. Sunucuya SSH ile bağlanıp dosyaları gönderirsiniz.

### 1. Sunucuya SSH ile bağlanabildiğinizi kontrol edin

- Sunucu IP: `209.38.236.87` (veya kullandığınız IP)
- Kullanıcı: `root`
- Bağlantı: `ssh root@209.38.236.87`

### 2. Uploads’ı sunucuya kopyalama (PowerShell – Windows)

**PowerShell’i yönetici olarak açın**, sonra proje klasörüne gidip şu komutu çalıştırın:

```powershell
cd c:\ozcanaktasweb

# Sunucuda uploads klasörünü oluştur (yoksa)
ssh root@209.38.236.87 "mkdir -p /root/ozcanaktasweb/ozcanaktasweb/api/uploads"

# Tüm uploads içeriğini (alt klasörler dahil) sunucuya kopyala
scp -r api\uploads\* root@209.38.236.87:/root/ozcanaktasweb/ozcanaktasweb/api/uploads/
```

- `api\uploads\*` = bilgisayarınızdaki tüm upload dosyaları  
- `root@209.38.236.87:.../api/uploads/` = sunucudaki hedef klasör  

Şifre (veya SSH key) istenecektir. Bittikten sonra sunucudaki `api/uploads` içi lokal ile aynı olur.

### 3. Alternatif: Sadece belirli alt klasörleri kopyalamak

```powershell
# Sadece city-buttons
scp -r api\uploads\city-buttons root@209.38.236.87:/root/ozcanaktasweb/ozcanaktasweb/api/uploads/

# Sadece kök uploads (city-buttons dışındaki dosyalar)
scp -r api\uploads\*.png api\uploads\*.jpg root@209.38.236.87:/root/ozcanaktasweb/ozcanaktasweb/api/uploads/
```

---

## B) Listing + ListingImage export/import (lokal → production)

İlanlar ve ilan görselleri **veritabanında** (Listing, ListingImage tabloları) ve **dosya sisteminde** (uploads) tutulur.  
Önce **veriyi** aktarırız; görsel dosyalarını zaten A) ile kopyaladık.

### B1. Lokal veritabanından export (sizin bilgisayarınızda)

Lokal veritabanı Docker’da çalışıyor: `ozcanaktasweb-postgres`.

**1) Export SQL dosyası oluşturma (PowerShell):**

PostgreSQL’de tablo adları büyük harfle yazılmış (Listing, ListingImage vb.). PowerShell’de tırnakları aşağıdaki gibi kullanın:

```powershell
cd c:\ozcanaktasweb

# Listing + ListingImage + ilişkili Branch, City, District, Neighborhood verisini INSERT formatında dışa aktar
docker exec ozcanaktasweb-postgres pg_dump -U postgres -d ozcanaktasweb --data-only --inserts -t '"City"' -t '"District"' -t '"Neighborhood"' -t '"Branch"' -t '"Listing"' -t '"ListingImage"' -f /tmp/listing_export.sql
```

Eğer "no matching tables" hatası alırsanız, export’u container içinde yapın:

```powershell
docker exec -it ozcanaktasweb-postgres bash
```

Container içinde:

```bash
pg_dump -U postgres -d ozcanaktasweb --data-only --inserts -t '"City"' -t '"District"' -t '"Neighborhood"' -t '"Branch"' -t '"Listing"' -t '"ListingImage"' -f /tmp/listing_export.sql
exit
```

Sonra yine `docker cp` ile dosyayı alın (B1 adım 2).

**2) SQL dosyasını container’dan bilgisayara al:**

```powershell
docker cp ozcanaktasweb-postgres:/tmp/listing_export.sql ./listing_export.sql
```

Böylece `c:\ozcanaktasweb\listing_export.sql` dosyası oluşur.

**3) Bu dosyayı sunucuya kopyala:**

```powershell
scp listing_export.sql root@209.38.236.87:/root/ozcanaktasweb/ozcanaktasweb/
```

### B2. Production veritabanına import (sunucuda)

**Sunucuda SSH ile bağlanın**, sonra:

```bash
cd /root/ozcanaktasweb/ozcanaktasweb/api
```

**Import script’i (Node ile – production DB’ye bağlanır):**

```bash
# Önce .env'deki DATABASE_URL production'ı gösteriyor olmalı
# Tek seferde çalıştırın (satır sonuna kadar):
NODE_TLS_REJECT_UNAUTHORIZED=0 node -e "
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const sql = fs.readFileSync('/root/ozcanaktasweb/ozcanaktasweb/listing_export.sql', 'utf8');
  await client.query(sql);
  console.log('Listing + ListingImage import tamamlandı.');
  await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
"
```

**Not:** Eğer “duplicate key” veya “foreign key” hatası alırsanız:

- **City / District / Neighborhood / Branch** zaten production’da varsa, SQL dosyasında sadece **Listing** ve **ListingImage** satırlarını bırakıp tekrar deneyebilirsiniz; veya
- Lokal’de az sayıda ilan seçip sadece onları export edebilirsiniz (manuel SQL düzenlemesi gerekir).

Görsel dosyalarının production’da görünmesi için A) adımını (uploads kopyalama) mutlaka yapmış olmalısınız; ayrıca API’nin uploads’ı doğru path’ten servis ettiğinden emin olun (örn. `https://esesev.com/uploads/...` veya `https://esesev.com/api/uploads/...`).

---

## C) Projenin nerede durduğu: Lokal, GitHub, Sunucu

“Cursor’daki localdeki dosyaların tümü sanalda nerede duruyor?” ve “sanaldan nasıl değiştiririz?” sorularına net cevap:

### 1. Üç yer var

| Yer | Ne burası? | Konum (örnek) | Ne işe yarar? |
|-----|------------|----------------|---------------|
| **Lokal (sizin PC)** | Cursor’da açtığınız proje | `c:\ozcanaktasweb\` | Kod ve dosya burada **düzenlenir**. Değişiklikler önce burada yapılır. |
| **GitHub (bulut)** | Git deposu | `github.com/<kullanici>/ozcanaktasweb` | Kodu **saklar**. Siz `git push` yapınca lokal kod buraya gider. Deploy (GitHub Actions) bu repodan sunucuya bakar. |
| **Sunucu (sanal makine)** | Canlı sitenin çalıştığı sunucu | `/root/ozcanaktasweb/ozcanaktasweb/` (DigitalOcean droplet) | **Yayındaki site** burada çalışır. Kod buraya **deploy** ile kopyalanır; siz burada elle kod yazmazsınız. |

Yani:

- **Tüm kaynak kod** hem lokalde hem (push ettikten sonra) GitHub’da, hem de deploy sonrası sunucuda **kopya** olarak durur.
- **Tek “kaynak”** sizin lokaldeki klasör; sunucudaki kod, GitHub’daki koddan (ve dolaylı olarak lokalinizden) gelen bir kopyadır.

### 2. Lokal = Cursor’daki dosyalar

- **Konum:** `c:\ozcanaktasweb\` (veya projeyi açtığınız klasör).
- Bu klasördeki her şey (web, api, prisma, .github, vb.) **sadece sizin bilgisayarınızda**.
- Cursor’da “dosyayı değiştirdim” dediğinizde değişen, **bu lokal klasör**dür.
- Buradaki dosyaların “tamamı” önce **GitHub’a** push edilir, sonra **deploy** ile sunucuya gider; yani “bir kısmı bir yerde, bir kısmı başka yerde” değil, **aynı proje üç yerde kopya** halinde durur:
  - Lokal: siz düzenlersiniz.
  - GitHub: siz push edersiniz.
  - Sunucu: GitHub Actions deploy ile güncellenir.

### 3. Sanal (sunucu) nerede, ne var?

- **Sunucu:** DigitalOcean’daki bir “droplet” (sanal makine). Örnek IP: `209.38.236.87`.
- **Proje yolu:** Genelde `DEPLOY_PATH` ile belirlenir, örn. `/root/ozcanaktasweb/ozcanaktasweb/`.
- Bu path’in içinde:
  - `web/`  → Next.js (site)
  - `api/`  → NestJS (API)
  - `api/uploads/` → Yüklenen görseller (banner, şube, ilan vb.)
  - `api/.env` → Production ortam değişkenleri (şifreler, DB URL vb.)
  - `api/prisma/` → Şema ve migration’lar
- **Veritabanı:** Proje dosyalarından **ayrı**; DigitalOcean Managed Database (PostgreSQL). Yani “dosyalar” sunucu diskinde, “veriler” (ilanlar, kullanıcılar, ayarlar) veritabanında.

Özet:  
- **Kod + uploads klasörü** = sunucu diskinde (`/root/ozcanaktasweb/ozcanaktasweb/`).  
- **İlanlar, ayarlar, menüler vb.** = production veritabanında (ayrı bir PostgreSQL).

### 4. “Sanaldan nasıl değiştiririz?” (Doğru yöntem)

- **Doğru ve kalıcı yöntem:** Değişikliği **lokal’de** (Cursor’da) yapın → **commit** → **push** → **Deploy** (GitHub Actions) çalışsın → sunucu otomatik güncellenir.
- **Sanal (sunucu) tarafında** doğrudan dosya açıp kod yazmak **önerilmez**; çünkü bir sonraki deploy’da bu dosyalar yeniden kopyalanır ve sunucuda yaptığınız değişiklikler silinir.
- Sunucuda **sadece** şunlar kalıcı ve “elle” yapılır:
  - `.env` (API/web ortam değişkenleri)
  - `api/uploads/` (A) ile kopyaladığınız veya yeni yüklenen dosyalar)
  - Veritabanı (import/export, ayar değişiklikleri vb.)

Yani: **Kod değişikliği = hep Cursor (lokal) → push → deploy.**  
Sanal tarafta sadece **veri** ve **ortam** ile oynanır.

### 5. Kısa özet

- **Lokal (Cursor):** `c:\ozcanaktasweb\` – tüm kod burada, siz buradan değiştirirsiniz.
- **GitHub:** Push edilen kodun bulut kopyası; deploy buradan alır.
- **Sunucu:** `/root/ozcanaktasweb/ozcanaktasweb/` – canlı site; kod deploy ile güncellenir, uploads ve .env sizin kopyaladığınız / ayarladığınız şekilde kalır.
- **Veritabanı:** Ayrı (DigitalOcean DB); ilanlar ve ayarlar burada.

Bu rehberi takip ederek hem uploads’ı kopyalayabilir (A), hem ilan verisini taşıyabilir (B), hem de “nerede ne var, nasıl değiştiririz?” sorusunu netleştirmiş olursunuz (C).
