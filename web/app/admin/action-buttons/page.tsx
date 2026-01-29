"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ActionButton = {
  id: string;
  name: string;
  linkUrl: string;
  imageUrl?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  icon?: string | null;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
  isActive: boolean;
  borderRadius?: number | null;
  borderColor?: string | null;
  fontSize?: number | null;
  fontWeight?: string | null;
};

const defaultForm = {
  name: "",
  linkUrl: "",
  imageUrl: "",
  bgColor: "#0a4ea3",
  textColor: "#ffffff",
  icon: "",
  width: 150,
  height: 50,
  sortOrder: 0,
  isActive: true,
  borderRadius: 8,
  borderColor: "",
  fontSize: 14,
  fontWeight: "600",
};

export default function AdminActionButtonsPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [buttons, setButtons] = useState<ActionButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ ...defaultForm });

  const loadButtons = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      // Try admin endpoint first
      let data: ActionButton[] = [];
      
      if (token) {
        const res = await fetch(`${API_BASE_URL}/action-buttons/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          data = await res.json();
        }
      }
      
      // Fallback to public endpoint
      if (!data || data.length === 0) {
        const publicRes = await fetch(`${API_BASE_URL}/action-buttons`);
        if (publicRes.ok) {
          data = await publicRes.json();
        }
      }

      setButtons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load error:", err);
      setButtons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    loadButtons();
  }, []);

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

    if (!form.name || !form.linkUrl) {
      setError("Ad ve Link zorunludur.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const url = editingId
      ? `${API_BASE_URL}/action-buttons/${editingId}`
      : `${API_BASE_URL}/action-buttons`;
    const method = editingId ? "PATCH" : "POST";

    const payload = {
      name: form.name,
      linkUrl: form.linkUrl,
      imageUrl: form.imageUrl || null,
      bgColor: form.bgColor || null,
      textColor: form.textColor || null,
      icon: form.icon || null,
      width: form.width ? Number(form.width) : null,
      height: form.height ? Number(form.height) : null,
      sortOrder: form.sortOrder,
      isActive: Boolean(form.isActive),
      borderRadius: form.borderRadius ? Number(form.borderRadius) : null,
      borderColor: form.borderColor || null,
      fontSize: form.fontSize ? Number(form.fontSize) : null,
      fontWeight: form.fontWeight || null,
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
        await loadButtons();
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

  const handleEdit = (btn: ActionButton) => {
    setEditingId(btn.id);
    setForm({
      name: btn.name,
      linkUrl: btn.linkUrl,
      imageUrl: btn.imageUrl || "",
      bgColor: btn.bgColor || "#0a4ea3",
      textColor: btn.textColor || "#ffffff",
      icon: btn.icon || "",
      width: btn.width || 150,
      height: btn.height || 50,
      sortOrder: btn.sortOrder,
      isActive: btn.isActive,
      borderRadius: btn.borderRadius || 8,
      borderColor: btn.borderColor || "",
      fontSize: btn.fontSize || 14,
      fontWeight: btn.fontWeight || "600",
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
      const res = await fetch(`${API_BASE_URL}/action-buttons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccess("Buton silindi!");
        await loadButtons();
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

    // Update sort orders
    const updates = newButtons.map((btn, i) => ({
      id: btn.id,
      sortOrder: i,
    }));

    try {
      for (const update of updates) {
        await fetch(`${API_BASE_URL}/action-buttons/${update.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sortOrder: update.sortOrder }),
        });
      }
      await loadButtons();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...defaultForm, sortOrder: buttons.length });
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
          <div className="section-title">Aksiyon Butonları</div>
          <div className="card"><div className="card-body">Yükleniyor...</div></div>
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Aksiyon Butonları</div>
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
        <div className="section-title">Aksiyon Butonları</div>
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
                placeholder="Link URL *"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                required
              />
              <input
                className="search-input"
                placeholder="İkon (fa-solid fa-arrow-right)"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />

              {/* Image Upload */}
              <div>
                <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Buton Görseli (opsiyonel)</label>
                {form.imageUrl && (
                  <div style={{ marginTop: 4, marginBottom: 8 }}>
                    <img
                      src={resolveImageUrl(form.imageUrl) || ""}
                      alt="Preview"
                      style={{ maxWidth: 100, maxHeight: 50, objectFit: "contain", borderRadius: 4 }}
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
                    <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Yazı Rengi</label>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="color"
                        value={form.textColor}
                        onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                        style={{ width: 32, height: 28 }}
                      />
                      <input
                        className="search-input"
                        value={form.textColor}
                        onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Kenarlık Rengi (boş = yok)</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="color"
                      value={form.borderColor || "#000000"}
                      onChange={(e) => setForm({ ...form, borderColor: e.target.value })}
                      style={{ width: 32, height: 28 }}
                    />
                    <input
                      className="search-input"
                      placeholder="Yok"
                      value={form.borderColor}
                      onChange={(e) => setForm({ ...form, borderColor: e.target.value })}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              {/* Size Settings */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
                <label style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 600 }}>Boyut ve Stil</label>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Köşe Yuvarlaklığı (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      value={form.borderRadius}
                      onChange={(e) => setForm({ ...form, borderRadius: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Yazı Boyutu (px)</label>
                    <input
                      className="search-input"
                      type="number"
                      value={form.fontSize}
                      onChange={(e) => setForm({ ...form, fontSize: Number(e.target.value) })}
                    />
                  </div>
                </div>
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
                <button
                  type="button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    width: form.width || 150,
                    height: form.height || 50,
                    backgroundColor: form.bgColor || "#0a4ea3",
                    color: form.textColor || "#ffffff",
                    border: form.borderColor ? `2px solid ${form.borderColor}` : "none",
                    borderRadius: form.borderRadius || 8,
                    fontSize: form.fontSize || 14,
                    fontWeight: form.fontWeight || "600",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  {form.imageUrl ? (
                    <img src={resolveImageUrl(form.imageUrl) || ""} alt="" style={{ maxHeight: "100%", maxWidth: "100%" }} />
                  ) : (
                    <>
                      {form.icon && <i className={form.icon}></i>}
                      {form.name || "Buton Adı"}
                    </>
                  )}
                </button>
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

                {loading ? (
                  <div style={{ textAlign: "center", padding: 40 }}>Yükleniyor...</div>
                ) : buttons.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "var(--color-muted)" }}>
                    Henüz aksiyon butonu eklenmemiş.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {buttons.map((btn, index) => (
                      <div
                        key={btn.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: 12,
                          border: "1px solid var(--color-border)",
                          borderRadius: 8,
                          opacity: btn.isActive ? 1 : 0.5,
                        }}
                      >
                        {/* Reorder */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <button
                            className="btn btn-outline"
                            style={{ padding: "4px 8px", fontSize: 10 }}
                            onClick={() => handleReorder(index, "up")}
                            disabled={index === 0}
                          >
                            ↑
                          </button>
                          <button
                            className="btn btn-outline"
                            style={{ padding: "4px 8px", fontSize: 10 }}
                            onClick={() => handleReorder(index, "down")}
                            disabled={index === buttons.length - 1}
                          >
                            ↓
                          </button>
                        </div>

                        {/* Preview */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            minWidth: 100,
                            padding: "8px 16px",
                            backgroundColor: btn.bgColor || "#0a4ea3",
                            color: btn.textColor || "#ffffff",
                            borderRadius: btn.borderRadius || 8,
                            fontSize: 12,
                          }}
                        >
                          {btn.icon && <i className={btn.icon}></i>}
                          {btn.name}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{btn.linkUrl}</div>
                          <div style={{ fontSize: 11, color: "var(--color-muted)" }}>
                            Boyut: {btn.width || "auto"}x{btn.height || "auto"}
                          </div>
                        </div>

                        {/* Status */}
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

                        {/* Actions */}
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
                      </div>
                    ))}
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
