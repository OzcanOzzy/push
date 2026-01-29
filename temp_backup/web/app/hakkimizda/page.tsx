"use client";

import { useSettings } from "../components/SettingsProvider";

export default function AboutPage() {
  const settings = useSettings();

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">Hakkımızda</div>
        <div className="card">
          <div className="card-body">
            <h2 style={{ marginBottom: 16 }}>{settings.siteName}</h2>
            <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
              {settings.siteName}, gayrimenkul sektöründe güvenilir ve profesyonel
              hizmet anlayışıyla müşterilerimize en iyi deneyimi sunmayı
              hedeflemektedir. Uzman kadromuz ve geniş portföyümüz ile konut,
              arsa, ticari gayrimenkul ve daha fazlası için yanınızdayız.
            </p>
            <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
              Müşteri memnuniyetini ön planda tutarak, alım, satım ve kiralama
              süreçlerinizde size rehberlik ediyoruz. Şeffaf iletişim ve
              profesyonel yaklaşımımızla sektörde fark yaratıyoruz.
            </p>
            <div style={{ marginTop: 24, padding: 16, background: "var(--color-bg-alt)", borderRadius: 8 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                {settings.ownerName}
              </div>
              <div style={{ color: "var(--color-muted)" }}>
                {settings.ownerTitle}
              </div>
            </div>
          </div>
        </div>
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-body">
            <h3 style={{ marginBottom: 16 }}>Neden Biz?</h3>
            <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
              <li>Geniş gayrimenkul portföyü</li>
              <li>Deneyimli ve profesyonel ekip</li>
              <li>Şeffaf ve güvenilir hizmet</li>
              <li>Müşteri odaklı yaklaşım</li>
              <li>Hızlı ve etkili çözümler</li>
              <li>Piyasa analizi ve danışmanlık</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
