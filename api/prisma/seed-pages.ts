import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function seedPages() {
  console.log('📄 Varsayılan sayfalar ekleniyor...');

  // Hakkımızda sayfası
  const aboutExists = await prisma.pageSetting.findUnique({
    where: { slug: 'hakkimizda' },
  });

  if (!aboutExists) {
    await prisma.pageSetting.create({
      data: {
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
    });
    console.log('✅ Hakkımızda sayfası eklendi');
  } else {
    console.log('⏭️  Hakkımızda sayfası zaten mevcut');
  }

  // İletişim sayfası
  const contactExists = await prisma.pageSetting.findUnique({
    where: { slug: 'iletisim' },
  });

  if (!contactExists) {
    await prisma.pageSetting.create({
      data: {
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
    });
    console.log('✅ İletişim sayfası eklendi');
  } else {
    console.log('⏭️  İletişim sayfası zaten mevcut');
  }

  console.log('✅ Sayfa seed işlemi tamamlandı');
}

seedPages()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
