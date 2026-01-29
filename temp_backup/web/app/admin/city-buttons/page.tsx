"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type City = {
  id: string;
  name: string;
  slug: string;
};

type CityButton = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  icon?: string | null;
  iconColor?: string | null;
  bgColor?: string | null;
  borderColor?: string | null;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
  isActive: boolean;
  cityId?: string | null;
  city?: City | null;
  address?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
  consultantName?: string | null;
};

const defaultForm = {
  name: "",
  slug: "",
  imageUrl: "",
  icon: "fa-solid fa-location-dot",
  iconColor: "#d4af37",
  bgColor: "#0c2340",
  borderColor: "#d4af37",
  width: 90,
  height: 90,
  isActive: true,
  cityId: "",
  address: "",
  phone: "",
  whatsappNumber: "",
  email: "",
  consultantName: "",
};

export default function AdminCityButtonsPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [buttons, setButtons] = useState<CityButton[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ ...defaultForm });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    if (token) {
      loadData(token);
    }
  }, []);

  const loadData = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [buttonsRes, citiesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/city-buttons/admin`, { headers }),
        fetch(`${API_BASE_URL}/cities`),
      ]);

      if (buttonsRes.ok) {
        const data = await buttonsRes.json();
        setButtons(Array.isArray(data) ? data : []);
      }
      if (citiesRes.ok) {
        const data = await citiesRes.json();
        setCities(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Load error:", err);
      setError("Veriler yüklenirken hata oluştu.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    setUploading(true);
    setError("");
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch(`${API_BASE_URL}/settings/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({ ...prev, imageUrl: `${API_BASE_URL}${data.url}` }));
        setSuccess("Görsel yüklendi!");
        setTimeout(() => setSuccess(""), 2000);
      }
    } catch (err) {
      console.error(err);
      setError("Görsel yüklenemedi.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Giriş yapmanız gerekiyor.");
      return;
    }

    if (!form.name || !form.slug) {
      setError("Ad ve slug zorunludur.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `${API_BASE_URL}/city-buttons/${editingId}`
      : `${API_BASE_URL}/city-buttons`;

    const payload = {
      name: form.name,
      slug: form.slug,
      imageUrl: form.imageUrl || null,
      icon: form.icon || null,
      iconColor: form.iconColor || null,
      bgColor: form.bgColor || null,
      borderColor: form.borderColor || null,
      width: form.width ? Number(form.width) : null,
      height: form.height ? Number(form.height) : null,
      isActive: Boolean(form.isActive),
      cityId: form.cityId || null,
      address: form.address || null,
      phone: form.phone || null,
      whatsappNumber: form.whatsappNumber || null,
      email: form.email || null,
      consultantName: form.consultantName || null,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(editingId ? "Buton güncellendi!" : "Buton eklendi!");
        await loadData(token);
        resetForm();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || "İşlem başarısız.");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucu hatası.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (btn: CityButton) => {
    setEditingId(btn.id);
    setForm({
      name: btn.name,
      slug: btn.slug,
      imageUrl: btn.imageUrl || "",
      icon: btn.icon || "fa-solid fa-location-dot",
      iconColor: btn.iconColor || "#d4af37",
      bgColor: btn.bgColor || "#0c2340",
      borderColor: btn.borderColor || "#d4af37",
      width: btn.width || 90,
      height: btn.height || 90,
      isActive: btn.isActive,
      cityId: btn.cityId || "",
      address: btn.address || "",
      phone: btn.phone || "",
      whatsappNumber: btn.whatsappNumber || "",
      email: btn.email || "",
      consultantName: btn.consultantName || "",
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu butonu silmek istediğinize emin misiniz?")) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/city-buttons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccess("Buton silindi!");
        await loadData(token);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Silme işlemi başarısız.");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucu hatası.");
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const newButtons = [...buttons];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newButtons.length) return;

    [newButtons[index], newButtons[targetIndex]] = [newButtons[targetIndex], newButtons[index]];
    const ids = newButtons.map((b) => b.id);

    try {
      await fetch(`${API_BASE_URL}/city-buttons/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
      });
      await loadData(token);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...defaultForm });
  };

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Şehir Butonları</div>
          <div className="card"><div className="card-body">Yükleniyor...</div></div>
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Şehir Butonları</div>
          <div className="card">
            <div className="card-body">
              <Link href="/admin/login" className="btn btn-outline">Giriş Yap</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">Şehir Butonları</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Link href="/admin" className="btn btn-outline">← Yönetim Paneli</Link>
        </div>

        {error && (
          <div className="card" style={{ marginBottom: 16, background: "#fef2f2", borderColor: "#fca5a5" }}>
            <div className="card-body" style={{ color: "#dc2626" }}>{error}</div>
          </div>
        )}
        {success && (
          <div className="card" style={{ marginBottom: 16, background: "#f0fdf4", borderColor: "#86efac" }}>
            <div className="card-body" style={{ color: "#16a34a" }}>{success}</div>
          </div>
        )}

        <div className="layout-grid">
          <aside className="sidebar">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              {editingId ? "Buton Düzenle" : "Yeni Buton Ekle"}
            </div>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
              <input
                className="search-input"
                placeholder="Buton Adı *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="search-input"
                placeholder="Slug (URL) *"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
              />
              <select
                className="search-input"
                value={form.cityId}
                onChange={(e) => setForm({ ...form, cityId: e.target.value })}
              >
                <option value="">Şehir seçin (opsiyonel)</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>

              {/* Image Upload */}
              <div>
                <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Buton Görseli</label>
                {form.imageUrl && (
                  <div style={{ marginTop: 4, marginBottom: 8 }}>
                    <img
                      src={resolveImageUrl(form.imageUrl) || ""}
                      alt="Preview"
                      style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                    />
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
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
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Yükleniyor..." : "Görsel Yükle"}
                  </button>
                </div>
                <input
                  className="search-input"
                  placeholder="veya Görsel URL"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  style={{ marginTop: 4 }}
                />
              </div>

              {/* Icon Settings */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
                <label style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 600 }}>İkon Ayarları</label>
                <input
                  className="search-input"
                  placeholder="İkon (fa-solid fa-building)"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  style={{ marginTop: 4 }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "var(--color-muted)" }}>İkon Rengi</label>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="color"
                        value={form.iconColor}
                        onChange={(e) => setForm({ ...form, iconColor: e.target.value })}
                        style={{ width: 32, height: 28 }}
                      />
                      <input
                        className="search-input"
                        value={form.iconColor}
                        onChange={(e) => setForm({ ...form, iconColor: e.target.value })}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Settings */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
                <label style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 600 }}>Renk Ayarları</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Arka Plan</label>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="color"
                        value={form.bgColor}
                        onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                        style={{ width: 32, height: 28 }}
                      />
                      <input
                        className="search-input"
                        value={form.bgColor}
                        onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Kenarlık</label>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="color"
                        value={form.borderColor}
                        onChange={(e) => setForm({ ...form, borderColor: e.target.value })}
                        style={{ width: 32, height: 28 }}
                      />
                      <input
                        className="search-input"
                        value={form.borderColor}
                        onChange={(e) => setForm({ ...form, borderColor: e.target.value })}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Size Settings */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
                <label style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 600 }}>Boyut Ayarları</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Genişlik (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      value={form.width}
                      onChange={(e) => setForm({ ...form, width: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Yükseklik (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      value={form.height}
                      onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
                <label style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 600 }}>İletişim Bilgileri</label>
                <input
                  className="search-input"
                  placeholder="Danışman Adı"
                  value={form.consultantName}
                  onChange={(e) => setForm({ ...form, consultantName: e.target.value })}
                  style={{ marginTop: 4 }}
                />
                <input
                  className="search-input"
                  placeholder="Telefon"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={{ marginTop: 4 }}
                />
                <input
                  className="search-input"
                  placeholder="WhatsApp"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  style={{ marginTop: 4 }}
                />
                <input
                  className="search-input"
                  placeholder="E-posta"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ marginTop: 4 }}
                />
                <textarea
                  className="search-input"
                  placeholder="Adres"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  style={{ marginTop: 4, resize: "vertical" }}
                />
              </div>

              {/* Active Checkbox */}
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <span>Aktif</span>
              </label>

              {/* Preview */}
              <div style={{ marginTop: 8, padding: 12, background: "#f5f5f5", borderRadius: 8, textAlign: "center" }}>
                <span style={{ fontSize: 11, color: "var(--color-muted)", display: "block", marginBottom: 8 }}>Önizleme:</span>
                <div
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: form.width || 90,
                    height: form.height || 90,
                    backgroundColor: form.bgColor || "#0c2340",
                    border: `2px solid ${form.borderColor || "#d4af37"}`,
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  {form.imageUrl ? (
                    <img
                      src={resolveImageUrl(form.imageUrl) || ""}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <i className={form.icon || "fa-solid fa-location-dot"} style={{ fontSize: 24, color: form.iconColor || "#d4af37" }}></i>
                  )}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600 }}>{form.name || "Buton Adı"}</div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn" type="submit" disabled={saving} style={{ flex: 1 }}>
                  {saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Yeni Ekle"}
                </button>
                {editingId && (
                  <button className="btn btn-outline" type="button" onClick={resetForm}>
                    İptal
                  </button>
                )}
              </div>
            </form>
          </aside>

          <section>
            <div className="card">
              <div className="card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 700 }}>Mevcut Butonlar ({buttons.length})</div>
                  <button className="btn" onClick={resetForm}>
                    <i className="fa-solid fa-plus" style={{ marginRight: 6 }}></i>
                    Yeni Ekle
                  </button>
                </div>

                {buttons.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "var(--color-muted)" }}>
                    Henüz buton eklenmemiş.
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid var(--color-border)", textAlign: "left" }}>
                          <th style={{ padding: "8px 4px", width: 60 }}>Sıra</th>
                          <th style={{ padding: "8px 4px", width: 80 }}>Önizleme</th>
                          <th style={{ padding: "8px 4px" }}>Ad</th>
                          <th style={{ padding: "8px 4px", width: 80 }}>Boyut</th>
                          <th style={{ padding: "8px 4px", width: 70 }}>Durum</th>
                          <th style={{ padding: "8px 4px", width: 140 }}>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {buttons.map((btn, index) => (
                          <tr key={btn.id} style={{ borderBottom: "1px solid var(--color-border)", opacity: btn.isActive ? 1 : 0.5 }}>
                            <td style={{ padding: "8px 4px" }}>
                              <div style={{ display: "flex", gap: 4 }}>
                                <button
                                  className="btn btn-outline"
                                  style={{ padding: "4px 8px", fontSize: 11 }}
                                  onClick={() => handleReorder(index, "up")}
                                  disabled={index === 0}
                                >
                                  ↑
                                </button>
                                <button
                                  className="btn btn-outline"
                                  style={{ padding: "4px 8px", fontSize: 11 }}
                                  onClick={() => handleReorder(index, "down")}
                                  disabled={index === buttons.length - 1}
                                >
                                  ↓
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: "8px 4px" }}>
                              <div
                                style={{
                                  width: 60,
                                  height: 60,
                                  backgroundColor: btn.bgColor || "#0c2340",
                                  border: `2px solid ${btn.borderColor || "#d4af37"}`,
                                  borderRadius: 6,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  overflow: "hidden",
                                }}
                              >
                                {btn.imageUrl ? (
                                  <img src={resolveImageUrl(btn.imageUrl) || ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <i className={btn.icon || "fa-solid fa-location-dot"} style={{ fontSize: 18, color: btn.iconColor || "#d4af37" }}></i>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: "8px 4px" }}>
                              <div style={{ fontWeight: 600 }}>{btn.name}</div>
                              <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{btn.city?.name || btn.slug}</div>
                            </td>
                            <td style={{ padding: "8px 4px", fontSize: 11 }}>
                              {btn.width || 90}x{btn.height || 90}
                            </td>
                            <td style={{ padding: "8px 4px" }}>
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  fontSize: 11,
                                  backgroundColor: btn.isActive ? "#10b981" : "#ef4444",
                                  color: "white",
                                }}
                              >
                                {btn.isActive ? "Aktif" : "Pasif"}
                              </span>
                            </td>
                            <td style={{ padding: "8px 4px" }}>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  className="btn btn-outline"
                                  style={{ padding: "6px 10px", fontSize: 11 }}
                                  onClick={() => handleEdit(btn)}
                                >
                                  Düzenle
                                </button>
                                <button
                                  className="btn btn-outline"
                                  style={{ padding: "6px 10px", fontSize: 11, color: "var(--color-accent)" }}
                                  onClick={() => handleDelete(btn.id)}
                                >
                                  Sil
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
