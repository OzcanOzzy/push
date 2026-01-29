"use client";

import Link from "next/link";
import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { API_BASE_URL, fetchJson } from "../../../lib/api";
import { defaultSettings, type SiteSettings } from "../../../lib/settings";

export default function AdminSettingsPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [formState, setFormState] = useState(defaultSettings);
  const [status, setStatus] = useState<"idle" | "loading" | "saving">("loading");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const headerBgInputRef = useRef<HTMLInputElement>(null);
  const footerBgInputRef = useRef<HTMLInputElement>(null);
  const mainBgInputRef = useRef<HTMLInputElement>(null);

  const loadSettings = async () => {
    setStatus("loading");
    setError("");
    setSuccess("");
    try {
      const data = await fetchJson<SiteSettings>("/settings", { cache: "no-store" });
      setFormState({ ...defaultSettings, ...data });
    } catch {
      setError("Ayarlar yüklenemedi.");
    } finally {
      setStatus("idle");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    loadSettings();
  }, []);

  const handleChange = (field: keyof SiteSettings, value: string | number | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    field: keyof SiteSettings
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    setUploadingField(field);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/settings/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Dosya yüklenemedi.");
      }

      const data = await response.json();
      if (data.url) {
        const fullUrl = `${API_BASE_URL}${data.url}`;
        setFormState((prev) => ({ ...prev, [field]: fullUrl }));
        setSuccess("Resim yüklendi. Kaydetmeyi unutmayın!");
      }
    } catch {
      setError("Dosya yüklenemedi.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    setStatus("saving");
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error("Ayarlar kaydedilemedi.");
      }

      setSuccess("Ayarlar güncellendi.");
    } catch {
      setError("Ayarlar kaydedilemedi.");
    } finally {
      setStatus("idle");
    }
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Site Ayarları</div>
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
          <div className="section-title">Site Ayarları</div>
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
        <div className="section-title">Site Ayarları</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Link className="btn btn-outline" href="/admin">
            Yönetim Paneli
          </Link>
          <button className="btn btn-outline" onClick={loadSettings}>
            Yenile
          </button>
        </div>

        {error ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body" style={{ color: "var(--color-accent)" }}>
              {error}
            </div>
          </div>
        ) : null}
        {success ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">{success}</div>
          </div>
        ) : null}

        {/* Görsel Yüklemeleri */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Görsel Yüklemeleri</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              {/* Logo Upload */}
              <div style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Logo</div>
                {formState.logoUrl && (
                  <div style={{ marginBottom: 12, background: "#f5f5f5", padding: 12, borderRadius: 8, textAlign: "center" }}>
                    <img src={formState.logoUrl} alt="Logo" style={{ maxHeight: 60, maxWidth: "100%" }} />
                  </div>
                )}
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileUpload(e, "logoUrl")}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: "100%" }}
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingField === "logoUrl"}
                >
                  {uploadingField === "logoUrl" ? "Yükleniyor..." : "Logo Yükle"}
                </button>
                <input
                  className="search-input"
                  placeholder="veya Logo URL girin"
                  value={formState.logoUrl ?? ""}
                  onChange={(event) => handleChange("logoUrl", event.target.value)}
                  style={{ marginTop: 8 }}
                />
              </div>

              {/* Profile Image Upload */}
              <div style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Profil Resmi</div>
                {formState.profileImageUrl && (
                  <div style={{ marginBottom: 12, background: "#1a1a1a", padding: 12, borderRadius: 8, textAlign: "center" }}>
                    <img src={formState.profileImageUrl} alt="Profil" style={{ maxHeight: 120, maxWidth: "100%" }} />
                  </div>
                )}
                <input
                  type="file"
                  ref={profileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileUpload(e, "profileImageUrl")}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: "100%" }}
                  onClick={() => profileInputRef.current?.click()}
                  disabled={uploadingField === "profileImageUrl"}
                >
                  {uploadingField === "profileImageUrl" ? "Yükleniyor..." : "Profil Resmi Yükle"}
                </button>
                <input
                  className="search-input"
                  placeholder="veya Profil Resmi URL girin"
                  value={formState.profileImageUrl ?? ""}
                  onChange={(event) => handleChange("profileImageUrl", event.target.value)}
                  style={{ marginTop: 8 }}
                />
              </div>

              {/* Banner Link */}
              <div style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: 16, background: "#f9fafb" }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  <i className="fa-solid fa-image" style={{ marginRight: 8, color: "var(--color-primary)" }}></i>
                  Ana Sayfa Banner
                </div>
                <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 12 }}>
                  Ana sayfa üst kısmındaki büyük banner görselini Banner Yönetimi sayfasından ayarlayabilirsiniz.
                </p>
                <Link href="/admin/banners" className="btn btn-outline" style={{ width: "100%" }}>
                  <i className="fa-solid fa-arrow-right" style={{ marginRight: 6 }}></i>
                  Banner Yönetimine Git
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Genel Ayarlar */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Genel Ayarlar</div>
            <form style={{ display: "grid", gap: 12 }} onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input
                  className="search-input"
                  placeholder="Site adı"
                  value={formState.siteName ?? ""}
                  onChange={(event) => handleChange("siteName", event.target.value)}
                />
                <input
                  className="search-input"
                  placeholder="Yetkili adı"
                  value={formState.ownerName ?? ""}
                  onChange={(event) => handleChange("ownerName", event.target.value)}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <input
                    className="search-input"
                    placeholder="Yetkili ünvanı"
                    value={formState.ownerTitle ?? ""}
                    onChange={(event) => handleChange("ownerTitle", event.target.value)}
                  />
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <input
                      type="checkbox"
                      checked={formState.showOwnerTitle !== false}
                      onChange={(e) => handleChange("showOwnerTitle", e.target.checked ? 1 : 0)}
                    />
                    <span style={{ fontSize: 12 }}>Danışman yazısını göster</span>
                  </label>
                </div>
                <input
                  className="search-input"
                  placeholder="Profil Başlığı (GAYRİMENKUL UZMANI)"
                  value={formState.profileTitleLabel ?? ""}
                  onChange={(event) => handleChange("profileTitleLabel", event.target.value)}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input
                  className="search-input"
                  placeholder="Telefon"
                  value={formState.phoneNumber ?? ""}
                  onChange={(event) => handleChange("phoneNumber", event.target.value)}
                />
                <input
                  className="search-input"
                  placeholder="WhatsApp"
                  value={formState.whatsappNumber ?? ""}
                  onChange={(event) => handleChange("whatsappNumber", event.target.value)}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input
                  className="search-input"
                  placeholder="İletişim e-posta"
                  value={formState.email ?? ""}
                  onChange={(event) => handleChange("email", event.target.value)}
                />
                <input
                  className="search-input"
                  placeholder="Destek e-posta"
                  value={formState.supportEmail ?? ""}
                  onChange={(event) => handleChange("supportEmail", event.target.value)}
                />
              </div>
              <input
                className="search-input"
                placeholder="Logo Tagline (Bizimle Güvendesiniz...)"
                value={formState.logoTagline ?? ""}
                onChange={(event) => handleChange("logoTagline", event.target.value)}
              />

              {/* Logo Altı Yazısı - Ayrı Bölüm */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 12, marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-font" style={{ color: "var(--color-primary)" }}></i>
                  Logo Altı Yazısı
                </div>
                <p style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 8 }}>
                  Logonun altında görünecek metin. Bu ayar yetkili adından bağımsızdır.
                </p>
                <div style={{ display: "grid", gap: 8 }}>
                  <input
                    className="search-input"
                    placeholder="Logo altı yazısı (örn: Gayrimenkul Uzmanı)"
                    value={formState.logoSubtitleText ?? ""}
                    onChange={(event) => handleChange("logoSubtitleText", event.target.value)}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Font</label>
                      <select
                        className="search-input"
                        value={formState.logoSubtitleFont ?? "inherit"}
                        onChange={(event) => handleChange("logoSubtitleFont", event.target.value)}
                      >
                        <option value="inherit">Varsayılan</option>
                        <option value="'Alex Brush', cursive">Alex Brush</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Arial Black', sans-serif">Arial Black</option>
                        <option value="'Bebas Neue', sans-serif">Bebas Neue</option>
                        <option value="'Brush Script MT', cursive">Brush Script</option>
                        <option value="'Comic Sans MS', cursive">Comic Sans</option>
                        <option value="'Courier New', monospace">Courier New</option>
                        <option value="'Dancing Script', cursive">Dancing Script</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="'Great Vibes', cursive">Great Vibes</option>
                        <option value="'Impact', sans-serif">Impact</option>
                        <option value="'Inter', sans-serif">Inter</option>
                        <option value="'Lobster', cursive">Lobster</option>
                        <option value="'Manrope', sans-serif">Manrope</option>
                        <option value="'Montserrat', sans-serif">Montserrat</option>
                        <option value="'Open Sans', sans-serif">Open Sans</option>
                        <option value="'Pacifico', cursive">Pacifico</option>
                        <option value="'Playfair Display', serif">Playfair Display</option>
                        <option value="'Poppins', sans-serif">Poppins</option>
                        <option value="'Roboto', sans-serif">Roboto</option>
                        <option value="'Satisfy', cursive">Satisfy</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                        <option value="Verdana, sans-serif">Verdana</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Boyut (px)</label>
                      <input
                        className="search-input"
                        type="number"
                        min={8}
                        max={32}
                        value={formState.logoSubtitleFontSize ?? 12}
                        onChange={(event) => handleChange("logoSubtitleFontSize", Number(event.target.value))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Yazı Rengi</label>
                      <div style={{ display: "flex", gap: 4 }}>
                        <input
                          type="color"
                          value={formState.logoSubtitleColor || "#ffffff"}
                          onChange={(event) => handleChange("logoSubtitleColor", event.target.value)}
                          style={{ width: 32, height: 28, border: "none", cursor: "pointer" }}
                        />
                        <input
                          className="search-input"
                          value={formState.logoSubtitleColor ?? ""}
                          onChange={(event) => handleChange("logoSubtitleColor", event.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Arka Plan Rengi (boş = yok)</label>
                      <div style={{ display: "flex", gap: 4 }}>
                        <input
                          type="color"
                          value={formState.logoSubtitleBgColor || "#000000"}
                          onChange={(event) => handleChange("logoSubtitleBgColor", event.target.value)}
                          style={{ width: 32, height: 28, border: "none", cursor: "pointer" }}
                        />
                        <input
                          className="search-input"
                          placeholder="Yok"
                          value={formState.logoSubtitleBgColor ?? ""}
                          onChange={(event) => handleChange("logoSubtitleBgColor", event.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
                        <input
                          type="checkbox"
                          checked={formState.showLogoSubtitle !== false}
                          onChange={(e) => handleChange("showLogoSubtitle", e.target.checked)}
                        />
                        <span style={{ fontSize: 12 }}>Logo altı yazısını göster</span>
                      </label>
                    </div>
                  </div>
                  {/* Preview */}
                  {formState.logoSubtitleText && (
                    <div style={{ padding: 12, background: "#1a436e", borderRadius: 6, textAlign: "center" }}>
                      <span style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 4 }}>Önizleme:</span>
                      <span
                        style={{
                          fontFamily: formState.logoSubtitleFont || "inherit",
                          fontSize: formState.logoSubtitleFontSize ? `${formState.logoSubtitleFontSize}px` : "12px",
                          color: formState.logoSubtitleColor || "#ffffff",
                          backgroundColor: formState.logoSubtitleBgColor || "transparent",
                          padding: formState.logoSubtitleBgColor ? "4px 12px" : "0",
                          borderRadius: formState.logoSubtitleBgColor ? "4px" : "0",
                        }}
                      >
                        {formState.logoSubtitleText}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Renkler */}
              <div style={{ fontWeight: 600, marginTop: 8 }}>Renkler</div>
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="color"
                    value={formState.primaryColor || "#1a436e"}
                    onChange={(event) => handleChange("primaryColor", event.target.value)}
                    style={{ width: 40, height: 32, border: "none", cursor: "pointer" }}
                  />
                  <input
                    className="search-input"
                    placeholder="Ana renk"
                    value={formState.primaryColor ?? ""}
                    onChange={(event) => handleChange("primaryColor", event.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="color"
                    value={formState.accentColor || "#e20b0b"}
                    onChange={(event) => handleChange("accentColor", event.target.value)}
                    style={{ width: 40, height: 32, border: "none", cursor: "pointer" }}
                  />
                  <input
                    className="search-input"
                    placeholder="Vurgu renk"
                    value={formState.accentColor ?? ""}
                    onChange={(event) => handleChange("accentColor", event.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="color"
                    value={formState.logoTaglineColor || "#fbbf24"}
                    onChange={(event) => handleChange("logoTaglineColor", event.target.value)}
                    style={{ width: 40, height: 32, border: "none", cursor: "pointer" }}
                  />
                  <input
                    className="search-input"
                    placeholder="Logo tagline renk"
                    value={formState.logoTaglineColor ?? ""}
                    onChange={(event) => handleChange("logoTaglineColor", event.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="color"
                    value={formState.profileTitleColor || "#d4af37"}
                    onChange={(event) => handleChange("profileTitleColor", event.target.value)}
                    style={{ width: 40, height: 32, border: "none", cursor: "pointer" }}
                  />
                  <input
                    className="search-input"
                    placeholder="Profil başlık renk"
                    value={formState.profileTitleColor ?? ""}
                    onChange={(event) => handleChange("profileTitleColor", event.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="color"
                    value={formState.profileNameColor || "#d4af37"}
                    onChange={(event) => handleChange("profileNameColor", event.target.value)}
                    style={{ width: 40, height: 32, border: "none", cursor: "pointer" }}
                  />
                  <input
                    className="search-input"
                    placeholder="Profil isim renk"
                    value={formState.profileNameColor ?? ""}
                    onChange={(event) => handleChange("profileNameColor", event.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* Banner Boyutları */}
              <div style={{ fontWeight: 600, marginTop: 8 }}>Banner Ayarları</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Banner Genişliği (px)</label>
                  <input
                    className="search-input"
                    type="number"
                    placeholder="Otomatik"
                    value={formState.bannerWidth ?? ""}
                    onChange={(event) => handleChange("bannerWidth", Number(event.target.value) || 0)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Banner Yüksekliği (px)</label>
                  <input
                    className="search-input"
                    type="number"
                    placeholder="148"
                    value={formState.bannerHeight ?? ""}
                    onChange={(event) => handleChange("bannerHeight", Number(event.target.value) || 0)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Banner Saydamlık (0-1)</label>
                  <input
                    className="search-input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    placeholder="1"
                    value={formState.bannerOpacity ?? 1}
                    onChange={(event) => handleChange("bannerOpacity", Number(event.target.value) || 1)}
                  />
                </div>
              </div>

              {/* Profil Resmi Ayarları */}
              <div style={{ fontWeight: 600, marginTop: 8 }}>Profil Resmi Ayarları</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Genişlik (px)</label>
                  <input
                    className="search-input"
                    type="number"
                    placeholder="Otomatik"
                    value={formState.profileImageWidth ?? ""}
                    onChange={(event) => handleChange("profileImageWidth", Number(event.target.value) || 0)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Yükseklik (px)</label>
                  <input
                    className="search-input"
                    type="number"
                    placeholder="Otomatik"
                    value={formState.profileImageHeight ?? ""}
                    onChange={(event) => handleChange("profileImageHeight", Number(event.target.value) || 0)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Yatay Konum (px)</label>
                  <input
                    className="search-input"
                    type="number"
                    placeholder="0"
                    value={formState.profilePositionX ?? ""}
                    onChange={(event) => handleChange("profilePositionX", Number(event.target.value) || 0)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Dikey Konum (px)</label>
                  <input
                    className="search-input"
                    type="number"
                    placeholder="0"
                    value={formState.profilePositionY ?? ""}
                    onChange={(event) => handleChange("profilePositionY", Number(event.target.value) || 0)}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 8 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Profil Resmi Saydamlık (0-1)</label>
                  <input
                    className="search-input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    placeholder="1"
                    value={formState.profileOpacity ?? 1}
                    onChange={(event) => handleChange("profileOpacity", Number(event.target.value) || 1)}
                    style={{ maxWidth: 200 }}
                  />
                </div>
              </div>

              {/* Header Ayarları */}
              <div style={{ fontWeight: 600, marginTop: 8 }}>Header Ayarları</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Header Arka Plan Rengi</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="color"
                      value={formState.headerBgColor || "#0a4ea3"}
                      onChange={(event) => handleChange("headerBgColor", event.target.value)}
                      style={{ width: 40, height: 32 }}
                    />
                    <input
                      className="search-input"
                      value={formState.headerBgColor ?? ""}
                      onChange={(event) => handleChange("headerBgColor", event.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Header Gradyan (örn: linear-gradient(...))</label>
                  <input
                    className="search-input"
                    placeholder="linear-gradient(to right, #0a4ea3, #1e3a5f)"
                    value={formState.headerBgGradient ?? ""}
                    onChange={(event) => handleChange("headerBgGradient", event.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Menü Yazı Rengi</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="color"
                      value={formState.headerNavColor || "#ffffff"}
                      onChange={(event) => handleChange("headerNavColor", event.target.value)}
                      style={{ width: 40, height: 32 }}
                    />
                    <input
                      className="search-input"
                      value={formState.headerNavColor ?? ""}
                      onChange={(event) => handleChange("headerNavColor", event.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Menü Font</label>
                  <input
                    className="search-input"
                    placeholder="Inter, sans-serif"
                    value={formState.headerNavFont ?? ""}
                    onChange={(event) => handleChange("headerNavFont", event.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Menü Font Boyutu (px)</label>
                  <input
                    className="search-input"
                    type="number"
                    placeholder="13"
                    value={formState.headerNavFontSize ?? ""}
                    onChange={(event) => handleChange("headerNavFontSize", Number(event.target.value) || 0)}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Header Arka Plan Görseli</label>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <input
                    type="file"
                    ref={headerBgInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileUpload(e, "headerBgImage")}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => headerBgInputRef.current?.click()}
                    disabled={uploadingField === "headerBgImage"}
                  >
                    {uploadingField === "headerBgImage" ? "Yükleniyor..." : "Görsel Yükle"}
                  </button>
                  <input
                    className="search-input"
                    placeholder="veya URL"
                    value={formState.headerBgImage ?? ""}
                    onChange={(event) => handleChange("headerBgImage", event.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Header Saydamlık (0-1)</label>
                <input
                  className="search-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  placeholder="1"
                  value={formState.headerBgOpacity ?? 1}
                  onChange={(event) => handleChange("headerBgOpacity", Number(event.target.value) || 1)}
                  style={{ maxWidth: 200 }}
                />
              </div>

              {/* Footer Ayarları */}
              <div style={{ fontWeight: 600, marginTop: 8 }}>Footer Ayarları</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Footer Arka Plan Rengi</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="color"
                      value={formState.footerBgColor || "#0a4ea3"}
                      onChange={(event) => handleChange("footerBgColor", event.target.value)}
                      style={{ width: 40, height: 32 }}
                    />
                    <input
                      className="search-input"
                      value={formState.footerBgColor ?? ""}
                      onChange={(event) => handleChange("footerBgColor", event.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Footer Gradyan</label>
                  <input
                    className="search-input"
                    placeholder="linear-gradient(to right, #0a4ea3, #1e3a5f)"
                    value={formState.footerBgGradient ?? ""}
                    onChange={(event) => handleChange("footerBgGradient", event.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Footer Yazı Rengi</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="color"
                      value={formState.footerTextColor || "#ffffff"}
                      onChange={(event) => handleChange("footerTextColor", event.target.value)}
                      style={{ width: 40, height: 32 }}
                    />
                    <input
                      className="search-input"
                      value={formState.footerTextColor ?? ""}
                      onChange={(event) => handleChange("footerTextColor", event.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Footer Font</label>
                  <input
                    className="search-input"
                    placeholder="Inter, sans-serif"
                    value={formState.footerFont ?? ""}
                    onChange={(event) => handleChange("footerFont", event.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Footer Font Boyutu (px)</label>
                  <input
                    className="search-input"
                    type="number"
                    placeholder="13"
                    value={formState.footerFontSize ?? ""}
                    onChange={(event) => handleChange("footerFontSize", Number(event.target.value) || 0)}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Footer Arka Plan Görseli</label>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <input
                    type="file"
                    ref={footerBgInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileUpload(e, "footerBgImage")}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => footerBgInputRef.current?.click()}
                    disabled={uploadingField === "footerBgImage"}
                  >
                    {uploadingField === "footerBgImage" ? "Yükleniyor..." : "Görsel Yükle"}
                  </button>
                  <input
                    className="search-input"
                    placeholder="veya URL"
                    value={formState.footerBgImage ?? ""}
                    onChange={(event) => handleChange("footerBgImage", event.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Footer Saydamlık (0-1)</label>
                <input
                  className="search-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  placeholder="1"
                  value={formState.footerBgOpacity ?? 1}
                  onChange={(event) => handleChange("footerBgOpacity", Number(event.target.value) || 1)}
                  style={{ maxWidth: 200 }}
                />
              </div>

              {/* Sayfa Arka Planı */}
              <div style={{ borderTop: "2px solid var(--color-border)", paddingTop: 16, marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-image" style={{ color: "var(--color-primary)" }}></i>
                  Sayfa Arka Planı (Tüm Sayfalar)
                </div>
                <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 12 }}>
                  Bu ayar tüm sayfaların arka planına uygulanır. Örneğin ev resmi, doku veya desen ekleyebilirsiniz. 
                  Banner ile karıştırmayın - banner yönetimi ayrı bir bölümde yapılır.
                </p>
                
                {/* Preview */}
                {formState.mainBgImage && (
                  <div style={{ marginBottom: 12, padding: 12, background: "#f5f5f5", borderRadius: 8, textAlign: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 8 }}>Mevcut Arka Plan:</span>
                    <img 
                      src={formState.mainBgImage} 
                      alt="Arka Plan" 
                      style={{ maxHeight: 100, maxWidth: "100%", borderRadius: 4 }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Arka Plan Rengi</label>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="color"
                        value={formState.mainBgColor || "#ffffff"}
                        onChange={(event) => handleChange("mainBgColor", event.target.value)}
                        style={{ width: 40, height: 32 }}
                      />
                      <input
                        className="search-input"
                        value={formState.mainBgColor ?? ""}
                        onChange={(event) => handleChange("mainBgColor", event.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Arka Plan Görseli</label>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="file"
                        ref={mainBgInputRef}
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileUpload(e, "mainBgImage")}
                      />
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => mainBgInputRef.current?.click()}
                        disabled={uploadingField === "mainBgImage"}
                      >
                        {uploadingField === "mainBgImage" ? "Yükleniyor..." : "Yükle"}
                      </button>
                      <input
                        className="search-input"
                        placeholder="veya URL"
                        value={formState.mainBgImage ?? ""}
                        onChange={(event) => handleChange("mainBgImage", event.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Saydamlık (0-1)</label>
                    <input
                      className="search-input"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      placeholder="1"
                      value={formState.mainBgOpacity ?? 1}
                      onChange={(event) => handleChange("mainBgOpacity", Number(event.target.value) || 1)}
                    />
                  </div>
                </div>
              </div>

              {/* Ana Sayfa Şube Butonları */}
              <div style={{ borderTop: "2px solid var(--color-border)", paddingTop: 16, marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-city" style={{ color: "var(--color-primary)" }}></i>
                  Ana Sayfa - Şube Butonları
                </div>
                <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 12 }}>
                  Ana sayfadaki şube/şehir butonlarının boyut ve görünümünü ayarlayın.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Genişlik (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="Otomatik"
                      value={formState.homeCityBtnWidth ?? ""}
                      onChange={(event) => handleChange("homeCityBtnWidth", Number(event.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Yükseklik (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="Otomatik"
                      value={formState.homeCityBtnHeight ?? ""}
                      onChange={(event) => handleChange("homeCityBtnHeight", Number(event.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Buton Aralığı (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="12"
                      value={formState.homeCityBtnGap ?? ""}
                      onChange={(event) => handleChange("homeCityBtnGap", Number(event.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Köşe Yuvarlaklığı (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="12"
                      value={formState.homeCityBtnBorderRadius ?? ""}
                      onChange={(event) => handleChange("homeCityBtnBorderRadius", Number(event.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Hizalama</label>
                    <select
                      className="search-input"
                      value={formState.homeCityBtnAlign ?? "center"}
                      onChange={(event) => handleChange("homeCityBtnAlign", event.target.value)}
                    >
                      <option value="left">Sola</option>
                      <option value="center">Ortaya</option>
                      <option value="right">Sağa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ana Sayfa Aksiyon Butonları */}
              <div style={{ borderTop: "2px solid var(--color-border)", paddingTop: 16, marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-hand-pointer" style={{ color: "var(--color-primary)" }}></i>
                  Ana Sayfa - Aksiyon Butonları
                </div>
                <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 12 }}>
                  Ana sayfadaki aksiyon butonlarının boyut ve görünümünü ayarlayın.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Genişlik (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="Otomatik"
                      value={formState.homeActionBtnWidth ?? ""}
                      onChange={(event) => handleChange("homeActionBtnWidth", Number(event.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Yükseklik (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="Otomatik"
                      value={formState.homeActionBtnHeight ?? ""}
                      onChange={(event) => handleChange("homeActionBtnHeight", Number(event.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Buton Aralığı (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="12"
                      value={formState.homeActionBtnGap ?? ""}
                      onChange={(event) => handleChange("homeActionBtnGap", Number(event.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Köşe Yuvarlaklığı (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="8"
                      value={formState.homeActionBtnBorderRadius ?? ""}
                      onChange={(event) => handleChange("homeActionBtnBorderRadius", Number(event.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Yazı Boyutu (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="14"
                      value={formState.homeActionBtnFontSize ?? ""}
                      onChange={(event) => handleChange("homeActionBtnFontSize", Number(event.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              {/* Şube Butonu Yazı Ayarları */}
              <div style={{ borderTop: "2px solid var(--color-border)", paddingTop: 16, marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-font" style={{ color: "var(--color-primary)" }}></i>
                  Şube Butonu Yazı Ayarları
                </div>
                <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 12 }}>
                  Ana sayfa ve şubeler sayfasındaki buton yazılarını özelleştirin.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Başlık Rengi</label>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="color"
                        value={formState.cityBtnTitleColor || "#ffffff"}
                        onChange={(e) => handleChange("cityBtnTitleColor", e.target.value)}
                        style={{ width: 32, height: 28 }}
                      />
                      <input
                        className="search-input"
                        value={formState.cityBtnTitleColor ?? ""}
                        onChange={(e) => handleChange("cityBtnTitleColor", e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Başlık Boyutu (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="14"
                      value={formState.cityBtnTitleSize ?? ""}
                      onChange={(e) => handleChange("cityBtnTitleSize", Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Alt Yazı Rengi</label>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="color"
                        value={formState.cityBtnSubtitleColor || "#ffffff"}
                        onChange={(e) => handleChange("cityBtnSubtitleColor", e.target.value)}
                        style={{ width: 32, height: 28 }}
                      />
                      <input
                        className="search-input"
                        value={formState.cityBtnSubtitleColor ?? ""}
                        onChange={(e) => handleChange("cityBtnSubtitleColor", e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Alt Yazı Boyutu (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="11"
                      value={formState.cityBtnSubtitleSize ?? ""}
                      onChange={(e) => handleChange("cityBtnSubtitleSize", Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
                {/* Badge Settings */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Şube Etiketi (Badge)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Etiket Yazısı</label>
                      <input
                        className="search-input"
                        placeholder="Şube"
                        value={formState.cityBtnBadgeText ?? ""}
                        onChange={(e) => handleChange("cityBtnBadgeText", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Yazı Rengi</label>
                      <div style={{ display: "flex", gap: 4 }}>
                        <input
                          type="color"
                          value={formState.cityBtnBadgeColor || "#d4af37"}
                          onChange={(e) => handleChange("cityBtnBadgeColor", e.target.value)}
                          style={{ width: 32, height: 28 }}
                        />
                        <input
                          className="search-input"
                          value={formState.cityBtnBadgeColor ?? ""}
                          onChange={(e) => handleChange("cityBtnBadgeColor", e.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Arka Plan</label>
                      <div style={{ display: "flex", gap: 4 }}>
                        <input
                          type="color"
                          value={formState.cityBtnBadgeBgColor || "#000000"}
                          onChange={(e) => handleChange("cityBtnBadgeBgColor", e.target.value)}
                          style={{ width: 32, height: 28 }}
                        />
                        <input
                          className="search-input"
                          placeholder="Şeffaf"
                          value={formState.cityBtnBadgeBgColor ?? ""}
                          onChange={(e) => handleChange("cityBtnBadgeBgColor", e.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "var(--color-muted)" }}>İkon</label>
                      <input
                        className="search-input"
                        placeholder="fa-solid fa-location-dot"
                        value={formState.cityBtnBadgeIcon ?? ""}
                        onChange={(e) => handleChange("cityBtnBadgeIcon", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Göster</label>
                      <select
                        className="search-input"
                        value={formState.cityBtnShowBadge !== false ? "true" : "false"}
                        onChange={(e) => handleChange("cityBtnShowBadge", e.target.value === "true")}
                      >
                        <option value="true">Evet</option>
                        <option value="false">Hayır</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bölüm Başlıkları */}
              <div style={{ borderTop: "2px solid var(--color-border)", paddingTop: 16, marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-heading" style={{ color: "var(--color-primary)" }}></i>
                  Bölüm Başlıkları
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Şube İlanları Başlığı</label>
                    <input
                      className="search-input"
                      placeholder="Şube İlanları"
                      value={formState.branchSectionTitle ?? ""}
                      onChange={(e) => handleChange("branchSectionTitle", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Son İlanlar Başlığı</label>
                    <input
                      className="search-input"
                      placeholder="Son Yüklenen İlanlar"
                      value={formState.recentListingsTitle ?? ""}
                      onChange={(e) => handleChange("recentListingsTitle", e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 8 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Başlık Rengi</label>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="color"
                        value={formState.sectionTitleColor || "#0a4ea3"}
                        onChange={(e) => handleChange("sectionTitleColor", e.target.value)}
                        style={{ width: 32, height: 28 }}
                      />
                      <input
                        className="search-input"
                        value={formState.sectionTitleColor ?? ""}
                        onChange={(e) => handleChange("sectionTitleColor", e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Font</label>
                    <input
                      className="search-input"
                      placeholder="Manrope, sans-serif"
                      value={formState.sectionTitleFont ?? ""}
                      onChange={(e) => handleChange("sectionTitleFont", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Boyut (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      placeholder="18"
                      value={formState.sectionTitleSize ?? ""}
                      onChange={(e) => handleChange("sectionTitleSize", Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              {/* Tüm İlanları Gör Butonu */}
              <div style={{ borderTop: "2px solid var(--color-border)", paddingTop: 16, marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-arrow-right" style={{ color: "var(--color-primary)" }}></i>
                  Tüm İlanları Gör Butonu
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Buton Yazısı</label>
                    <input
                      className="search-input"
                      placeholder="Tüm İlanları Gör"
                      value={formState.viewAllBtnText ?? ""}
                      onChange={(e) => handleChange("viewAllBtnText", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Arka Plan Rengi</label>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="color"
                        value={formState.viewAllBtnBgColor || "#0a4ea3"}
                        onChange={(e) => handleChange("viewAllBtnBgColor", e.target.value)}
                        style={{ width: 32, height: 28 }}
                      />
                      <input
                        className="search-input"
                        value={formState.viewAllBtnBgColor ?? ""}
                        onChange={(e) => handleChange("viewAllBtnBgColor", e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Yazı Rengi</label>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="color"
                        value={formState.viewAllBtnTextColor || "#ffffff"}
                        onChange={(e) => handleChange("viewAllBtnTextColor", e.target.value)}
                        style={{ width: 32, height: 28 }}
                      />
                      <input
                        className="search-input"
                        value={formState.viewAllBtnTextColor ?? ""}
                        onChange={(e) => handleChange("viewAllBtnTextColor", e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer İçerik Ayarları */}
              <div style={{ borderTop: "2px solid var(--color-border)", paddingTop: 16, marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-shoe-prints" style={{ color: "var(--color-primary)" }}></i>
                  Footer İçerik Ayarları
                </div>
                <p style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 12 }}>
                  Footer'daki logo altı yazısı, adresler, telefon numaraları ve çalışma saatlerini ayarlayın.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Logo Altı Açıklama</label>
                    <textarea
                      className="search-input"
                      placeholder="Güvenilir gayrimenkul danışmanlığı hizmeti ile hayalinizdeki eve kavuşmanız için buradayız."
                      value={formState.footerLogoSubtitle ?? ""}
                      onChange={(e) => handleChange("footerLogoSubtitle", e.target.value)}
                      rows={2}
                      style={{ resize: "vertical" }}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Adres 1</label>
                    <input
                      className="search-input"
                      placeholder="Adres satırı 1"
                      value={formState.footerAddress ?? ""}
                      onChange={(e) => handleChange("footerAddress", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Adres 2</label>
                    <input
                      className="search-input"
                      placeholder="Adres satırı 2"
                      value={formState.footerAddress2 ?? ""}
                      onChange={(e) => handleChange("footerAddress2", e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 8 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Telefon 1</label>
                    <input
                      className="search-input"
                      placeholder="0543 306 14 99"
                      value={formState.footerPhone ?? ""}
                      onChange={(e) => handleChange("footerPhone", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Telefon 2</label>
                    <input
                      className="search-input"
                      placeholder="İkinci telefon (opsiyonel)"
                      value={formState.footerPhone2 ?? ""}
                      onChange={(e) => handleChange("footerPhone2", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>E-posta</label>
                    <input
                      className="search-input"
                      placeholder="info@example.com"
                      value={formState.footerEmail ?? ""}
                      onChange={(e) => handleChange("footerEmail", e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Çalışma Saatleri</label>
                    <input
                      className="search-input"
                      placeholder="Pzt-Cmt: 09:00 - 18:00"
                      value={formState.footerWorkingHours ?? ""}
                      onChange={(e) => handleChange("footerWorkingHours", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Copyright Yazısı</label>
                    <input
                      className="search-input"
                      placeholder="© 2026 Emlaknomi — Tüm hakları saklıdır."
                      value={formState.footerCopyright ?? ""}
                      onChange={(e) => handleChange("footerCopyright", e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Harita Linki Göster</label>
                    <select
                      className="search-input"
                      value={formState.footerShowMap ? "true" : "false"}
                      onChange={(e) => handleChange("footerShowMap", e.target.value === "true")}
                    >
                      <option value="false">Hayır</option>
                      <option value="true">Evet</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Harita URL</label>
                    <input
                      className="search-input"
                      placeholder="Google Maps linki"
                      value={formState.footerMapUrl ?? ""}
                      onChange={(e) => handleChange("footerMapUrl", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Sosyal Medya Linkleri */}
              <div style={{ fontWeight: 600, marginTop: 8 }}>Sosyal Medya</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input
                  className="search-input"
                  placeholder="Instagram URL"
                  value={formState.instagramUrl ?? ""}
                  onChange={(event) => handleChange("instagramUrl", event.target.value)}
                />
                <input
                  className="search-input"
                  placeholder="Facebook URL"
                  value={formState.facebookUrl ?? ""}
                  onChange={(event) => handleChange("facebookUrl", event.target.value)}
                />
                <input
                  className="search-input"
                  placeholder="YouTube URL"
                  value={formState.youtubeUrl ?? ""}
                  onChange={(event) => handleChange("youtubeUrl", event.target.value)}
                />
                <input
                  className="search-input"
                  placeholder="Twitter URL"
                  value={formState.twitterUrl ?? ""}
                  onChange={(event) => handleChange("twitterUrl", event.target.value)}
                />
              </div>
              
              <button className="btn" disabled={status === "saving"} style={{ marginTop: 8 }}>
                {status === "saving" ? "Kaydediliyor..." : "Tüm Ayarları Kaydet"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
