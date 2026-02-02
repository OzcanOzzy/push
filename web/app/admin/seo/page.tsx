"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type SeoSettings = {
  // Basic SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  ogType: string;
  twitterHandle: string;
  canonicalUrl: string;
  // Analytics
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  // Schema.org
  schemaOrgType: string;
  schemaOrgName: string;
  schemaOrgDescription: string;
  schemaOrgAddress: string;
  schemaOrgCity: string;
  schemaOrgRegion: string;
  schemaOrgPostalCode: string;
  schemaOrgCountry: string;
  schemaOrgTelephone: string;
  schemaOrgPriceRange: string;
  schemaOrgOpeningHours: string;
  // Verification
  googleSiteVerification: string;
  bingSiteVerification: string;
  yandexVerification: string;
};

const defaultSeo: SeoSettings = {
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImage: "",
  ogType: "website",
  twitterHandle: "",
  canonicalUrl: "",
  googleAnalyticsId: "",
  googleTagManagerId: "",
  facebookPixelId: "",
  schemaOrgType: "RealEstateAgent",
  schemaOrgName: "",
  schemaOrgDescription: "",
  schemaOrgAddress: "",
  schemaOrgCity: "",
  schemaOrgRegion: "",
  schemaOrgPostalCode: "",
  schemaOrgCountry: "TR",
  schemaOrgTelephone: "",
  schemaOrgPriceRange: "₺₺₺",
  schemaOrgOpeningHours: "Mo-Sa 09:00-18:00",
  googleSiteVerification: "",
  bingSiteVerification: "",
  yandexVerification: "",
};

export default function AdminSeoPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [settings, setSettings] = useState<SeoSettings>(defaultSeo);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState<"basic" | "analytics" | "schema" | "verification">("basic");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    if (token) {
      loadSettings(token);
    }
  }, []);

  const loadSettings = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings({ ...defaultSeo, ...data });
      }
    } catch (err) {
      console.error("Load error:", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "SEO ayarları başarıyla kaydedildi!" });
      } else {
        setMessage({ type: "error", text: "Kaydetme başarısız oldu." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Bir hata oluştu." });
    } finally {
      setSaving(false);
    }
  };

  if (!isReady) return null;

  if (!isAuthed) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <div className="admin-card">
            <h2>SEO Ayarları</h2>
            <p>Bu sayfaya erişmek için giriş yapmalısınız.</p>
            <Link href="/admin/login" className="btn btn-primary">Giriş Yap</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">
            <i className="fa-solid fa-chart-line"></i> SEO & Analitik Ayarları
          </h1>
          <div className="admin-actions">
            <Link href="/admin" className="btn btn-secondary">
              <i className="fa-solid fa-arrow-left"></i> Yönetim Paneli
            </Link>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <i className="fa-solid fa-save"></i> {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`admin-card ${message.type === "error" ? "error" : "success"}`} style={{ marginBottom: 20, padding: 16, background: message.type === "error" ? "#fef2f2" : "#f0fdf4", borderColor: message.type === "error" ? "#fca5a5" : "#86efac" }}>
            <p style={{ margin: 0, color: message.type === "error" ? "#dc2626" : "#16a34a" }}>{message.text}</p>
          </div>
        )}

        {/* SEO Score Preview */}
        <div className="admin-card" style={{ marginBottom: 24, background: "linear-gradient(135deg, #0a4ea3 0%, #1e3a5f 100%)", color: "#fff" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 18 }}>
            <i className="fa-solid fa-gauge-high"></i> SEO Durumu
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Meta Title</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{settings.metaTitle ? "✓" : "✗"}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Meta Description</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{settings.metaDescription ? "✓" : "✗"}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Google Analytics</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{settings.googleAnalyticsId ? "✓" : "✗"}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Schema.org</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{settings.schemaOrgName ? "✓" : "✗"}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          <button
            className={`btn ${activeTab === "basic" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("basic")}
          >
            <i className="fa-solid fa-tags"></i> Temel SEO
          </button>
          <button
            className={`btn ${activeTab === "analytics" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("analytics")}
          >
            <i className="fa-solid fa-chart-bar"></i> Analitik
          </button>
          <button
            className={`btn ${activeTab === "schema" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("schema")}
          >
            <i className="fa-solid fa-code"></i> Schema.org
          </button>
          <button
            className={`btn ${activeTab === "verification" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("verification")}
          >
            <i className="fa-solid fa-check-circle"></i> Doğrulama
          </button>
        </div>

        {/* Basic SEO Tab */}
        {activeTab === "basic" && (
          <div className="admin-card">
            <h3 style={{ margin: "0 0 20px", fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-tags"></i> Temel SEO Ayarları
            </h3>
            
            <div className="form-group">
              <label className="form-label">
                Meta Title (Sayfa Başlığı)
                <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 8 }}>
                  Önerilen: 50-60 karakter ({settings.metaTitle?.length || 0}/60)
                </span>
              </label>
              <input
                className="form-input"
                value={settings.metaTitle || ""}
                onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                placeholder="Emlaknomi - Gayrimenkul Uzmanı | Satılık & Kiralık İlanlar"
                maxLength={70}
              />
              <small style={{ color: "#6b7280" }}>Google arama sonuçlarında görünen başlık</small>
            </div>

            <div className="form-group">
              <label className="form-label">
                Meta Description (Açıklama)
                <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 8 }}>
                  Önerilen: 150-160 karakter ({settings.metaDescription?.length || 0}/160)
                </span>
              </label>
              <textarea
  className="form-textarea"
  // settings.metaDescription null ise boş bir metin ("") kullan
  value={settings.metaDescription || ""} 
  onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
  rows={5} // (varsa diğer özellikler)
/>
                placeholder="Türkiye'nin önde gelen gayrimenkul danışmanlık firması. Satılık ve kiralık konut, arsa, ticari gayrimenkul ilanları."
                maxLength={170}
                rows={3}
              />
              <small style={{ color: "#6b7280" }}>Google arama sonuçlarında görünen açıklama</small>
            </div>

            <div className="form-group">
              <label className="form-label">Meta Keywords (Anahtar Kelimeler)</label>
              <input
                className="form-input"
                value={settings.metaKeywords}
                onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
                placeholder="emlak, gayrimenkul, satılık, kiralık, konut, arsa, daire"
              />
              <small style={{ color: "#6b7280" }}>Virgülle ayırarak yazın</small>
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 24, paddingTop: 24 }}>
              <h4 style={{ margin: "0 0 16px", fontSize: 16 }}>
                <i className="fa-brands fa-facebook"></i> Open Graph (Sosyal Medya)
              </h4>
              
              <div className="form-group">
                <label className="form-label">OG Image (Paylaşım Görseli)</label>
                <input
                  className="form-input"
                  value={settings.ogImage}
                  onChange={(e) => setSettings({ ...settings, ogImage: e.target.value })}
                  placeholder="https://example.com/og-image.jpg"
                />
                <small style={{ color: "#6b7280" }}>Sosyal medyada paylaşıldığında görünen resim (1200x630px önerilir)</small>
              </div>

              <div className="form-group">
                <label className="form-label">OG Type</label>
                <select
                  className="form-select"
                  value={settings.ogType}
                  onChange={(e) => setSettings({ ...settings, ogType: e.target.value })}
                >
                  <option value="website">website</option>
                  <option value="business.business">business.business</option>
                  <option value="place">place</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Twitter Handle</label>
                <input
                  className="form-input"
                  value={settings.twitterHandle}
                  onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
                  placeholder="@emlaknomi"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Canonical URL</label>
                <input
                  className="form-input"
                  value={settings.canonicalUrl}
                  onChange={(e) => setSettings({ ...settings, canonicalUrl: e.target.value })}
                  placeholder="https://www.ozcanaktas.com"
                />
                <small style={{ color: "#6b7280" }}>Sitenizin ana URL adresi</small>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="admin-card">
            <h3 style={{ margin: "0 0 20px", fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-chart-bar"></i> Analitik Araçları
            </h3>

            <div className="form-group">
              <label className="form-label">
                <i className="fa-brands fa-google" style={{ marginRight: 8 }}></i>
                Google Analytics 4 (GA4) Ölçüm ID
              </label>
              <input
                className="form-input"
                value={settings.googleAnalyticsId}
                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
              />
              <small style={{ color: "#6b7280" }}>
                Google Analytics hesabınızdan alın: Admin → Data Streams → Web → Measurement ID
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fa-brands fa-google" style={{ marginRight: 8 }}></i>
                Google Tag Manager ID
              </label>
              <input
                className="form-input"
                value={settings.googleTagManagerId}
                onChange={(e) => setSettings({ ...settings, googleTagManagerId: e.target.value })}
                placeholder="GTM-XXXXXXX"
              />
              <small style={{ color: "#6b7280" }}>
                Tüm etiketleri tek bir yerden yönetmek için
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fa-brands fa-facebook" style={{ marginRight: 8 }}></i>
                Facebook Pixel ID
              </label>
              <input
                className="form-input"
                value={settings.facebookPixelId}
                onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })}
                placeholder="XXXXXXXXXXXXXXX"
              />
              <small style={{ color: "#6b7280" }}>
                Facebook reklam dönüşümlerini izlemek için
              </small>
            </div>

            <div style={{ background: "#f0f9ff", padding: 16, borderRadius: 8, marginTop: 24 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#0369a1" }}>
                <i className="fa-solid fa-info-circle"></i> Nasıl Çalışır?
              </h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#0369a1" }}>
                <li>Google Analytics: Ziyaretçi sayısı, sayfa görüntüleme, davranış analizi</li>
                <li>Google Tag Manager: Tek kod ile tüm izleme scriptlerini yönetin</li>
                <li>Facebook Pixel: Reklam performansı ve retargeting</li>
              </ul>
            </div>
          </div>
        )}

        {/* Schema.org Tab */}
        {activeTab === "schema" && (
          <div className="admin-card">
            <h3 style={{ margin: "0 0 20px", fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-code"></i> Schema.org (Yapılandırılmış Veri)
            </h3>
            <p style={{ color: "#6b7280", marginBottom: 20 }}>
              Google'ın sitenizi daha iyi anlaması ve zengin arama sonuçları göstermesi için
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">İşletme Türü</label>
                <select
                  className="form-select"
                  value={settings.schemaOrgType}
                  onChange={(e) => setSettings({ ...settings, schemaOrgType: e.target.value })}
                >
                  <option value="RealEstateAgent">Emlak Danışmanlığı</option>
                  <option value="LocalBusiness">Yerel İşletme</option>
                  <option value="Organization">Kuruluş</option>
                  <option value="ProfessionalService">Profesyonel Hizmet</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">İşletme Adı</label>
                <input
                  className="form-input"
                  value={settings.schemaOrgName}
                  onChange={(e) => setSettings({ ...settings, schemaOrgName: e.target.value })}
                  placeholder="Emlaknomi - Özcan Aktaş"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">İşletme Açıklaması</label>
              <textarea
                className="form-textarea"
                value={settings.schemaOrgDescription}
                onChange={(e) => setSettings({ ...settings, schemaOrgDescription: e.target.value })}
                placeholder="Profesyonel gayrimenkul danışmanlık hizmetleri..."
                rows={2}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Adres</label>
                <input
                  className="form-input"
                  value={settings.schemaOrgAddress}
                  onChange={(e) => setSettings({ ...settings, schemaOrgAddress: e.target.value })}
                  placeholder="Atatürk Cad. No:123"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Şehir</label>
                <input
                  className="form-input"
                  value={settings.schemaOrgCity}
                  onChange={(e) => setSettings({ ...settings, schemaOrgCity: e.target.value })}
                  placeholder="Konya"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bölge/İl</label>
                <input
                  className="form-input"
                  value={settings.schemaOrgRegion}
                  onChange={(e) => setSettings({ ...settings, schemaOrgRegion: e.target.value })}
                  placeholder="Konya"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Posta Kodu</label>
                <input
                  className="form-input"
                  value={settings.schemaOrgPostalCode}
                  onChange={(e) => setSettings({ ...settings, schemaOrgPostalCode: e.target.value })}
                  placeholder="42000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ülke Kodu</label>
                <input
                  className="form-input"
                  value={settings.schemaOrgCountry}
                  onChange={(e) => setSettings({ ...settings, schemaOrgCountry: e.target.value })}
                  placeholder="TR"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefon</label>
                <input
                  className="form-input"
                  value={settings.schemaOrgTelephone}
                  onChange={(e) => setSettings({ ...settings, schemaOrgTelephone: e.target.value })}
                  placeholder="+90 543 306 14 99"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fiyat Aralığı</label>
                <select
                  className="form-select"
                  value={settings.schemaOrgPriceRange}
                  onChange={(e) => setSettings({ ...settings, schemaOrgPriceRange: e.target.value })}
                >
                  <option value="₺">₺ (Ekonomik)</option>
                  <option value="₺₺">₺₺ (Orta)</option>
                  <option value="₺₺₺">₺₺₺ (Üst Segment)</option>
                  <option value="₺₺₺₺">₺₺₺₺ (Lüks)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Çalışma Saatleri</label>
                <input
                  className="form-input"
                  value={settings.schemaOrgOpeningHours}
                  onChange={(e) => setSettings({ ...settings, schemaOrgOpeningHours: e.target.value })}
                  placeholder="Mo-Sa 09:00-18:00"
                />
                <small style={{ color: "#6b7280" }}>ISO 8601 formatı: Mo-Fr 09:00-17:00</small>
              </div>
            </div>
          </div>
        )}

        {/* Verification Tab */}
        {activeTab === "verification" && (
          <div className="admin-card">
            <h3 style={{ margin: "0 0 20px", fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-check-circle"></i> Site Doğrulama Kodları
            </h3>
            <p style={{ color: "#6b7280", marginBottom: 20 }}>
              Arama motorlarına sitenizin size ait olduğunu kanıtlayın
            </p>

            <div className="form-group">
              <label className="form-label">
                <i className="fa-brands fa-google" style={{ marginRight: 8 }}></i>
                Google Search Console
              </label>
              <input
                className="form-input"
                value={settings.googleSiteVerification}
                onChange={(e) => setSettings({ ...settings, googleSiteVerification: e.target.value })}
                placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              />
              <small style={{ color: "#6b7280" }}>
                Google Search Console → Settings → Ownership verification → HTML tag → content değeri
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fa-brands fa-microsoft" style={{ marginRight: 8 }}></i>
                Bing Webmaster Tools
              </label>
              <input
                className="form-input"
                value={settings.bingSiteVerification}
                onChange={(e) => setSettings({ ...settings, bingSiteVerification: e.target.value })}
                placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fa-brands fa-yandex" style={{ marginRight: 8 }}></i>
                Yandex Webmaster
              </label>
              <input
                className="form-input"
                value={settings.yandexVerification}
                onChange={(e) => setSettings({ ...settings, yandexVerification: e.target.value })}
                placeholder="XXXXXXXXXXXXXXXX"
              />
            </div>

            <div style={{ background: "#fef3c7", padding: 16, borderRadius: 8, marginTop: 24 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#92400e" }}>
                <i className="fa-solid fa-lightbulb"></i> İpucu
              </h4>
              <p style={{ margin: 0, fontSize: 13, color: "#92400e" }}>
                Google Search Console'a kaydolarak sitenizin Google'da nasıl göründüğünü takip edebilir,
                hataları görebilir ve sitemap gönderebilirsiniz.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
