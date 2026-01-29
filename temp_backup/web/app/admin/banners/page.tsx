"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fetchJson } from "../../../lib/api";
import { type SiteSettings, defaultSettings } from "../../../lib/settings";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Banner = {
  id: string;
  title?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  position: string;
  sortOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  width?: number | null;
  height?: number | null;
};

const POSITIONS = [
  { value: "home-top", label: "Ana Sayfa - Üst (Hero)" },
  { value: "home-bottom", label: "Ana Sayfa - Alt" },
  { value: "listing-sidebar", label: "İlan Sayfası - Kenar" },
  { value: "listing-detail", label: "İlan Detay" },
];

export default function AdminBannersPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    linkUrl: "",
    position: "home-top",
    sortOrder: 0,
    isActive: true,
    startDate: "",
    endDate: "",
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);

    if (token) {
      loadData(token);
      loadSettings();
    }
  }, []);

  const loadData = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/banners/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setBanners(await res.json());
    }
  };

  const loadSettings = async () => {
    try {
      const data = await fetchJson<SiteSettings>("/settings", { cache: "no-store" });
      setSettings({ ...defaultSettings, ...data });
    } catch {
      // ignore
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/settings/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    setUploadingHero(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/settings/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        const fullUrl = `${API_BASE_URL}${data.url}`;
        setSettings((prev) => ({ ...prev, heroBackgroundUrl: fullUrl }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingHero(false);
    }
  };

  const handleSaveHeroSettings = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    setSavingSettings(true);
    try {
      await fetch(`${API_BASE_URL}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          heroBackgroundUrl: settings.heroBackgroundUrl,
          heroOverlayColor: settings.heroOverlayColor,
          heroOverlayOpacity: settings.heroOverlayOpacity,
          bannerWidth: settings.bannerWidth,
          bannerHeight: settings.bannerHeight,
          bannerOpacity: settings.bannerOpacity,
        }),
      });
      alert("Hero ayarları kaydedildi!");
    } catch (err) {
      console.error(err);
      alert("Kaydetme başarısız!");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `${API_BASE_URL}/banners/${editingId}`
      : `${API_BASE_URL}/banners`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: form.title || null,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl || null,
        position: form.position,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        width: form.width || null,
        height: form.height || null,
      }),
    });

    if (res.ok) {
      loadData(token);
      resetForm();
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title || "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      position: banner.position,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
      startDate: banner.startDate ? banner.startDate.split("T")[0] : "",
      endDate: banner.endDate ? banner.endDate.split("T")[0] : "",
      width: banner.width || 0,
      height: banner.height || 0,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu banner'ı silmek istediğinize emin misiniz?")) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadData(token);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      imageUrl: "",
      linkUrl: "",
      position: "home-top",
      sortOrder: 0,
      isActive: true,
      startDate: "",
      endDate: "",
      width: 0,
      height: 0,
    });
  };

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Banner Yönetimi</div>
          <div className="card">
            <div className="card-body">Yükleniyor...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Banner Yönetimi</div>
          <div className="card">
            <div className="card-body">
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
        <div className="section-title">Banner Yönetimi</div>
        <div style={{ marginBottom: 16 }}>
          <Link href="/admin" className="btn btn-outline">
            ← Yönetim Paneli
          </Link>
        </div>

        {/* Hero Banner Settings - From Site Settings */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>
              <i className="fa-solid fa-image" style={{ marginRight: 8 }}></i>
              Ana Sayfa Hero Banner
            </div>
            <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 16 }}>
              Ana sayfanın en üstünde görünen büyük banner görselini buradan ayarlayın.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Hero Image Upload */}
              <div>
                <label style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4, display: "block" }}>
                  Hero Görseli
                </label>
                {settings.heroBackgroundUrl && (
                  <div style={{ marginBottom: 8 }}>
                    <img
                      src={settings.heroBackgroundUrl}
                      alt="Hero"
                      style={{
                        width: "100%",
                        maxHeight: 150,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid var(--color-border)",
                      }}
                    />
                  </div>
                )}
                <input
                  ref={heroInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHeroUpload}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: "100%", marginBottom: 4 }}
                  onClick={() => heroInputRef.current?.click()}
                  disabled={uploadingHero}
                >
                  {uploadingHero ? "Yükleniyor..." : "Görsel Yükle"}
                </button>
                <input
                  className="search-input"
                  placeholder="veya URL girin"
                  value={settings.heroBackgroundUrl ?? ""}
                  onChange={(e) => setSettings({ ...settings, heroBackgroundUrl: e.target.value })}
                />
              </div>

              {/* Hero Settings */}
              <div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Overlay Rengi</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="color"
                      value={settings.heroOverlayColor || "#0c2340"}
                      onChange={(e) => setSettings({ ...settings, heroOverlayColor: e.target.value })}
                      style={{ width: 40, height: 32 }}
                    />
                    <input
                      className="search-input"
                      value={settings.heroOverlayColor ?? ""}
                      onChange={(e) => setSettings({ ...settings, heroOverlayColor: e.target.value })}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Overlay Saydamlık (0-1)</label>
                  <input
                    className="search-input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={settings.heroOverlayOpacity ?? 0.7}
                    onChange={(e) => setSettings({ ...settings, heroOverlayOpacity: Number(e.target.value) })}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Genişlik (px, 0=oto)</label>
                    <input
                      className="search-input"
                      type="number"
                      value={settings.bannerWidth ?? ""}
                      onChange={(e) => setSettings({ ...settings, bannerWidth: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Yükseklik (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      value={settings.bannerHeight ?? ""}
                      onChange={(e) => setSettings({ ...settings, bannerHeight: Number(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Banner Saydamlık (0-1)</label>
                  <input
                    className="search-input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={settings.bannerOpacity ?? 1}
                    onChange={(e) => setSettings({ ...settings, bannerOpacity: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <button
              className="btn"
              style={{ marginTop: 16 }}
              onClick={handleSaveHeroSettings}
              disabled={savingSettings}
            >
              {savingSettings ? "Kaydediliyor..." : "Hero Ayarlarını Kaydet"}
            </button>
          </div>
        </div>

        <div className="layout-grid">
          <aside className="sidebar">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              {editingId ? "Banner Düzenle" : "Yeni Banner Ekle"}
            </div>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
              <input
                className="search-input"
                placeholder="Başlık (opsiyonel)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              {/* Photo Upload */}
              <div>
                <label style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4, display: "block" }}>
                  Banner Görseli
                </label>
                {form.imageUrl && (
                  <div style={{ marginBottom: 8 }}>
                    <img
                      src={resolveImageUrl(form.imageUrl) || ""}
                      alt="Banner"
                      style={{
                        width: "100%",
                        maxHeight: 100,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid var(--color-border)",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: "100%", marginBottom: 4 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Yükleniyor..." : "Görsel Yükle"}
                </button>
                <input
                  className="search-input"
                  placeholder="veya Resim URL"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  required
                />
              </div>

              <input
                className="search-input"
                placeholder="Tıklanınca Açılacak Link (opsiyonel)"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              />
              <select
                className="search-input"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              >
                {POSITIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>

              {/* Size Controls */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 8, marginTop: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: "var(--color-muted)", marginBottom: 8 }}>
                  Boyut Ayarları (0 = otomatik)
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Genişlik (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="Otomatik"
                      value={form.width || ""}
                      onChange={(e) => setForm({ ...form, width: Number(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Yükseklik (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="Otomatik"
                      value={form.height || ""}
                      onChange={(e) => setForm({ ...form, height: Number(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>
              </div>

              <input
                className="search-input"
                type="number"
                placeholder="Sıra"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
              <div>
                <label style={{ fontSize: 12 }}>Başlangıç Tarihi (opsiyonel)</label>
                <input
                  className="search-input"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: 12 }}>Bitiş Tarihi (opsiyonel)</label>
                <input
                  className="search-input"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Aktif
              </label>
              <button className="btn" type="submit">
                {editingId ? "Güncelle" : "Banner Ekle"}
              </button>
              {editingId && (
                <button className="btn btn-outline" type="button" onClick={resetForm}>
                  İptal
                </button>
              )}
            </form>
          </aside>

          <section>
            <div className="card">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 12 }}>
                  Mevcut Bannerlar ({banners.length})
                </div>
                <div style={{ display: "grid", gap: 16 }}>
                  {banners.map((banner) => (
                    <div
                      key={banner.id}
                      style={{
                        display: "flex",
                        gap: 16,
                        padding: 12,
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        flexWrap: "wrap",
                        background: banner.isActive ? "#fff" : "#f5f5f5",
                      }}
                    >
                      <img
                        src={resolveImageUrl(banner.imageUrl) || ""}
                        alt={banner.title || "Banner"}
                        style={{
                          width: 120,
                          height: 70,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 150 }}>
                        <div style={{ fontWeight: 600 }}>
                          {banner.title || "(Başlıksız)"}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                          Konum: {POSITIONS.find((p) => p.value === banner.position)?.label}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                          Sıra: {banner.sortOrder}
                        </div>
                        {(banner.width || banner.height) && (
                          <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                            Boyut: {banner.width || "auto"}x{banner.height || "auto"}
                          </div>
                        )}
                        {banner.linkUrl && (
                          <div style={{ fontSize: 11, color: "var(--color-primary)", wordBreak: "break-all" }}>
                            → {banner.linkUrl}
                          </div>
                        )}
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            backgroundColor: banner.isActive ? "#10b981" : "#ef4444",
                            color: "white",
                            marginTop: 4,
                          }}
                        >
                          {banner.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "6px 12px", fontSize: 11 }}
                          onClick={() => handleEdit(banner)}
                        >
                          Düzenle
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "6px 12px", fontSize: 11 }}
                          onClick={() => handleDelete(banner.id)}
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                  {banners.length === 0 && (
                    <div style={{ textAlign: "center", padding: 20, color: "var(--color-muted)" }}>
                      Henüz banner eklenmemiş.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
