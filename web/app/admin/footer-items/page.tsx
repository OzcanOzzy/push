"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type FooterItem = {
  id: string;
  type: string;
  label: string | null;
  value: string;
  linkUrl: string | null;
  icon: string | null;
  iconColor: string | null;
  textColor: string | null;
  sortOrder: number;
  isActive: boolean;
};

const ITEM_TYPES = [
  { value: "address", label: "Adres", defaultIcon: "fa-solid fa-location-dot" },
  { value: "phone", label: "Telefon", defaultIcon: "fa-solid fa-phone" },
  { value: "email", label: "E-posta", defaultIcon: "fa-solid fa-envelope" },
  { value: "map", label: "Harita", defaultIcon: "fa-solid fa-map-location-dot" },
  { value: "text", label: "Metin", defaultIcon: "fa-solid fa-align-left" },
  { value: "link", label: "Link", defaultIcon: "fa-solid fa-link" },
  { value: "whatsapp", label: "WhatsApp", defaultIcon: "fa-brands fa-whatsapp" },
  { value: "social", label: "Sosyal Medya", defaultIcon: "fa-solid fa-share-nodes" },
];

const ICONS = [
  "fa-solid fa-location-dot",
  "fa-solid fa-phone",
  "fa-solid fa-envelope",
  "fa-solid fa-map-location-dot",
  "fa-solid fa-building",
  "fa-solid fa-house",
  "fa-solid fa-clock",
  "fa-solid fa-calendar",
  "fa-solid fa-user",
  "fa-solid fa-link",
  "fa-solid fa-globe",
  "fa-brands fa-whatsapp",
  "fa-brands fa-instagram",
  "fa-brands fa-facebook",
  "fa-brands fa-twitter",
  "fa-brands fa-youtube",
  "fa-brands fa-linkedin",
  "fa-solid fa-map",
  "fa-solid fa-directions",
];

export default function FooterItemsPage() {
  const [items, setItems] = useState<FooterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "address",
    label: "",
    value: "",
    linkUrl: "",
    icon: "",
    iconColor: "",
    textColor: "",
    isActive: true,
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/footer-items/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      type: "address",
      label: "",
      value: "",
      linkUrl: "",
      icon: "",
      iconColor: "",
      textColor: "",
      isActive: true,
    });
  };

  const handleEdit = (item: FooterItem) => {
    setEditingId(item.id);
    setForm({
      type: item.type,
      label: item.label || "",
      value: item.value,
      linkUrl: item.linkUrl || "",
      icon: item.icon || "",
      iconColor: item.iconColor || "",
      textColor: item.textColor || "",
      isActive: item.isActive,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Giriş yapmanız gerekiyor.");
      return;
    }

    if (!form.value.trim()) {
      setError("Değer alanı zorunludur.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const defaultIcon = ITEM_TYPES.find((t) => t.value === form.type)?.defaultIcon || "";

    const payload = {
      type: form.type,
      label: form.label || null,
      value: form.value,
      linkUrl: form.linkUrl || null,
      icon: form.icon || defaultIcon,
      iconColor: form.iconColor || null,
      textColor: form.textColor || null,
      isActive: form.isActive,
    };

    try {
      const url = editingId
        ? `${API_BASE_URL}/footer-items/${editingId}`
        : `${API_BASE_URL}/footer-items`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(editingId ? "Güncellendi!" : "Eklendi!");
        await loadItems();
        resetForm();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "İşlem başarısız.");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucu hatası.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu öğeyi silmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/footer-items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSuccess("Silindi!");
        await loadItems();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Silme hatası.");
    }
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === items.length - 1) return;

    const newItems = [...items];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];
    setItems(newItems);

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/footer-items/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: newItems.map((i) => i.id) }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="section-title" style={{ margin: 0 }}>Footer İçerikleri</div>
          <Link href="/admin" className="btn btn-outline">
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }}></i>
            Panele Dön
          </Link>
        </div>

        {error && (
          <div style={{ padding: 12, background: "#fee2e2", color: "#dc2626", borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: 12, background: "#d1fae5", color: "#059669", borderRadius: 8, marginBottom: 16 }}>
            {success}
          </div>
        )}

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              {editingId ? "İçerik Düzenle" : "Yeni İçerik Ekle"}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Tür</label>
                  <select
                    className="search-input"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {ITEM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Etiket (opsiyonel)</label>
                  <input
                    className="search-input"
                    placeholder="Örn: Merkez Ofis"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Değer *</label>
                  <input
                    className="search-input"
                    placeholder={form.type === "phone" ? "0543 306 14 99" : form.type === "email" ? "info@example.com" : "Değer girin"}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Link URL (opsiyonel)</label>
                  <input
                    className="search-input"
                    placeholder="https://maps.google.com/..."
                    value={form.linkUrl}
                    onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>İkon</label>
                  <select
                    className="search-input"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  >
                    <option value="">Varsayılan</option>
                    {ICONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>İkon Rengi</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="color"
                      value={form.iconColor || "#ffffff"}
                      onChange={(e) => setForm({ ...form, iconColor: e.target.value })}
                      style={{ width: 36, height: 32 }}
                    />
                    <input
                      className="search-input"
                      value={form.iconColor}
                      onChange={(e) => setForm({ ...form, iconColor: e.target.value })}
                      placeholder="#ffffff"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Yazı Rengi</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="color"
                      value={form.textColor || "#ffffff"}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      style={{ width: 36, height: 32 }}
                    />
                    <input
                      className="search-input"
                      value={form.textColor}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      placeholder="#ffffff"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Aktif
                </label>
                <button type="submit" className="btn" disabled={saving}>
                  {saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Ekle"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-outline" onClick={resetForm}>
                    İptal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="card">
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Mevcut İçerikler ({items.length})</div>
            {loading ? (
              <p>Yükleniyor...</p>
            ) : items.length === 0 ? (
              <p style={{ color: "var(--color-muted)" }}>Henüz içerik eklenmemiş.</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      background: item.isActive ? "#f0fdf4" : "#fef2f2",
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "2px 6px", fontSize: 10 }}
                        onClick={() => moveItem(item.id, "up")}
                        disabled={idx === 0}
                      >
                        ▲
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "2px 6px", fontSize: 10 }}
                        onClick={() => moveItem(item.id, "down")}
                        disabled={idx === items.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                    <i
                      className={item.icon || "fa-solid fa-circle"}
                      style={{ fontSize: 20, color: item.iconColor || "var(--color-primary)", width: 30, textAlign: "center" }}
                    ></i>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {ITEM_TYPES.find((t) => t.value === item.type)?.label || item.type}
                        {item.label && <span style={{ fontWeight: 400, color: "var(--color-muted)" }}> - {item.label}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{item.value}</div>
                      {item.linkUrl && (
                        <div style={{ fontSize: 11, color: "#3b82f6" }}>{item.linkUrl}</div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-outline" style={{ padding: "4px 12px" }} onClick={() => handleEdit(item)}>
                        Düzenle
                      </button>
                      <button
                        className="btn"
                        style={{ padding: "4px 12px", backgroundColor: "#dc2626", borderColor: "#dc2626" }}
                        onClick={() => handleDelete(item.id)}
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
      </div>
    </main>
  );
}
