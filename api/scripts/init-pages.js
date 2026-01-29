const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

const pages = [
  {
    slug: 'hakkimizda',
    title: 'Hakkımızda',
    metaTitle: 'Hakkımızda - Emlaknomi',
    metaDescription: 'Gayrimenkul sektöründe güvenilir ve profesyonel hizmet.',
    isPublished: true,
    showInMenu: true,
    menuOrder: 1,
    template: 'about',
    content: [
      {
        id: 'block-1',
        type: 'html',
        content: `<h2 style="margin-bottom: 16px;">Emlaknomi</h2>
<p style="line-height: 1.8; margin-bottom: 16px;">
Emlaknomi, gayrimenkul sektöründe güvenilir ve profesyonel hizmet anlayışıyla müşterilerimize en iyi deneyimi sunmayı hedeflemektedir. Uzman kadromuz ve geniş portföyümüz ile konut, arsa, ticari gayrimenkul ve daha fazlası için yanınızdayız.
</p>
<p style="line-height: 1.8; margin-bottom: 16px;">
Müşteri memnuniyetini ön planda tutarak, alım, satım ve kiralama süreçlerinizde size rehberlik ediyoruz. Şeffaf iletişim ve profesyonel yaklaşımımızla sektörde fark yaratıyoruz.
</p>`,
      },
      {
        id: 'block-2',
        type: 'html',
        content: `<h3 style="margin-top: 24px; margin-bottom: 16px;">Neden Biz?</h3>
<ul style="line-height: 2; padding-left: 20px;">
  <li>Geniş gayrimenkul portföyü</li>
  <li>Deneyimli ve profesyonel ekip</li>
  <li>Şeffaf ve güvenilir hizmet</li>
  <li>Müşteri odaklı yaklaşım</li>
  <li>Hızlı ve etkili çözümler</li>
  <li>Piyasa analizi ve danışmanlık</li>
</ul>`,
      },
    ],
  },
  {
    slug: 'iletisim',
    title: 'İletişim',
    metaTitle: 'İletişim - Emlaknomi',
    metaDescription: 'Bizimle iletişime geçin.',
    isPublished: true,
    showInMenu: true,
    menuOrder: 2,
    template: 'contact',
    content: [
      {
        id: 'block-1',
        type: 'html',
        content: `<h3 style="margin-bottom: 16px;">Bize Ulaşın</h3>
<p style="line-height: 1.8;">
Gayrimenkul ihtiyaçlarınız için bizimle iletişime geçebilirsiniz. Profesyonel ekibimiz size en kısa sürede dönüş yapacaktır.
</p>`,
      },
    ],
  },
];

async function initPages(authToken) {
  console.log('📄 Varsayılan sayfalar kontrol ediliyor...\n');

  for (const page of pages) {
    try {
      // Check if page exists
      const checkRes = await fetch(`${API_BASE_URL}/pages/slug/${page.slug}`);
      
      if (checkRes.status === 404 || !checkRes.ok) {
        // Page doesn't exist, create it
        const createRes = await fetch(`${API_BASE_URL}/pages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(page),
        });

        if (createRes.ok) {
          console.log(`✅ "${page.title}" sayfası oluşturuldu`);
        } else {
          const error = await createRes.text();
          console.log(`❌ "${page.title}" oluşturulamadı: ${error}`);
        }
      } else {
        console.log(`⏭️  "${page.title}" sayfası zaten mevcut`);
      }
    } catch (error) {
      console.error(`❌ Hata (${page.title}):`, error.message);
    }
  }

  console.log('\n✅ İşlem tamamlandı');
}

// Get auth token from command line argument
const authToken = process.argv[2];

if (!authToken) {
  console.error('❌ Kullanım: node scripts/init-pages.js <AUTH_TOKEN>');
  console.error('   Auth token almak için admin/login sayfasından giriş yapın.');
  process.exit(1);
}

initPages(authToken);
