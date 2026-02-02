"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface MobileSettings {
  // Header
  mobileHeaderPadding: string;
  mobileNavFontSize: number;
  // Logo Row
  mobileLogoRowPadding: string;
  // Logo
  mobileLogoHeight: number;
  mobileLogoSubSize: number;
  mobileLogoAlign: "left" | "center" | "right";
  // Sosyal
  mobileSocialSize: number;
  mobileSocialShow: boolean;
  mobileSocialGap: number;
  mobileSocialPosition: "left" | "right";
  // Arama
  mobileSearchWidth: number;
  mobileSearchHeight: number;
  mobileSearchShow: boolean;
  // Banner
  mobileBannerHeight: number;
  mobileBannerAspectRatio: string;
  mobileBannerFullWidth: boolean;
  mobileBannerBorderRadius: number;
  // Şube Butonları
  mobileBranchColumns: number;
  mobileBranchGap: number;
  mobileBranchSize: number;
  mobileBranchBorderRadius: number;
  mobileBranchAlign: "left" | "center" | "right" | "stretch";
  // Aksiyon Butonları
  mobileActionColumns: number;
  mobileActionGap: number;
  mobileActionHeight: number;
  mobileActionFontSize: number;
  mobileActionBorderRadius: number;
  mobileActionAlign: "left" | "center" | "right" | "stretch";
  mobileActionWidth: number;
  // İlanlar
  mobileListingColumns: number;
  mobileListingGap: number;
}

const defaultMobileSettings: MobileSettings = {
  mobileHeaderPadding: "4px 8px",
  mobileNavFontSize: 10,
  mobileLogoRowPadding: "18px 12px",
  mobileLogoHeight: 28,
  mobileLogoSubSize: 9,
  mobileLogoAlign: "center",
  mobileSocialSize: 22,
  mobileSocialShow: true,
  mobileSocialGap: 4,
  mobileSocialPosition: "left",
  mobileSearchWidth: 40,
  mobileSearchHeight: 24,
  mobileSearchShow: true,
  mobileBannerHeight: 120,
  mobileBannerAspectRatio: "21/9",
  mobileBannerFullWidth: true,
  mobileBannerBorderRadius: 8,
  mobileBranchColumns: 3,
  mobileBranchGap: 6,
  mobileBranchSize: 100,
  mobileBranchBorderRadius: 8,
  mobileBranchAlign: "stretch",
  mobileActionColumns: 2,
  mobileActionGap: 6,
  mobileActionHeight: 40,
  mobileActionFontSize: 10,
  mobileActionBorderRadius: 6,
  mobileActionAlign: "stretch",
  mobileActionWidth: 80,
  mobileListingColumns: 2,
  mobileListingGap: 8,
};

export default function MobileSettingsPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [settings, setSettings] = useState<MobileSettings>(defaultMobileSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [previewMode, setPreviewMode] = useState<"mobile" | "tablet">("mobile");
  const [activeTab, setActiveTab] = useState<"header" | "banner" | "branch" | "action" | "listing">("header");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(!!token);
    setIsReady(true);
    if (token) {
      loadSettings();
    }
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings({
          ...defaultMobileSettings,
          ...Object.fromEntries(
            Object.entries(data).filter(([key]) => key.startsWith("mobile"))
          ),
        });
      }
    } catch (error) {
      console.error("Ayarlar yüklenemedi:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("auth_token");
      
      // Sadece mobil ayarlarını gönder, doğru tiplerde
      const mobileSettings = {
        mobileHeaderPadding: settings.mobileHeaderPadding || null,
        mobileNavFontSize: settings.mobileNavFontSize ? Number(settings.mobileNavFontSize) : null,
        mobileLogoRowPadding: settings.mobileLogoRowPadding || null,
        mobileLogoHeight: settings.mobileLogoHeight ? Number(settings.mobileLogoHeight) : null,
        mobileLogoSubSize: settings.mobileLogoSubSize ? Number(settings.mobileLogoSubSize) : null,
        mobileLogoAlign: settings.mobileLogoAlign || null,
        mobileSocialSize: settings.mobileSocialSize ? Number(settings.mobileSocialSize) : null,
        mobileSocialShow: Boolean(settings.mobileSocialShow),
        mobileSocialGap: settings.mobileSocialGap ? Number(settings.mobileSocialGap) : null,
        mobileSocialPosition: settings.mobileSocialPosition || null,
        mobileSearchWidth: settings.mobileSearchWidth ? Number(settings.mobileSearchWidth) : null,
        mobileSearchHeight: settings.mobileSearchHeight ? Number(settings.mobileSearchHeight) : null,
        mobileSearchShow: Boolean(settings.mobileSearchShow),
        mobileBannerHeight: settings.mobileBannerHeight ? Number(settings.mobileBannerHeight) : null,
        mobileBannerAspectRatio: settings.mobileBannerAspectRatio || null,
        mobileBannerFullWidth: Boolean(settings.mobileBannerFullWidth),
        mobileBannerBorderRadius: settings.mobileBannerBorderRadius ? Number(settings.mobileBannerBorderRadius) : null,
        mobileBranchColumns: settings.mobileBranchColumns ? Number(settings.mobileBranchColumns) : null,
        mobileBranchGap: settings.mobileBranchGap ? Number(settings.mobileBranchGap) : null,
        mobileBranchSize: settings.mobileBranchSize ? Number(settings.mobileBranchSize) : null,
        mobileBranchBorderRadius: settings.mobileBranchBorderRadius ? Number(settings.mobileBranchBorderRadius) : null,
        mobileBranchAlign: settings.mobileBranchAlign || null,
        mobileActionColumns: settings.mobileActionColumns ? Number(settings.mobileActionColumns) : null,
        mobileActionGap: settings.mobileActionGap ? Number(settings.mobileActionGap) : null,
        mobileActionHeight: settings.mobileActionHeight ? Number(settings.mobileActionHeight) : null,
        mobileActionFontSize: settings.mobileActionFontSize ? Number(settings.mobileActionFontSize) : null,
        mobileActionBorderRadius: settings.mobileActionBorderRadius ? Number(settings.mobileActionBorderRadius) : null,
        mobileActionAlign: settings.mobileActionAlign || null,
        mobileActionWidth: settings.mobileActionWidth ? Number(settings.mobileActionWidth) : null,
        mobileListingColumns: settings.mobileListingColumns ? Number(settings.mobileListingColumns) : null,
        mobileListingGap: settings.mobileListingGap ? Number(settings.mobileListingGap) : null,
      };

      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mobileSettings),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Mobil ayarları kaydedildi!" });
        applyMobileCSS();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Save error:", errorData);
        setMessage({ type: "error", text: `Kayıt başarısız: ${errorData.message || res.statusText}` });
      }
    } catch (error) {
      console.error("Save error:", error);
      setMessage({ type: "error", text: "Bir hata oluştu" });
    } finally {
      setSaving(false);
    }
  };

  const applyMobileCSS = () => {
    const root = document.documentElement;
    root.style.setProperty("--mobile-header-padding", settings.mobileHeaderPadding ?? "4px 8px");
    root.style.setProperty("--mobile-nav-font-size", `${settings.mobileNavFontSize ?? 10}px`);
    root.style.setProperty("--mobile-logo-row-padding", settings.mobileLogoRowPadding ?? "18px 12px");
    root.style.setProperty("--mobile-logo-height", `${settings.mobileLogoHeight ?? 28}px`);
    root.style.setProperty("--mobile-logo-sub-size", `${settings.mobileLogoSubSize ?? 9}px`);
    root.style.setProperty("--mobile-social-size", `${settings.mobileSocialSize ?? 22}px`);
    root.style.setProperty("--mobile-social-gap", `${settings.mobileSocialGap ?? 4}px`);
    root.style.setProperty("--mobile-social-position", settings.mobileSocialPosition ?? "left");
    root.style.setProperty("--mobile-search-width", `${settings.mobileSearchWidth ?? 40}px`);
    root.style.setProperty("--mobile-search-height", `${settings.mobileSearchHeight ?? 24}px`);
    root.style.setProperty("--mobile-banner-height", `${settings.mobileBannerHeight ?? 120}px`);
    root.style.setProperty("--mobile-banner-radius", `${settings.mobileBannerBorderRadius ?? 8}px`);
    root.style.setProperty("--mobile-branch-columns", String(settings.mobileBranchColumns ?? 3));
    root.style.setProperty("--mobile-branch-gap", `${settings.mobileBranchGap ?? 6}px`);
    root.style.setProperty("--mobile-branch-radius", `${settings.mobileBranchBorderRadius ?? 8}px`);
    root.style.setProperty("--mobile-branch-align", settings.mobileBranchAlign ?? "stretch");
    root.style.setProperty("--mobile-action-columns", String(settings.mobileActionColumns ?? 2));
    root.style.setProperty("--mobile-action-gap", `${settings.mobileActionGap ?? 6}px`);
    root.style.setProperty("--mobile-action-height", `${settings.mobileActionHeight ?? 40}px`);
    root.style.setProperty("--mobile-action-font-size", `${settings.mobileActionFontSize ?? 10}px`);
    root.style.setProperty("--mobile-action-radius", `${settings.mobileActionBorderRadius ?? 6}px`);
    // CSS align-items için değer dönüşümü
    const actionAlign = settings.mobileActionAlign ?? "stretch";
    const alignValue = actionAlign === 'left' ? 'flex-start' 
      : actionAlign === 'right' ? 'flex-end' 
      : actionAlign;
    root.style.setProperty("--mobile-action-align", alignValue);
    root.style.setProperty("--mobile-action-width", `${settings.mobileActionWidth ?? 100}%`);
    root.style.setProperty("--mobile-listing-columns", String(settings.mobileListingColumns ?? 2));
    root.style.setProperty("--mobile-listing-gap", `${settings.mobileListingGap ?? 8}px`);
  };

  const resetToDefaults = () => {
    setSettings(defaultMobileSettings);
    setMessage({ type: "info", text: "Varsayılan değerlere sıfırlandı. Kaydetmeyi unutmayın!" });
  };

  if (!isReady) return null;

  if (!isAuthed) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <div className="admin-card" style={{ textAlign: "center", padding: 40 }}>
            <i className="fa-solid fa-lock" style={{ fontSize: 48, color: "#ccc", marginBottom: 16 }}></i>
            <h2>Giriş Gerekli</h2>
            <p>Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
            <Link href="/admin/login" className="btn btn-primary" style={{ marginTop: 16 }}>
              Giriş Yap
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const TabButton = ({ id, icon, label }: { id: typeof activeTab; icon: string; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: "10px 16px",
        background: activeTab === id ? "#0a4ea3" : "#f1f5f9",
        color: activeTab === id ? "#fff" : "#475569",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 500,
        transition: "all 200ms",
      }}
    >
      <i className={icon}></i>
      {label}
    </button>
  );

  return (
    <main className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title">
            <i className="fa-solid fa-mobile-screen"></i> Mobil Ayarları
          </h1>
          <div className="admin-actions">
            <Link href="/admin" className="btn btn-secondary">
              <i className="fa-solid fa-arrow-left"></i> Admin Panel
            </Link>
            <button onClick={resetToDefaults} className="btn btn-secondary">
              <i className="fa-solid fa-rotate-left"></i> Varsayılana Dön
            </button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? <><i className="fa-solid fa-spinner fa-spin"></i> Kaydediliyor...</> : <><i className="fa-solid fa-check"></i> Kaydet</>}
            </button>
          </div>
        </div>

        {/* Mesaj */}
        {message.text && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 20,
              background: message.type === "success" ? "#d4edda" : message.type === "error" ? "#f8d7da" : "#cce5ff",
              color: message.type === "success" ? "#155724" : message.type === "error" ? "#721c24" : "#004085",
            }}
          >
            <i className={`fa-solid ${message.type === "success" ? "fa-check-circle" : message.type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}`}></i>{" "}
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <TabButton id="header" icon="fa-solid fa-bars" label="Header & Logo" />
          <TabButton id="banner" icon="fa-solid fa-panorama" label="Banner" />
          <TabButton id="branch" icon="fa-solid fa-building" label="Şube Butonları" />
          <TabButton id="action" icon="fa-solid fa-hand-pointer" label="Aksiyon Butonları" />
          <TabButton id="listing" icon="fa-solid fa-house" label="İlan Kartları" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
          {/* Sol - Ayarlar */}
          <div>
            {/* Header & Logo Tab */}
            {activeTab === "header" && (
              <>
                <div className="admin-card">
                  <h3 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="fa-solid fa-bars" style={{ color: "#0a4ea3" }}></i>
                    Üst Menü (Header)
                  </h3>

                  <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Navigasyon Font Boyutu (px)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={settings.mobileNavFontSize ?? defaultMobileSettings.mobileNavFontSize}
                        onChange={(e) => setSettings({ ...settings, mobileNavFontSize: Number(e.target.value) })}
                        min={8}
                        max={16}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Header Padding</label>
                      <input
                        type="text"
                        className="form-input"
                        value={settings.mobileHeaderPadding ?? defaultMobileSettings.mobileHeaderPadding}
                        onChange={(e) => setSettings({ ...settings, mobileHeaderPadding: e.target.value })}
                        placeholder="4px 8px"
                      />
                      <small style={{ color: "#6b7280", fontSize: 11, marginTop: 4, display: "block" }}>
                        Üst navigasyon barı (mavi alan)
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Logo Satırı Padding (Dikey Yatay)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={settings.mobileLogoRowPadding ?? defaultMobileSettings.mobileLogoRowPadding}
                        onChange={(e) => setSettings({ ...settings, mobileLogoRowPadding: e.target.value })}
                        placeholder="18px 12px"
                      />
                      <small style={{ color: "#6b7280", fontSize: 11, marginTop: 4, display: "block" }}>
                        Logo'nun olduğu satır/alan (beyaz arkaplan)
                      </small>
                    </div>
                  </div>
                </div>

                <div className="admin-card">
                  <h3 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="fa-solid fa-image" style={{ color: "#e67e22" }}></i>
                    Logo Ayarları
                  </h3>

                  <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Logo Yüksekliği (px)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={settings.mobileLogoHeight ?? defaultMobileSettings.mobileLogoHeight}
                        onChange={(e) => setSettings({ ...settings, mobileLogoHeight: Number(e.target.value) })}
                        min={20}
                        max={60}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Alt Yazı Boyutu (px)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={settings.mobileLogoSubSize ?? defaultMobileSettings.mobileLogoSubSize}
                        onChange={(e) => setSettings({ ...settings, mobileLogoSubSize: Number(e.target.value) })}
                        min={6}
                        max={16}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Logo Hizalama</label>
                      <select
                        className="form-select"
                        value={settings.mobileLogoAlign ?? defaultMobileSettings.mobileLogoAlign}
                        onChange={(e) => setSettings({ ...settings, mobileLogoAlign: e.target.value as MobileSettings["mobileLogoAlign"] })}
                      >
                        <option value="left">Sola</option>
                        <option value="center">Ortaya</option>
                        <option value="right">Sağa</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="admin-card">
                  <h3 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="fa-solid fa-share-nodes" style={{ color: "#3b5998" }}></i>
                    Sosyal Medya İkonları
                  </h3>

                  <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div className="form-group">
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={settings.mobileSocialShow ?? true}
                          onChange={(e) => setSettings({ ...settings, mobileSocialShow: e.target.checked })}
                          style={{ width: 18, height: 18 }}
                        />
                        <span>Sosyal medya ikonlarını göster</span>
                      </label>
                    </div>

                    <div className="form-group">
                      <label className="form-label">İkon Konumu</label>
                      <select
                        className="form-select"
                        value={settings.mobileSocialPosition ?? "left"}
                        onChange={(e) => setSettings({ ...settings, mobileSocialPosition: e.target.value as "left" | "right" })}
                      >
                        <option value="left">Sol Tarafta</option>
                        <option value="right">Sağ Tarafta</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
                    <div className="form-group">
                      <label className="form-label">İkon Boyutu (px)</label>
                      <input
                        type="number"
                        className="form-input"
                        min={14}
                        max={50}
                        value={settings.mobileSocialSize ?? defaultMobileSettings.mobileSocialSize}
                        onChange={(e) => setSettings({ ...settings, mobileSocialSize: Number(e.target.value) })}
                      />
                      <small style={{ fontSize: 10, color: "#666" }}>Önerilen: 18-28px (Küçültmek için düşük değer girin)</small>
                    </div>

                    <div className="form-group">
                      <label className="form-label">İkonlar Arası Boşluk (px)</label>
                      <input
                        type="number"
                        className="form-input"
                        min={0}
                        max={20}
                        value={settings.mobileSocialGap ?? defaultMobileSettings.mobileSocialGap}
                        onChange={(e) => setSettings({ ...settings, mobileSocialGap: Number(e.target.value) })}
                      />
                      <small style={{ fontSize: 10, color: "#666" }}>Önerilen: 2-6px</small>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, padding: 12, background: "#fef3c7", borderRadius: 8, fontSize: 12 }}>
                    <i className="fa-solid fa-lightbulb" style={{ color: "#d97706" }}></i>
                    <strong> İpucu:</strong> İkonlar logo ile çakışıyorsa, ikon boyutunu küçültün veya konumunu değiştirin.
                  </div>
                </div>

                <div className="admin-card">
                  <h3 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ color: "#9333ea" }}></i>
                    Arama Barı Ayarları
                  </h3>

                  <div className="form-group">
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={settings.mobileSearchShow ?? true}
                        onChange={(e) => setSettings({ ...settings, mobileSearchShow: e.target.checked })}
                        style={{ width: 18, height: 18 }}
                      />
                      <span>Arama barını göster</span>
                    </label>
                  </div>

                  <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Genişlik (px)</label>
                      <input
                        type="number"
                        className="form-input"
                        min={30}
                        max={120}
                        value={settings.mobileSearchWidth ?? defaultMobileSettings.mobileSearchWidth}
                        onChange={(e) => setSettings({ ...settings, mobileSearchWidth: Number(e.target.value) })}
                      />
                      <small style={{ fontSize: 10, color: "#666" }}>Önerilen: 35-60px</small>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Yükseklik (px)</label>
                      <input
                        type="number"
                        className="form-input"
                        min={20}
                        max={40}
                        value={settings.mobileSearchHeight ?? defaultMobileSettings.mobileSearchHeight}
                        onChange={(e) => setSettings({ ...settings, mobileSearchHeight: Number(e.target.value) })}
                      />
                      <small style={{ fontSize: 10, color: "#666" }}>Önerilen: 22-28px</small>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Banner Tab */}
            {activeTab === "banner" && (
              <div className="admin-card">
                <h3 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-panorama" style={{ color: "#9b59b6" }}></i>
                  Banner Ayarları
                </h3>

                <div className="form-group">
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={settings.mobileBannerFullWidth}
                      onChange={(e) => setSettings({ ...settings, mobileBannerFullWidth: e.target.checked })}
                      style={{ width: 18, height: 18 }}
                    />
                    <span>Tam genişlik (padding olmadan)</span>
                  </label>
                </div>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Minimum Yükseklik (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.mobileBannerHeight ?? defaultMobileSettings.mobileBannerHeight}
                      onChange={(e) => setSettings({ ...settings, mobileBannerHeight: Number(e.target.value) })}
                      min={60}
                      max={300}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Köşe Yuvarlaklığı (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.mobileBannerBorderRadius ?? defaultMobileSettings.mobileBannerBorderRadius}
                      onChange={(e) => setSettings({ ...settings, mobileBannerBorderRadius: Number(e.target.value) })}
                      min={0}
                      max={30}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">En-Boy Oranı</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                    {[
                      { value: "16/9", label: "16:9" },
                      { value: "21/9", label: "21:9" },
                      { value: "3/1", label: "3:1" },
                      { value: "4/1", label: "4:1" },
                      { value: "2/1", label: "2:1" },
                    ].map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => setSettings({ ...settings, mobileBannerAspectRatio: ratio.value })}
                        style={{
                          padding: "10px",
                          border: settings.mobileBannerAspectRatio === ratio.value ? "2px solid #0a4ea3" : "1px solid #ddd",
                          borderRadius: 8,
                          background: settings.mobileBannerAspectRatio === ratio.value ? "#e3f2fd" : "#fff",
                          cursor: "pointer",
                          fontWeight: settings.mobileBannerAspectRatio === ratio.value ? 600 : 400,
                        }}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 20, padding: 16, background: "#fef3c7", borderRadius: 8 }}>
                  <i className="fa-solid fa-lightbulb" style={{ color: "#d97706" }}></i>
                  <strong> Öneri:</strong> Mobilde banner tam görünsün istiyorsanız 3:1 veya 4:1 oranı kullanın.
                </div>
              </div>
            )}

            {/* Branch Buttons Tab */}
            {activeTab === "branch" && (
              <div className="admin-card">
                <h3 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-building" style={{ color: "#27ae60" }}></i>
                  Şube Butonları Ayarları
                </h3>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Satır Başına Buton Sayısı</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[2, 3, 4].map((num) => (
                        <button
                          key={num}
                          onClick={() => setSettings({ ...settings, mobileBranchColumns: num })}
                          style={{
                            flex: 1,
                            padding: "12px",
                            border: settings.mobileBranchColumns === num ? "2px solid #27ae60" : "1px solid #ddd",
                            borderRadius: 8,
                            background: settings.mobileBranchColumns === num ? "#d4edda" : "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 16,
                          }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Buton Hizalama</label>
                    <select
                      className="form-select"
                      value={settings.mobileBranchAlign ?? "stretch"}
                      onChange={(e) => setSettings({ ...settings, mobileBranchAlign: e.target.value as MobileSettings["mobileBranchAlign"] })}
                    >
                      <option value="stretch">Eşit Genişlik (Stretch)</option>
                      <option value="center">Ortaya</option>
                      <option value="left">Sola</option>
                      <option value="right">Sağa</option>
                    </select>
                  </div>
                </div>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Buton Aralığı (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.mobileBranchGap ?? defaultMobileSettings.mobileBranchGap}
                      onChange={(e) => setSettings({ ...settings, mobileBranchGap: Number(e.target.value) })}
                      min={2}
                      max={20}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Buton Boyutu (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.mobileBranchSize ?? defaultMobileSettings.mobileBranchSize}
                      onChange={(e) => setSettings({ ...settings, mobileBranchSize: Number(e.target.value) })}
                      min={60}
                      max={150}
                    />
                    <small style={{ fontSize: 10, color: "#666" }}>Eşit genişlikte kullanılmaz</small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Köşe Yuvarlaklığı (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.mobileBranchBorderRadius ?? defaultMobileSettings.mobileBranchBorderRadius}
                      onChange={(e) => setSettings({ ...settings, mobileBranchBorderRadius: Number(e.target.value) })}
                      min={0}
                      max={30}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons Tab */}
            {activeTab === "action" && (
              <div className="admin-card">
                <h3 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-hand-pointer" style={{ color: "#e74c3c" }}></i>
                  Aksiyon Butonları Ayarları
                </h3>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Satır Başına Buton Sayısı</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setSettings({ ...settings, mobileActionColumns: num })}
                          style={{
                            flex: 1,
                            padding: "12px",
                            border: (settings.mobileActionColumns ?? 2) === num ? "2px solid #e74c3c" : "1px solid #ddd",
                            borderRadius: 8,
                            background: (settings.mobileActionColumns ?? 2) === num ? "#fce4ec" : "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 16,
                          }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Buton Hizalama</label>
                    <select
                      className="form-select"
                      value={settings.mobileActionAlign ?? "stretch"}
                      onChange={(e) => setSettings({ ...settings, mobileActionAlign: e.target.value as MobileSettings["mobileActionAlign"] })}
                    >
                      <option value="stretch">Tam Genişlik (Stretch)</option>
                      <option value="center">Ortaya</option>
                      <option value="left">Sola</option>
                      <option value="right">Sağa</option>
                    </select>
                  </div>
                </div>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Buton Genişliği (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={(settings.mobileActionAlign ?? "stretch") === "stretch" ? 100 : (settings.mobileActionWidth ?? 80)}
                      onChange={(e) => setSettings({ ...settings, mobileActionWidth: Number(e.target.value) })}
                      min={50}
                      max={100}
                      disabled={(settings.mobileActionAlign ?? "stretch") === "stretch"}
                      style={{ opacity: (settings.mobileActionAlign ?? "stretch") === "stretch" ? 0.5 : 1 }}
                    />
                    <small style={{ fontSize: 10, color: "#666" }}>
                      {(settings.mobileActionAlign ?? "stretch") === "stretch" 
                        ? "Tam genişlikte sabit" 
                        : "Ortaya/sola/sağa hizalama için genişlik"}
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Buton Aralığı (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.mobileActionGap ?? defaultMobileSettings.mobileActionGap}
                      onChange={(e) => setSettings({ ...settings, mobileActionGap: Number(e.target.value) })}
                      min={2}
                      max={20}
                    />
                  </div>
                </div>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Buton Yüksekliği (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.mobileActionHeight ?? defaultMobileSettings.mobileActionHeight}
                      onChange={(e) => setSettings({ ...settings, mobileActionHeight: Number(e.target.value) })}
                      min={30}
                      max={80}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Font Boyutu (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.mobileActionFontSize ?? defaultMobileSettings.mobileActionFontSize}
                      onChange={(e) => setSettings({ ...settings, mobileActionFontSize: Number(e.target.value) })}
                      min={8}
                      max={16}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Köşe Yuvarlaklığı (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.mobileActionBorderRadius ?? defaultMobileSettings.mobileActionBorderRadius}
                      onChange={(e) => setSettings({ ...settings, mobileActionBorderRadius: Number(e.target.value) })}
                      min={0}
                      max={20}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 16, padding: 12, background: "#e3f2fd", borderRadius: 8, fontSize: 12 }}>
                  <i className="fa-solid fa-info-circle" style={{ color: "#1976d2" }}></i>
                  <strong> Not:</strong> Yazıların taşmaması için font boyutunu küçültün veya buton yüksekliğini artırın. Butonlar otomatik olarak yazıyı keser (overflow hidden).
                </div>
              </div>
            )}

            {/* Listing Cards Tab */}
            {activeTab === "listing" && (
              <div className="admin-card">
                <h3 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-house" style={{ color: "#3498db" }}></i>
                  İlan Kartları Ayarları
                </h3>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Satır Başına Kart Sayısı</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[1, 2].map((num) => (
                        <button
                          key={num}
                          onClick={() => setSettings({ ...settings, mobileListingColumns: num })}
                          style={{
                            flex: 1,
                            padding: "12px",
                            border: (settings.mobileListingColumns ?? 2) === num ? "2px solid #3498db" : "1px solid #ddd",
                            borderRadius: 8,
                            background: (settings.mobileListingColumns ?? 2) === num ? "#e3f2fd" : "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 16,
                          }}
                        >
                          {num === 1 ? "Tam Genişlik" : "2 Sütun"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kart Aralığı (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={settings.mobileListingGap ?? defaultMobileSettings.mobileListingGap}
                      onChange={(e) => setSettings({ ...settings, mobileListingGap: Number(e.target.value) })}
                      min={4}
                      max={20}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sağ - Önizleme */}
          <div>
            <div className="admin-card" style={{ position: "sticky", top: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>
                  <i className="fa-solid fa-eye"></i> Önizleme
                </h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setPreviewMode("mobile")}
                    className={`btn ${previewMode === "mobile" ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "6px 12px", fontSize: 12 }}
                  >
                    <i className="fa-solid fa-mobile-screen"></i>
                  </button>
                  <button
                    onClick={() => setPreviewMode("tablet")}
                    className={`btn ${previewMode === "tablet" ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "6px 12px", fontSize: 12 }}
                  >
                    <i className="fa-solid fa-tablet-screen-button"></i>
                  </button>
                </div>
              </div>

              {/* Telefon Çerçevesi */}
              <div
                style={{
                  width: previewMode === "mobile" ? 320 : 360,
                  height: previewMode === "mobile" ? 600 : 700,
                  margin: "0 auto",
                  background: "#1a1a1a",
                  borderRadius: 36,
                  padding: 10,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#fff",
                    borderRadius: 28,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* Dynamic Island */}
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 80,
                      height: 24,
                      background: "#000",
                      borderRadius: 20,
                      zIndex: 10,
                    }}
                  />

                  {/* İçerik */}
                  <div style={{ height: "100%", overflow: "auto", paddingTop: 36 }}>
                    {/* Header Preview */}
                    <div style={{ background: "#0a4ea3", padding: settings.mobileHeaderPadding }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, overflowX: "auto" }}>
                        {["Ana Sayfa", "İlanlar", "Şubeler", "Fırsatlar"].map((item) => (
                          <span
                            key={item}
                            style={{
                              padding: "4px 6px",
                              fontSize: settings.mobileNavFontSize,
                              color: "#fff",
                              whiteSpace: "nowrap",
                              background: item === "Ana Sayfa" ? "rgba(255,255,255,0.15)" : "transparent",
                              borderRadius: 4,
                            }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Logo Row Preview */}
                    <div
                      style={{
                        background: "#ffffff",
                        padding: settings.mobileLogoRowPadding ?? "18px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: (settings.mobileLogoAlign ?? "center") === "center" ? "center" : (settings.mobileLogoAlign ?? "center") === "left" ? "flex-start" : "flex-end",
                        gap: 12,
                        position: "relative",
                      }}
                    >
                      {(settings.mobileSocialShow ?? true) && (
                        <div 
                          style={{ 
                            display: "flex", 
                            gap: settings.mobileSocialGap ?? 4, 
                            position: "absolute", 
                            left: (settings.mobileSocialPosition ?? "left") === "left" ? 10 : "auto",
                            right: (settings.mobileSocialPosition ?? "left") === "right" ? 10 : "auto",
                          }}
                        >
                          {["f", "ig", "yt"].map((icon, i) => (
                            <div
                              key={i}
                              style={{
                                width: settings.mobileSocialSize ?? 22,
                                height: settings.mobileSocialSize ?? 22,
                                background: "rgba(10,78,163,0.1)",
                                borderRadius: 4,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: (settings.mobileSocialSize ?? 22) * 0.4,
                                color: "#0a4ea3",
                              }}
                            >
                              {icon}
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            height: settings.mobileLogoHeight ?? 28,
                            width: (settings.mobileLogoHeight ?? 28) * 2.5,
                            background: "#0a4ea3",
                            borderRadius: 4,
                            margin: "0 auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          LOGO
                        </div>
                        <div style={{ color: "#333", fontSize: settings.mobileLogoSubSize ?? 9, marginTop: 2 }}>
                          Özcan AKTAŞ
                        </div>
                      </div>
                      {(settings.mobileSearchShow ?? true) && (
                        <div
                          style={{
                            position: "absolute",
                            right: (settings.mobileSocialPosition ?? "left") === "left" ? 10 : "auto",
                            left: (settings.mobileSocialPosition ?? "left") === "right" ? 10 : "auto",
                            display: "flex",
                            alignItems: "center",
                            background: "rgba(10,78,163,0.1)",
                            borderRadius: 4,
                            height: settings.mobileSearchHeight ?? 24,
                            minWidth: settings.mobileSearchWidth ?? 40,
                            padding: "0 6px",
                          }}
                        >
                          <span style={{ fontSize: Math.min((settings.mobileSearchHeight ?? 24) * 0.5, 10), color: "#0a4ea3" }}>🔍</span>
                        </div>
                      )}
                    </div>

                    {/* Banner Preview */}
                    <div style={{ padding: settings.mobileBannerFullWidth ? 0 : 8 }}>
                      <div
                        style={{
                          background: "linear-gradient(135deg, #1e3a5f 0%, #0a4ea3 100%)",
                          minHeight: settings.mobileBannerHeight,
                          borderRadius: settings.mobileBannerFullWidth ? 0 : settings.mobileBannerBorderRadius,
                          aspectRatio: settings.mobileBannerAspectRatio,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 12,
                        }}
                      >
                        Banner ({settings.mobileBannerAspectRatio})
                      </div>
                    </div>

                    {/* Branch Buttons Preview */}
                    <div style={{ padding: "0 8px" }}>
                      <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#0a4ea3", margin: "10px 0 6px" }}>
                        Şube İlanları
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${settings.mobileBranchColumns}, 1fr)`,
                          gap: settings.mobileBranchGap,
                          justifyContent: settings.mobileBranchAlign === "stretch" ? "stretch" : settings.mobileBranchAlign,
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            style={{
                              aspectRatio: "1/1",
                              background: `linear-gradient(135deg, hsl(${i * 40}, 60%, 50%) 0%, hsl(${i * 40}, 60%, 35%) 100%)`,
                              borderRadius: settings.mobileBranchBorderRadius,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              padding: 4,
                              color: "#fff",
                              fontSize: 8,
                              fontWeight: 600,
                            }}
                          >
                            Şehir {i}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons Preview */}
                    <div style={{ padding: "12px 8px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: (settings.mobileActionColumns ?? 2) === 1 ? "column" : "row",
                          flexWrap: "wrap",
                          alignItems: (settings.mobileActionAlign ?? "stretch") === "stretch" 
                            ? "stretch" 
                            : (settings.mobileActionAlign ?? "stretch") === "left" 
                              ? "flex-start" 
                              : (settings.mobileActionAlign ?? "stretch") === "right" 
                                ? "flex-end" 
                                : "center",
                          gap: settings.mobileActionGap ?? 6,
                        }}
                      >
                        {[
                          { label: "Satmak İstiyorum", bg: "#f97316" },
                          { label: "Evim Ne Kadar?", bg: "#0a4ea3" },
                          { label: "Değer Artış V.", bg: "#16a34a" },
                        ].map((btn, i) => (
                          <div
                            key={i}
                            style={{
                              background: btn.bg,
                              color: "#fff",
                              width: (settings.mobileActionAlign ?? "stretch") === "stretch" 
                                ? "100%" 
                                : `${settings.mobileActionWidth ?? 80}%`,
                              height: settings.mobileActionHeight ?? 40,
                              borderRadius: settings.mobileActionBorderRadius ?? 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: settings.mobileActionFontSize ?? 10,
                              fontWeight: 600,
                              padding: "0 8px",
                              textAlign: "center",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              boxSizing: "border-box",
                            }}
                          >
                            {btn.label}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Listings Preview */}
                    <div style={{ padding: "0 8px 16px" }}>
                      <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#0a4ea3", marginBottom: 8 }}>
                        Son İlanlar
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${settings.mobileListingColumns}, 1fr)`,
                          gap: settings.mobileListingGap,
                        }}
                      >
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            style={{
                              background: "#fff",
                              borderRadius: 6,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              overflow: "hidden",
                            }}
                          >
                            <div style={{ height: 50, background: `hsl(${i * 60}, 50%, 70%)` }} />
                            <div style={{ padding: 4 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: "#0a4ea3" }}>₺ 1.200.000</div>
                              <div style={{ fontSize: 8, color: "#666" }}>İlan {i}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
