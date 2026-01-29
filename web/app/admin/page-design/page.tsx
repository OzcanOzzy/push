"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type PageDesignSettings = {
  id: string;
  pageType: string;
  pageName: string;
  // Header settings
  headerBgColor?: string | null;
  headerBgGradient?: string | null;
  headerBgImage?: string | null;
  headerNavColor?: string | null;
  headerNavFont?: string | null;
  headerNavFontSize?: number | null;
  showHeader?: boolean;
  // Footer settings
  footerBgColor?: string | null;
  footerBgGradient?: string | null;
  footerBgImage?: string | null;
  footerTextColor?: string | null;
  footerFont?: string | null;
  footerFontSize?: number | null;
  showFooter?: boolean;
  // Content area settings
  contentBgColor?: string | null;
  contentBgImage?: string | null;
  contentPadding?: number | null;
  contentMaxWidth?: number | null;
  // Banner settings
  showBanner?: boolean;
  bannerHeight?: number | null;
  bannerBgColor?: string | null;
  bannerBgImage?: string | null;
  // SEO settings
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  seoUrl?: string | null;
};

const defaultPageTypes = [
  { type: "home", name: "Ana Sayfa" },
  { type: "listings", name: "Tüm İlanlar" },
  { type: "listing-detail", name: "İlan Detay" },
  { type: "opportunities", name: "Fırsatlar" },
  { type: "branches", name: "Şubeler" },
  { type: "about", name: "Hakkımızda" },
  { type: "contact", name: "İletişim" },
  { type: "blog", name: "Blog" },
  { type: "blog-post", name: "Blog Yazısı" },
];

export default function PageDesignPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [settings, setSettings] = useState<PageDesignSettings[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("home");
  const [currentSettings, setCurrentSettings] = useState<PageDesignSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const headerBgInputRef = useRef<HTMLInputElement>(null);
  const footerBgInputRef = useRef<HTMLInputElement>(null);
  const contentBgInputRef = useRef<HTMLInputElement>(null);
  const bannerBgInputRef = useRef<HTMLInputElement>(null);

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
      const res = await fetch(`${API_BASE_URL}/page-design`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(Array.isArray(data) ? data : []);
      }
    } catch {
      // If no settings, create defaults
      setSettings([]);
    }
  };

  useEffect(() => {
    // Find or create settings for selected page
    const existing = settings.find((s) => s.pageType === selectedPage);
    if (existing) {
      setCurrentSettings(existing);
    } else {
      const pageInfo = defaultPageTypes.find((p) => p.type === selectedPage);
      setCurrentSettings({
        id: "",
        pageType: selectedPage,
        pageName: pageInfo?.name || selectedPage,
        showHeader: true,
        showFooter: true,
        showBanner: selectedPage === "home",
      });
    }
  }, [selectedPage, settings]);

  const handleChange = (field: keyof PageDesignSettings, value: string | number | boolean | null) => {
    if (!currentSettings) return;
    setCurrentSettings({ ...currentSettings, [field]: value });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof PageDesignSettings
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/settings/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          handleChange(field, `${API_BASE_URL}${data.url}`);
        }
      }
    } catch {
      setError("Dosya yüklenemedi.");
    }
  };

  const handleSave = async () => {
    if (!currentSettings) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Always POST to pageType endpoint - the API will upsert
      const url = `${API_BASE_URL}/page-design/${currentSettings.pageType}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pageName: currentSettings.pageName,
          headerBgColor: currentSettings.headerBgColor || null,
          headerBgGradient: currentSettings.headerBgGradient || null,
          headerBgImage: currentSettings.headerBgImage || null,
          headerNavColor: currentSettings.headerNavColor || null,
          headerNavFont: currentSettings.headerNavFont || null,
          headerNavFontSize: currentSettings.headerNavFontSize || null,
          showHeader: currentSettings.showHeader,
          footerBgColor: currentSettings.footerBgColor || null,
          footerBgGradient: currentSettings.footerBgGradient || null,
          footerBgImage: currentSettings.footerBgImage || null,
          footerTextColor: currentSettings.footerTextColor || null,
          footerFont: currentSettings.footerFont || null,
          footerFontSize: currentSettings.footerFontSize || null,
          showFooter: currentSettings.showFooter,
          contentBgColor: currentSettings.contentBgColor || null,
          contentBgImage: currentSettings.contentBgImage || null,
          contentPadding: currentSettings.contentPadding || null,
          contentMaxWidth: currentSettings.contentMaxWidth || null,
          showBanner: currentSettings.showBanner,
          bannerHeight: currentSettings.bannerHeight || null,
          bannerBgColor: currentSettings.bannerBgColor || null,
          bannerBgImage: currentSettings.bannerBgImage || null,
          metaTitle: currentSettings.metaTitle || null,
          metaDescription: currentSettings.metaDescription || null,
          metaKeywords: currentSettings.metaKeywords || null,
          seoUrl: currentSettings.seoUrl || null,
        }),
      });

      if (res.ok) {
        setSuccess("Ayarlar kaydedildi.");
        loadSettings(token);
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Kaydetme başarısız");
      }
    } catch (err) {
      console.error(err);
      setError("Ayarlar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Sayfa Tasarımı</div>
          <div className="card">
            <div className="card-body">Kontrol ediliyor...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Sayfa Tasarımı</div>
          <div className="card">
            <div className="card-body">
              Bu sayfayı görmek için giriş yapmalısınız.{" "}
              <Link href="/admin/login" className="btn btn-outline">
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">Sayfa Tasarımı</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
          <Link className="btn btn-outline" href="/admin">
            ← Yönetim Paneli
          </Link>
          <Link href="/" target="_blank" className="btn btn-outline">
            <i className="fa-solid fa-external-link-alt" style={{ marginRight: 6 }}></i>
            Siteyi Görüntüle
          </Link>
        </div>

        {error && (
          <div className="card" style={{ marginBottom: 16, background: "#fef2f2" }}>
            <div className="card-body" style={{ color: "#dc2626" }}>{error}</div>
          </div>
        )}
        {success && (
          <div className="card" style={{ marginBottom: 16, background: "#f0fdf4" }}>
            <div className="card-body" style={{ color: "#16a34a" }}>{success}</div>
          </div>
        )}

        <div className="layout-grid">
          <aside className="sidebar">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Sayfa Seçimi</div>
            <div style={{ display: "grid", gap: 8 }}>
              {defaultPageTypes.map((page) => (
                <button
                  key={page.type}
                  className={`btn ${selectedPage === page.type ? "" : "btn-outline"}`}
                  onClick={() => setSelectedPage(page.type)}
                >
                  {page.name}
                </button>
              ))}
            </div>
          </aside>

          <section>
            {currentSettings && (
              <div style={{ display: "grid", gap: 20 }}>
                {/* Header Settings */}
                <div className="card">
                  <div className="card-body">
                    <div style={{ fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="fa-solid fa-window-maximize"></i>
                      Header Ayarları - {currentSettings.pageName}
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <input
                        type="checkbox"
                        checked={currentSettings.showHeader !== false}
                        onChange={(e) => handleChange("showHeader", e.target.checked)}
                      />
                      Header'ı göster
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Arka Plan Rengi</label>
                        <div style={{ display: "flex", gap: 4 }}>
                          <input
                            type="color"
                            value={currentSettings.headerBgColor || "#0a4ea3"}
                            onChange={(e) => handleChange("headerBgColor", e.target.value)}
                            style={{ width: 40, height: 32 }}
                          />
                          <input
                            className="search-input"
                            value={currentSettings.headerBgColor || ""}
                            onChange={(e) => handleChange("headerBgColor", e.target.value)}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Yazı Rengi</label>
                        <div style={{ display: "flex", gap: 4 }}>
                          <input
                            type="color"
                            value={currentSettings.headerNavColor || "#ffffff"}
                            onChange={(e) => handleChange("headerNavColor", e.target.value)}
                            style={{ width: 40, height: 32 }}
                          />
                          <input
                            className="search-input"
                            value={currentSettings.headerNavColor || ""}
                            onChange={(e) => handleChange("headerNavColor", e.target.value)}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Gradyan</label>
                      <input
                        className="search-input"
                        placeholder="linear-gradient(to right, #0a4ea3, #1e3a5f)"
                        value={currentSettings.headerBgGradient || ""}
                        onChange={(e) => handleChange("headerBgGradient", e.target.value)}
                      />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Arka Plan Görseli</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="file"
                          ref={headerBgInputRef}
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileUpload(e, "headerBgImage")}
                        />
                        <button
                          className="btn btn-outline"
                          onClick={() => headerBgInputRef.current?.click()}
                        >
                          Yükle
                        </button>
                        <input
                          className="search-input"
                          placeholder="veya URL"
                          value={currentSettings.headerBgImage || ""}
                          onChange={(e) => handleChange("headerBgImage", e.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Font</label>
                        <input
                          className="search-input"
                          placeholder="Inter, sans-serif"
                          value={currentSettings.headerNavFont || ""}
                          onChange={(e) => handleChange("headerNavFont", e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Font Boyutu (px)</label>
                        <input
                          className="search-input"
                          type="number"
                          placeholder="14"
                          value={currentSettings.headerNavFontSize || ""}
                          onChange={(e) => handleChange("headerNavFontSize", Number(e.target.value) || null)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner Settings */}
                <div className="card">
                  <div className="card-body">
                    <div style={{ fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="fa-solid fa-image"></i>
                      Banner Ayarları
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <input
                        type="checkbox"
                        checked={currentSettings.showBanner === true}
                        onChange={(e) => handleChange("showBanner", e.target.checked)}
                      />
                      Banner'ı göster
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Yükseklik (px)</label>
                        <input
                          className="search-input"
                          type="number"
                          placeholder="300"
                          value={currentSettings.bannerHeight || ""}
                          onChange={(e) => handleChange("bannerHeight", Number(e.target.value) || null)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Arka Plan Rengi</label>
                        <div style={{ display: "flex", gap: 4 }}>
                          <input
                            type="color"
                            value={currentSettings.bannerBgColor || "#0a4ea3"}
                            onChange={(e) => handleChange("bannerBgColor", e.target.value)}
                            style={{ width: 40, height: 32 }}
                          />
                          <input
                            className="search-input"
                            value={currentSettings.bannerBgColor || ""}
                            onChange={(e) => handleChange("bannerBgColor", e.target.value)}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Banner Görseli</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="file"
                          ref={bannerBgInputRef}
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileUpload(e, "bannerBgImage")}
                        />
                        <button
                          className="btn btn-outline"
                          onClick={() => bannerBgInputRef.current?.click()}
                        >
                          Yükle
                        </button>
                        <input
                          className="search-input"
                          placeholder="veya URL"
                          value={currentSettings.bannerBgImage || ""}
                          onChange={(e) => handleChange("bannerBgImage", e.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Settings */}
                <div className="card">
                  <div className="card-body">
                    <div style={{ fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="fa-solid fa-file-alt"></i>
                      İçerik Alanı Ayarları
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Arka Plan Rengi</label>
                        <div style={{ display: "flex", gap: 4 }}>
                          <input
                            type="color"
                            value={currentSettings.contentBgColor || "#ffffff"}
                            onChange={(e) => handleChange("contentBgColor", e.target.value)}
                            style={{ width: 40, height: 32 }}
                          />
                          <input
                            className="search-input"
                            value={currentSettings.contentBgColor || ""}
                            onChange={(e) => handleChange("contentBgColor", e.target.value)}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Padding (px)</label>
                        <input
                          className="search-input"
                          type="number"
                          placeholder="24"
                          value={currentSettings.contentPadding || ""}
                          onChange={(e) => handleChange("contentPadding", Number(e.target.value) || null)}
                        />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Max Genişlik (px)</label>
                        <input
                          className="search-input"
                          type="number"
                          placeholder="1200"
                          value={currentSettings.contentMaxWidth || ""}
                          onChange={(e) => handleChange("contentMaxWidth", Number(e.target.value) || null)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Arka Plan Görseli</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            type="file"
                            ref={contentBgInputRef}
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => handleFileUpload(e, "contentBgImage")}
                          />
                          <button
                            className="btn btn-outline"
                            onClick={() => contentBgInputRef.current?.click()}
                          >
                            Yükle
                          </button>
                          <input
                            className="search-input"
                            placeholder="URL"
                            value={currentSettings.contentBgImage || ""}
                            onChange={(e) => handleChange("contentBgImage", e.target.value)}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Settings */}
                <div className="card">
                  <div className="card-body">
                    <div style={{ fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="fa-solid fa-window-minimize"></i>
                      Footer Ayarları
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <input
                        type="checkbox"
                        checked={currentSettings.showFooter !== false}
                        onChange={(e) => handleChange("showFooter", e.target.checked)}
                      />
                      Footer'ı göster
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Arka Plan Rengi</label>
                        <div style={{ display: "flex", gap: 4 }}>
                          <input
                            type="color"
                            value={currentSettings.footerBgColor || "#0a4ea3"}
                            onChange={(e) => handleChange("footerBgColor", e.target.value)}
                            style={{ width: 40, height: 32 }}
                          />
                          <input
                            className="search-input"
                            value={currentSettings.footerBgColor || ""}
                            onChange={(e) => handleChange("footerBgColor", e.target.value)}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Yazı Rengi</label>
                        <div style={{ display: "flex", gap: 4 }}>
                          <input
                            type="color"
                            value={currentSettings.footerTextColor || "#ffffff"}
                            onChange={(e) => handleChange("footerTextColor", e.target.value)}
                            style={{ width: 40, height: 32 }}
                          />
                          <input
                            className="search-input"
                            value={currentSettings.footerTextColor || ""}
                            onChange={(e) => handleChange("footerTextColor", e.target.value)}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Gradyan</label>
                      <input
                        className="search-input"
                        placeholder="linear-gradient(to right, #0a4ea3, #1e3a5f)"
                        value={currentSettings.footerBgGradient || ""}
                        onChange={(e) => handleChange("footerBgGradient", e.target.value)}
                      />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Arka Plan Görseli</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="file"
                          ref={footerBgInputRef}
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileUpload(e, "footerBgImage")}
                        />
                        <button
                          className="btn btn-outline"
                          onClick={() => footerBgInputRef.current?.click()}
                        >
                          Yükle
                        </button>
                        <input
                          className="search-input"
                          placeholder="veya URL"
                          value={currentSettings.footerBgImage || ""}
                          onChange={(e) => handleChange("footerBgImage", e.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Font</label>
                        <input
                          className="search-input"
                          placeholder="Inter, sans-serif"
                          value={currentSettings.footerFont || ""}
                          onChange={(e) => handleChange("footerFont", e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Font Boyutu (px)</label>
                        <input
                          className="search-input"
                          type="number"
                          placeholder="14"
                          value={currentSettings.footerFontSize || ""}
                          onChange={(e) => handleChange("footerFontSize", Number(e.target.value) || null)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="card">
                  <div className="card-body">
                    <div style={{ fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="fa-solid fa-search"></i>
                      SEO Ayarları
                    </div>
                    <div style={{ display: "grid", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>SEO URL</label>
                        <input
                          className="search-input"
                          placeholder="ornek-sayfa-url"
                          value={currentSettings.seoUrl || ""}
                          onChange={(e) => handleChange("seoUrl", e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Meta Başlık (60 karakter)</label>
                        <input
                          className="search-input"
                          placeholder="Sayfa Başlığı - Site Adı"
                          value={currentSettings.metaTitle || ""}
                          onChange={(e) => handleChange("metaTitle", e.target.value)}
                          maxLength={70}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Meta Açıklama (160 karakter)</label>
                        <textarea
                          className="search-input"
                          placeholder="Sayfa açıklaması..."
                          value={currentSettings.metaDescription || ""}
                          onChange={(e) => handleChange("metaDescription", e.target.value)}
                          rows={3}
                          maxLength={170}
                          style={{ resize: "vertical" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Anahtar Kelimeler</label>
                        <input
                          className="search-input"
                          placeholder="kelime1, kelime2, kelime3"
                          value={currentSettings.metaKeywords || ""}
                          onChange={(e) => handleChange("metaKeywords", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  className="btn"
                  onClick={handleSave}
                  disabled={saving}
                  style={{ width: "100%" }}
                >
                  {saving ? "Kaydediliyor..." : `${currentSettings.pageName} Ayarlarını Kaydet`}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
