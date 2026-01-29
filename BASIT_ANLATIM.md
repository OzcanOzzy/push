# Basit Anlatım – Acemi İçin

## 1. Sitem nerede saklanıyor, yayında nerede?

Düşün ki **üç kutu** var:

| Kutu | Nerede? | Ne var? | Sen ne yaparsın? |
|------|--------|--------|------------------|
| **1. Senin bilgisayarın** | Cursor’u açtığın PC | Projenin **tüm kodu** (web, api, uploads klasörü vs.) | Burada **kod değiştirirsin**. Tek tıkla düzenleyebilirsin. |
| **2. GitHub** | İnternet (bulut) | Kodun bir **kopyası** | `push` yapınca kod buraya gider. “Yedek + dağıtım merkezi” gibi. |
| **3. Sunucu (sanal makine)** | DigitalOcean’da bir bilgisayar | **Yayındaki site** burada çalışır. Sitenin “yaşadığı yer” burası. | Kod **deploy** ile buraya kopyalanır. Sen burada dosya açıp kod yazmazsın. |

**Kısaca:**  
- **Kod = senin bilgisayarında** (Cursor’da düzenlersin).  
- **Yayındaki site = sunucuda** (DigitalOcean’daki o bilgisayar).  
Yani site “sanalda” derken kastettiğin yer = **sunucu** (3. kutu). Orada hem kod kopyası var hem de site oradan yayın yapıyor.

---

## 2. Kod değiştirmek istiyorum – nereden?

**Hep Cursor’dan (senin bilgisayarından).**

- Cursor’da dosyayı aç, değiştir, kaydet.  
- Sonra: commit → push → deploy (GitHub Actions) çalışsın.  
- Bir süre sonra sunucu güncellenir, sitede değişiklik görünür.

Sunucuya SSH ile girip orada dosya açmana gerek yok. Orada sadece “çalışan kopya” var; kalıcı düzenleme **hep Cursor’da**.

---

## 3. api/uploads’ı siteye nasıl yüklerim? (Tek komut)

Görseller (logo, banner, şube resimleri) `api/uploads` klasöründe. Bunları **sunucuya** kopyalamak için projede hazır bir script var.

**Cursor’da Terminal’i aç** (alt kısımda “Terminal” sekmesi).  
Proje klasöründe olduğundan emin ol (genelde `c:\ozcanaktasweb`).  
Şu komutu yazıp Enter’a bas:

```bash
npm run upload-files
```

Bu komut:

- `api/uploads` içindeki her şeyi alır  
- Sunucuya (DigitalOcean) gönderir  
- Tek seferde biter  

**İlk seferde:**  
- Sunucu adresi varsayılan: `root@209.38.236.87`. Farklıysa proje kökünde `.upload-server` dosyası oluştur, içine tek satır yaz: `root@SUNUCU_IP` (örnek: `root@209.38.236.87`).  
- Komut çalışırken SSH şifresi veya key isteyebilir; girersin.

Bundan sonra “api/uploads’ı siteye atalım” dediğinde sadece **Cursor’da `npm run upload-files`** demen yeterli.

---

## 4. Özet

- **Sitem nerede saklanıyor (yayındayken)?** → **Sunucuda** (DigitalOcean’daki bilgisayar). Kod oraya deploy ile gidiyor.  
- **Kodu nereden değiştireceğim?** → **Cursor’dan** (senin PC’ndeki proje). Sunucuda elle kod değiştirme.  
- **api/uploads’ı siteye nasıl atarım?** → Cursor’da Terminal’de: **`npm run upload-files`** yazman yeterli.

Bu kadar. Gerisi aynı mantık: Cursor’da değiştir → push → deploy; görseller için zaman zaman `npm run upload-files`.
