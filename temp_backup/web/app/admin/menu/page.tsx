"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  isActive: boolean;
  textColor?: string | null;
  bgColor?: string | null;
  icon?: string | null;
};

// Sistem sayfaları - her zaman gösterilecek varsayılan menüler
const systemPages = [
  { id: "sys-home", label: "Ana Sayfa", href: "/", sortOrder: 0 },
  { id: "sys-listings", label: "Tüm İlanlar", href: "/arama", sortOrder: 1 },
  { id: "sys-branches", label: "Şubeler", href: "/subeler", sortOrder: 2 },
  { id: "sys-opportunities", label: "Fırsatlar", href: "/firsatlar", sortOrder: 3 },
  { id: "sys-about", label: "Hakkımızda", href: "/hakkimizda", sortOrder: 4 },
  { id: "sys-contact", label: "İletişim", href: "/iletisim", sortOrder: 5 },
];

export default function AdminMenuPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    label: "",
    href: "",
    sortOrder: 0,
    isActive: true,
    textColor: "#ffffff",
    bgColor: "",
    icon: "",
  });

  const loadMenuItems = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token");
      // Try admin endpoint first
      let data: MenuItem[] = [];
      
      if (token) {
        const res = await fetch(`${API_BASE_URL}/menu-items/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          data = await res.json();
        }
      }
      
      // If no data from admin, try public endpoint
      if (!data || data.length === 0) {
        const publicRes = await fetch(`${API_BASE_URL}/menu-items`);
        if (publicRes.ok) {
          data = await publicRes.json();
        }
      }

      // If still no data, use system pages as default
      if (!data || data.length === 0) {
        // Convert system pages to MenuItem format
        data = systemPages.map((sp) => ({
          ...sp,
          isActive: true,
          textColor: "#ffffff",
          bgColor: null,
          icon: null,
        }));
      }

      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Menu load error:", err);
      setError("Menü öğeleri yüklenirken hata oluştu.");
      // Fallback to system pages
      setMenuItems(
        systemPages.map((sp) => ({
          ...sp,
          isActive: true,
          textColor: "#ffffff",
          bgColor: null,
          icon: null,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    loadMenuItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Giriş yapmanız gerekiyor.");
      return;
    }

    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId
        ? `${API_BASE_URL}/menu-items/${editingId}`
        : `${API_BASE_URL}/menu-items`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: form.label,
          href: form.href,
          sortOrder: form.sortOrder,
          isActive: form.isActive,
          textColor: form.textColor || null,
          bgColor: form.bgColor || null,
          icon: form.icon || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Kaydetme başarısız");
      }

      resetForm();
      await loadMenuItems();
    } catch (err) {
      console.error(err);
      setError("Menü öğesi kaydedilemedi.");
    }
  };

  const handleEdit = (item: MenuItem) => {
    // System pages can't be edited directly from API
    if (item.id.startsWith("sys-")) {
      // Create a new menu item based on system page
      setEditingId(null);
      setForm({
        label: item.label,
        href: item.href,
        sortOrder: item.sortOrder,
        isActive: true,
        textColor: item.textColor || "#ffffff",
        bgColor: item.bgColor || "",
        icon: item.icon || "",
      });
      return;
    }

    setEditingId(item.id);
    setForm({
      label: item.label,
      href: item.href,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      textColor: item.textColor || "#ffffff",
      bgColor: item.bgColor || "",
      icon: item.icon || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith("sys-")) {
      setError("Sistem sayfaları silinemez.");
      return;
    }
    
    if (!confirm("Bu menü öğesini silmek istediğinize emin misiniz?")) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/menu-items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadMenuItems();
    } catch (err) {
      console.error(err);
      setError("Silme işlemi başarısız.");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const items = [...menuItems];
    const currentItem = items[index];
    const prevItem = items[index - 1];

    // Skip if either is a system page
    if (currentItem.id.startsWith("sys-") || prevItem.id.startsWith("sys-")) {
      setError("Sistem sayfalarının sırası değiştirilemez. Önce kaydedin.");
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/menu-items/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify([
          { id: currentItem.id, sortOrder: prevItem.sortOrder },
          { id: prevItem.id, sortOrder: currentItem.sortOrder },
        ]),
      });
      await loadMenuItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === menuItems.length - 1) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const items = [...menuItems];
    const currentItem = items[index];
    const nextItem = items[index + 1];

    // Skip if either is a system page
    if (currentItem.id.startsWith("sys-") || nextItem.id.startsWith("sys-")) {
      setError("Sistem sayfalarının sırası değiştirilemez. Önce kaydedin.");
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/menu-items/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify([
          { id: currentItem.id, sortOrder: nextItem.sortOrder },
          { id: nextItem.id, sortOrder: currentItem.sortOrder },
        ]),
      });
      await loadMenuItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAllSystemPages = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Giriş yapmanız gerekiyor.");
      return;
    }

    try {
      // Save all system pages that don't exist in DB yet
      for (const sp of systemPages) {
        const existing = menuItems.find(
          (m) => !m.id.startsWith("sys-") && m.href === sp.href
        );
        if (!existing) {
          await fetch(`${API_BASE_URL}/menu-items`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              label: sp.label,
              href: sp.href,
              sortOrder: sp.sortOrder,
              isActive: true,
              textColor: "#ffffff",
            }),
          });
        }
      }
      await loadMenuItems();
    } catch (err) {
      console.error(err);
      setError("Kaydetme başarısız.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      label: "",
      href: "",
      sortOrder: menuItems.length,
      isActive: true,
      textColor: "#ffffff",
      bgColor: "",
      icon: "",
    });
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Menü Yönetimi</div>
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
          <div className="section-title">Menü Yönetimi</div>
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

  // Separate system pages and custom pages
  const hasUnsavedSystemPages = menuItems.some((m) => m.id.startsWith("sys-"));

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">Menü Yönetimi</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <Link href="/admin" className="btn btn-outline">
            ← Yönetim Paneli
          </Link>
          <button className="btn btn-outline" onClick={loadMenuItems}>
            Yenile
          </button>
          {hasUnsavedSystemPages && (
            <button className="btn" onClick={handleSaveAllSystemPages}>
              Tüm Sistem Sayfalarını Kaydet
            </button>
          )}
        </div>

        {error && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body" style={{ color: "var(--color-accent)" }}>
              {error}
              <button
                onClick={() => setError("")}
                style={{ marginLeft: 12, background: "none", border: "none", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="layout-grid">
          <aside className="sidebar">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              {editingId ? "Menü Öğesi Düzenle" : "Yeni Menü Öğesi"}
            </div>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
              <input
                className="search-input"
                placeholder="Menü Yazısı (örn: Ana Sayfa)"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                required
              />
              <input
                className="search-input"
                placeholder="Link URL (örn: / veya /hakkimizda)"
                value={form.href}
                onChange={(e) => setForm({ ...form, href: e.target.value })}
                required
              />
              <input
                className="search-input"
                placeholder="İkon (örn: fa-solid fa-home)"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Yazı Rengi</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="color"
                      value={form.textColor || "#ffffff"}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      style={{ width: 40, height: 32 }}
                    />
                    <input
                      className="search-input"
                      value={form.textColor || ""}
                      onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "var(--color-muted)" }}>Arka Plan</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      type="color"
                      value={form.bgColor || "#0a4ea3"}
                      onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                      style={{ width: 40, height: 32 }}
                    />
                    <input
                      className="search-input"
                      placeholder="Yok"
                      value={form.bgColor || ""}
                      onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                      style={{ flex: 1 }}
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
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Aktif
              </label>

              {/* Preview */}
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Önizleme:</label>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 6,
                    marginTop: 4,
                    background: form.bgColor || "#0a4ea3",
                    color: form.textColor || "#ffffff",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {form.icon && <i className={form.icon}></i>}
                  {form.label || "Menü Öğesi"}
                </div>
              </div>

              <button className="btn" type="submit">
                {editingId ? "Güncelle" : "Ekle"}
              </button>
              {editingId && (
                <button className="btn btn-outline" type="button" onClick={resetForm}>
                  İptal
                </button>
              )}
            </form>

            {/* Quick Add System Pages */}
            <div style={{ marginTop: 20, borderTop: "1px solid var(--color-border)", paddingTop: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>Hızlı Ekle</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {systemPages.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: "4px 8px", fontSize: 11 }}
                    onClick={() => {
                      setForm({
                        label: sp.label,
                        href: sp.href,
                        sortOrder: sp.sortOrder,
                        isActive: true,
                        textColor: "#ffffff",
                        bgColor: "",
                        icon: "",
                      });
                      setEditingId(null);
                    }}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="card">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 12 }}>
                  Menü Öğeleri ({menuItems.length})
                </div>
                {loading ? <div>Yükleniyor...</div> : null}
                {!loading && menuItems.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 20 }}>
                    <p>Henüz menü öğesi yok.</p>
                  </div>
                ) : null}

                <div style={{ display: "grid", gap: 8 }}>
                  {menuItems.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 12,
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        background: item.isActive ? "#fff" : "#f5f5f5",
                      }}
                    >
                      {/* Move buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "4px 8px", fontSize: 10 }}
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "4px 8px", fontSize: 10 }}
                          onClick={() => handleMoveDown(index)}
                          disabled={index === menuItems.length - 1}
                        >
                          ↓
                        </button>
                      </div>

                      {/* Preview */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 4,
                          background: item.bgColor || "#0a4ea3",
                          color: item.textColor || "#ffffff",
                          fontSize: 12,
                          minWidth: 100,
                        }}
                      >
                        {item.icon && <i className={item.icon}></i>}
                        {item.label}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{item.href}</div>
                        <div style={{ fontSize: 11, color: "var(--color-muted)" }}>
                          Sıra: {item.sortOrder}
                          {item.id.startsWith("sys-") && (
                            <span style={{ marginLeft: 8, color: "var(--color-primary)" }}>
                              (Sistem - Kaydetilmemiş)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          backgroundColor: item.isActive ? "#10b981" : "#ef4444",
                          color: "white",
                        }}
                      >
                        {item.isActive ? "Aktif" : "Pasif"}
                      </span>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "6px 10px", fontSize: 11 }}
                          onClick={() => handleEdit(item)}
                        >
                          {item.id.startsWith("sys-") ? "Kopyala" : "Düzenle"}
                        </button>
                        {!item.id.startsWith("sys-") && (
                          <button
                            className="btn btn-outline"
                            style={{ padding: "6px 10px", fontSize: 11 }}
                            onClick={() => handleDelete(item.id)}
                          >
                            Sil
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
