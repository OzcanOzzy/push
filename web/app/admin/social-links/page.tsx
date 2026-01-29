"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type SocialLink = {
  id: string;
  label: string;
  url: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
};

const ICON_OPTIONS = [
  { value: "fa-brands fa-instagram", label: "Instagram" },
  { value: "fa-brands fa-facebook-f", label: "Facebook" },
  { value: "fa-brands fa-youtube", label: "YouTube" },
  { value: "fa-brands fa-twitter", label: "Twitter" },
  { value: "fa-brands fa-linkedin-in", label: "LinkedIn" },
  { value: "fa-brands fa-whatsapp", label: "WhatsApp" },
  { value: "fa-brands fa-telegram", label: "Telegram" },
  { value: "fa-brands fa-tiktok", label: "TikTok" },
  { value: "fa-brands fa-pinterest", label: "Pinterest" },
  { value: "fa-solid fa-envelope", label: "E-posta" },
  { value: "fa-solid fa-phone", label: "Telefon" },
  { value: "fa-solid fa-globe", label: "Web Sitesi" },
  { value: "fa-solid fa-map-marker-alt", label: "Konum" },
  { value: "fa-solid fa-link", label: "Link" },
];

const defaultForm = {
  label: "",
  url: "",
  icon: "fa-solid fa-link",
  isActive: true,
};

export default function AdminSocialLinksPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ ...defaultForm });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    if (token) {
      loadLinks(token);
    }
  }, []);

  const loadLinks = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/social-links/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLinks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    if (!form.label || !form.url) {
      setError("Etiket ve URL zorunludur.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `${API_BASE_URL}/social-links/${editingId}`
      : `${API_BASE_URL}/social-links`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: form.label,
          url: form.url,
          icon: form.icon,
          isActive: form.isActive,
        }),
      });

      if (res.ok) {
        setSuccess(editingId ? "Link güncellendi!" : "Link eklendi!");
        await loadLinks(token);
        resetForm();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("İşlem başarısız.");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucu hatası.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (link: SocialLink) => {
    setEditingId(link.id);
    setForm({
      label: link.label,
      url: link.url,
      icon: link.icon,
      isActive: link.isActive,
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu linki silmek istediğinize emin misiniz?")) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/social-links/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccess("Link silindi!");
        await loadLinks(token);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const newLinks = [...links];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;

    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    const ids = newLinks.map((l) => l.id);

    try {
      await fetch(`${API_BASE_URL}/social-links/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
      });
      await loadLinks(token);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...defaultForm });
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Sosyal Medya Linkleri</div>
          <div className="card"><div className="card-body">Yükleniyor...</div></div>
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Sosyal Medya Linkleri</div>
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
        <div className="section-title">Sosyal Medya Linkleri</div>
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
              {editingId ? "Link Düzenle" : "Yeni Link Ekle"}
            </div>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
              <input
                className="search-input"
                placeholder="Etiket (örn: Instagram) *"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                required
              />
              <input
                className="search-input"
                placeholder="URL (örn: https://instagram.com/hesap) *"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                required
              />

              {/* Icon Selection */}
              <div>
                <label style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4, display: "block" }}>
                  İkon Seçin
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, icon: opt.value })}
                      style={{
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: form.icon === opt.value ? "2px solid #0a4ea3" : "1px solid var(--color-border)",
                        borderRadius: 6,
                        background: form.icon === opt.value ? "#e0f2fe" : "#fff",
                        cursor: "pointer",
                      }}
                      title={opt.label}
                    >
                      <i className={opt.value} style={{ fontSize: 16, color: form.icon === opt.value ? "#0a4ea3" : "#666" }}></i>
                    </button>
                  ))}
                </div>
                <input
                  className="search-input"
                  placeholder="veya özel ikon sınıfı (fa-brands fa-...)"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
              </div>

              {/* Active Checkbox */}
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <span>Aktif</span>
              </label>

              {/* Preview */}
              <div style={{ padding: 12, background: "#0a4ea3", borderRadius: 8, textAlign: "center" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 8 }}>Önizleme:</span>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "50%",
                    color: "#fff",
                    fontSize: 18,
                  }}
                >
                  <i className={form.icon}></i>
                </a>
                <div style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>{form.label || "Etiket"}</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" type="submit" disabled={saving} style={{ flex: 1 }}>
                  {saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Ekle"}
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
                  <div style={{ fontWeight: 700 }}>Mevcut Linkler ({links.length})</div>
                  <button className="btn" onClick={resetForm}>
                    <i className="fa-solid fa-plus" style={{ marginRight: 6 }}></i>
                    Yeni Ekle
                  </button>
                </div>

                {links.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "var(--color-muted)" }}>
                    Henüz sosyal medya linki eklenmemiş.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {links.map((link, index) => (
                      <div
                        key={link.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: 12,
                          border: "1px solid var(--color-border)",
                          borderRadius: 8,
                          opacity: link.isActive ? 1 : 0.5,
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
                            disabled={index === links.length - 1}
                          >
                            ↓
                          </button>
                        </div>

                        {/* Icon */}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#0a4ea3",
                            borderRadius: "50%",
                            color: "#fff",
                            fontSize: 16,
                          }}
                        >
                          <i className={link.icon}></i>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600 }}>{link.label}</div>
                          <div style={{ fontSize: 12, color: "var(--color-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {link.url}
                          </div>
                        </div>

                        {/* Status */}
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            backgroundColor: link.isActive ? "#10b981" : "#ef4444",
                            color: "white",
                          }}
                        >
                          {link.isActive ? "Aktif" : "Pasif"}
                        </span>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-outline"
                            style={{ padding: "6px 10px", fontSize: 11 }}
                            onClick={() => handleEdit(link)}
                          >
                            Düzenle
                          </button>
                          <button
                            className="btn btn-outline"
                            style={{ padding: "6px 10px", fontSize: 11, color: "var(--color-accent)" }}
                            onClick={() => handleDelete(link.id)}
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
