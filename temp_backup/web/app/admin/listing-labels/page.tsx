"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ListingLabel = {
  id: string;
  name: string;
  slug: string;
  textColor: string;
  bgColor: string;
  borderRadius: number;
  isRounded: boolean;
  sortOrder: number;
  isActive: boolean;
};

export default function ListingLabelsPage() {
  const [labels, setLabels] = useState<ListingLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    textColor: "#ffffff",
    bgColor: "#10b981",
    borderRadius: 4,
    isRounded: false,
    isActive: true,
  });

  useEffect(() => {
    loadLabels();
  }, []);

  const loadLabels = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/listing-labels/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLabels(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      slug: "",
      textColor: "#ffffff",
      bgColor: "#10b981",
      borderRadius: 4,
      isRounded: false,
      isActive: true,
    });
  };

  const handleEdit = (label: ListingLabel) => {
    setEditingId(label.id);
    setForm({
      name: label.name,
      slug: label.slug,
      textColor: label.textColor,
      bgColor: label.bgColor,
      borderRadius: label.borderRadius,
      isRounded: label.isRounded,
      isActive: label.isActive,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Giriş yapmanız gerekiyor.");
      return;
    }

    if (!form.name.trim()) {
      setError("Etiket adı zorunludur.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      textColor: form.textColor,
      bgColor: form.bgColor,
      borderRadius: form.isRounded ? 999 : form.borderRadius,
      isRounded: form.isRounded,
      isActive: form.isActive,
    };

    try {
      const url = editingId
        ? `${API_BASE_URL}/listing-labels/${editingId}`
        : `${API_BASE_URL}/listing-labels`;
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
        await loadLabels();
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
    if (!confirm("Bu etiketi silmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/listing-labels/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSuccess("Silindi!");
        await loadLabels();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Silme hatası.");
    }
  };

  const moveLabel = async (id: string, direction: "up" | "down") => {
    const idx = labels.findIndex((label) => label.id === id);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === labels.length - 1) return;

    const newLabels = [...labels];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newLabels[idx], newLabels[swapIdx]] = [newLabels[swapIdx], newLabels[idx]];
    setLabels(newLabels);

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/listing-labels/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: newLabels.map((l) => l.id) }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Preset colors
  const presetColors = [
    { name: "Yeşil", bg: "#10b981", text: "#ffffff" },
    { name: "Kırmızı", bg: "#ef4444", text: "#ffffff" },
    { name: "Mavi", bg: "#3b82f6", text: "#ffffff" },
    { name: "Sarı", bg: "#f59e0b", text: "#000000" },
    { name: "Mor", bg: "#8b5cf6", text: "#ffffff" },
    { name: "Pembe", bg: "#ec4899", text: "#ffffff" },
    { name: "Turuncu", bg: "#f97316", text: "#ffffff" },
    { name: "Camgöbeği", bg: "#06b6d4", text: "#ffffff" },
  ];

  return (
    <main className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="section-title" style={{ margin: 0 }}>İlan Etiketleri</div>
          <Link href="/admin" className="btn btn-outline">
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }}></i>
            Panele Dön
          </Link>
        </div>

        <p style={{ color: "var(--color-muted)", marginBottom: 20 }}>
          İlan kartlarında görünecek özel etiketler oluşturun. "Satılık" ve "Kiralık" etiketleri sistem tarafından otomatik eklenir.
          Buradan ek etiketler (Fırsat, Yeni, Kampanya vb.) tanımlayabilirsiniz.
        </p>

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
              {editingId ? "Etiket Düzenle" : "Yeni Etiket Ekle"}
            </div>

            {/* Preview */}
            <div style={{ marginBottom: 16, padding: 16, background: "#f3f4f6", borderRadius: 8, textAlign: "center" }}>
              <span style={{ fontSize: 12, color: "var(--color-muted)", display: "block", marginBottom: 8 }}>Önizleme:</span>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  backgroundColor: form.bgColor,
                  color: form.textColor,
                  borderRadius: form.isRounded ? "999px" : `${form.borderRadius}px`,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {form.name || "Etiket Adı"}
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Etiket Adı *</label>
                  <input
                    className="search-input"
                    placeholder="Örn: Fırsat"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) });
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Slug (otomatik)</label>
                  <input
                    className="search-input"
                    placeholder="firsat"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>
              </div>

              {/* Color presets */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "var(--color-muted)", display: "block", marginBottom: 6 }}>Hazır Renkler:</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {presetColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setForm({ ...form, bgColor: color.bg, textColor: color.text })}
                      style={{
                        padding: "4px 12px",
                        backgroundColor: color.bg,
                        color: color.text,
                        border: form.bgColor === color.bg ? "2px solid #000" : "2px solid transparent",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Arka Plan Rengi</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="color"
                      value={form.bgColor}
                      onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                      style={{ width: 36, height: 32 }}
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
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Yazı Rengi</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="color"
                      value={form.textColor}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      style={{ width: 36, height: 32 }}
                    />
                    <input
                      className="search-input"
                      value={form.textColor}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Köşe Yuvarlaklığı (px)</label>
                  <input
                    className="search-input"
                    type="number"
                    value={form.borderRadius}
                    onChange={(e) => setForm({ ...form, borderRadius: Number(e.target.value), isRounded: false })}
                    disabled={form.isRounded}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Tam Yuvarlak</label>
                  <select
                    className="search-input"
                    value={form.isRounded ? "true" : "false"}
                    onChange={(e) => setForm({ ...form, isRounded: e.target.value === "true" })}
                  >
                    <option value="false">Hayır (Köşeli)</option>
                    <option value="true">Evet (Yuvarlak)</option>
                  </select>
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

        {/* System Labels Info */}
        <div className="card" style={{ marginBottom: 20, background: "#f0f9ff" }}>
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              <i className="fa-solid fa-info-circle" style={{ marginRight: 8, color: "#3b82f6" }}></i>
              Sistem Etiketleri
            </div>
            <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 12 }}>
              Aşağıdaki etiketler sistem tarafından otomatik eklenir ve ilan durumuna göre gösterilir:
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={{ padding: "4px 12px", backgroundColor: "#dc2626", color: "#fff", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                Satılık
              </span>
              <span style={{ padding: "4px 12px", backgroundColor: "#f59e0b", color: "#000", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                Kiralık
              </span>
              <span style={{ padding: "4px 12px", backgroundColor: "#10b981", color: "#fff", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                Fırsat
              </span>
            </div>
          </div>
        </div>

        {/* Custom Labels List */}
        <div className="card">
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Özel Etiketler ({labels.length})</div>
            {loading ? (
              <p>Yükleniyor...</p>
            ) : labels.length === 0 ? (
              <p style={{ color: "var(--color-muted)" }}>Henüz özel etiket eklenmemiş.</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {labels.map((label, idx) => (
                  <div
                    key={label.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      background: label.isActive ? "#f0fdf4" : "#fef2f2",
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "2px 6px", fontSize: 10 }}
                        onClick={() => moveLabel(label.id, "up")}
                        disabled={idx === 0}
                      >
                        ▲
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "2px 6px", fontSize: 10 }}
                        onClick={() => moveLabel(label.id, "down")}
                        disabled={idx === labels.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        backgroundColor: label.bgColor,
                        color: label.textColor,
                        borderRadius: label.isRounded ? "999px" : `${label.borderRadius}px`,
                        fontSize: 12,
                        fontWeight: 600,
                        minWidth: 80,
                        textAlign: "center",
                      }}
                    >
                      {label.name}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                        Slug: {label.slug} | Köşe: {label.isRounded ? "Yuvarlak" : `${label.borderRadius}px`}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-outline" style={{ padding: "4px 12px" }} onClick={() => handleEdit(label)}>
                        Düzenle
                      </button>
                      <button
                        className="btn"
                        style={{ padding: "4px 12px", backgroundColor: "#dc2626", borderColor: "#dc2626" }}
                        onClick={() => handleDelete(label.id)}
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
