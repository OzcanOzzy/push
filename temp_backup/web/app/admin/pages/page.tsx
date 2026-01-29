"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ContentBlock = {
  id: string;
  type: "text" | "image" | "button" | "html";
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  alt?: string;
  style?: Record<string, string>;
};

type PageSetting = {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogImage?: string | null;
  content?: ContentBlock[] | null;
  isPublished: boolean;
  showInMenu: boolean;
  menuOrder: number;
  template: string;
};

// Sistem sayfaları
const systemPages = [
  { slug: "hakkimizda", title: "Hakkımızda", template: "about" },
  { slug: "iletisim", title: "İletişim", template: "contact" },
  { slug: "firsatlar", title: "Fırsatlar", template: "opportunities" },
  { slug: "subeler", title: "Şubeler", template: "branches" },
];

export default function AdminPagesPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [pages, setPages] = useState<PageSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogImage: "",
    isPublished: true,
    showInMenu: true,
    menuOrder: 0,
    template: "default",
    content: [] as ContentBlock[],
  });

  // Content block being edited
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [blockForm, setBlockForm] = useState<ContentBlock>({
    id: "",
    type: "text",
    content: "",
    imageUrl: "",
    linkUrl: "",
    alt: "",
  });

  const loadPages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/pages/admin/all`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      let data = await res.json();
      
      // If no pages, show system pages as defaults
      if (!Array.isArray(data) || data.length === 0) {
        data = systemPages.map((sp, i) => ({
          id: `sys-${sp.slug}`,
          slug: sp.slug,
          title: sp.title,
          template: sp.template,
          isPublished: true,
          showInMenu: true,
          menuOrder: i,
          content: [],
        }));
      }
      
      setPages(data);
    } catch {
      // Show system pages on error
      setPages(
        systemPages.map((sp, i) => ({
          id: `sys-${sp.slug}`,
          slug: sp.slug,
          title: sp.title,
          template: sp.template,
          isPublished: true,
          showInMenu: true,
          menuOrder: i,
          content: [],
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
    loadPages();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, forBlock = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    setUploading(true);
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
        const fullUrl = `${API_BASE_URL}${data.url}`;
        if (forBlock) {
          setBlockForm((prev) => ({ ...prev, imageUrl: fullUrl }));
        } else {
          setFormData((prev) => ({ ...prev, ogImage: fullUrl }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    // If it's a system page, create it
    const isSystemPage = editingId?.startsWith("sys-");
    const url = isSystemPage || !editingId
      ? `${API_BASE_URL}/pages`
      : `${API_BASE_URL}/pages/${editingId}`;
    const method = isSystemPage || !editingId ? "POST" : "PATCH";

    try {
      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          content: formData.content.length > 0 ? formData.content : null,
        }),
      });
      loadPages();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (page: PageSetting) => {
    setEditingId(page.id);
    setFormData({
      slug: page.slug,
      title: page.title,
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      metaKeywords: page.metaKeywords || "",
      ogImage: page.ogImage || "",
      isPublished: page.isPublished,
      showInMenu: page.showInMenu,
      menuOrder: page.menuOrder,
      template: page.template,
      content: Array.isArray(page.content) ? page.content : [],
    });
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith("sys-")) {
      alert("Sistem sayfaları silinemez.");
      return;
    }
    if (!confirm("Bu sayfayı silmek istediğinize emin misiniz?")) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/pages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadPages();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      slug: "",
      title: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogImage: "",
      isPublished: true,
      showInMenu: true,
      menuOrder: 0,
      template: "default",
      content: [],
    });
    setEditingBlockId(null);
    setBlockForm({
      id: "",
      type: "text",
      content: "",
      imageUrl: "",
      linkUrl: "",
      alt: "",
    });
  };

  // Content block management
  const addContentBlock = () => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type: blockForm.type,
      content: blockForm.content,
      imageUrl: blockForm.imageUrl || undefined,
      linkUrl: blockForm.linkUrl || undefined,
      alt: blockForm.alt || undefined,
    };
    setFormData((prev) => ({
      ...prev,
      content: [...prev.content, newBlock],
    }));
    setBlockForm({
      id: "",
      type: "text",
      content: "",
      imageUrl: "",
      linkUrl: "",
      alt: "",
    });
  };

  const updateContentBlock = () => {
    if (!editingBlockId) return;
    setFormData((prev) => ({
      ...prev,
      content: prev.content.map((block) =>
        block.id === editingBlockId
          ? { ...blockForm, id: editingBlockId }
          : block
      ),
    }));
    setEditingBlockId(null);
    setBlockForm({
      id: "",
      type: "text",
      content: "",
      imageUrl: "",
      linkUrl: "",
      alt: "",
    });
  };

  const editContentBlock = (block: ContentBlock) => {
    setEditingBlockId(block.id);
    setBlockForm(block);
  };

  const deleteContentBlock = (blockId: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content.filter((b) => b.id !== blockId),
    }));
  };

  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newContent = [...formData.content];
    [newContent[index - 1], newContent[index]] = [newContent[index], newContent[index - 1]];
    setFormData((prev) => ({ ...prev, content: newContent }));
  };

  const moveBlockDown = (index: number) => {
    if (index === formData.content.length - 1) return;
    const newContent = [...formData.content];
    [newContent[index], newContent[index + 1]] = [newContent[index + 1], newContent[index]];
    setFormData((prev) => ({ ...prev, content: newContent }));
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Sayfa Yönetimi</div>
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
          <div className="section-title">Sayfa Yönetimi</div>
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
        <div className="section-title">Sayfa Yönetimi</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Link className="btn btn-outline" href="/admin">
            ← Yönetim Paneli
          </Link>
          <button className="btn btn-outline" onClick={loadPages}>
            Yenile
          </button>
        </div>

        <div className="layout-grid">
          <aside className="sidebar">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              {editingId ? "Sayfa Düzenle" : "Yeni Sayfa"}
            </div>
            <form style={{ display: "grid", gap: 10 }} onSubmit={handleSubmit}>
              <input
                className="search-input"
                placeholder="Sayfa Başlığı"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <input
                className="search-input"
                placeholder="URL Slug (ör: hakkimizda)"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />

              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: "var(--color-muted)", marginBottom: 8 }}>
                  SEO Ayarları
                </div>
                <input
                  className="search-input"
                  placeholder="Meta Başlık"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                />
                <textarea
                  className="search-input"
                  placeholder="Meta Açıklama (160 karakter)"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={2}
                  style={{ marginTop: 8, resize: "vertical" }}
                />
                <input
                  className="search-input"
                  placeholder="Anahtar Kelimeler"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  style={{ marginTop: 8 }}
                />
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 11, color: "var(--color-muted)" }}>OG Görseli (Paylaşım)</label>
                  <input
                    className="search-input"
                    placeholder="OG Image URL"
                    value={formData.ogImage}
                    onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Şablon</label>
                  <select
                    className="search-input"
                    value={formData.template}
                    onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  >
                    <option value="default">Varsayılan</option>
                    <option value="home">Ana Sayfa</option>
                    <option value="listings">Tüm İlanlar</option>
                    <option value="opportunities">Fırsatlar</option>
                    <option value="branches">Şubeler</option>
                    <option value="about">Hakkımızda</option>
                    <option value="contact">İletişim</option>
                    <option value="full-width">Tam Genişlik</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Menü Sırası</label>
                  <input
                    className="search-input"
                    type="number"
                    value={formData.menuOrder}
                    onChange={(e) => setFormData({ ...formData, menuOrder: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  />
                  Yayında
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={formData.showInMenu}
                    onChange={(e) => setFormData({ ...formData, showInMenu: e.target.checked })}
                  />
                  Menüde
                </label>
              </div>

              {/* Content Blocks Section */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 10, marginTop: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: "var(--color-muted)", marginBottom: 8 }}>
                  <i className="fa-solid fa-puzzle-piece" style={{ marginRight: 6 }}></i>
                  Sayfa İçeriği ({formData.content.length} blok)
                </div>

                {/* Content blocks list */}
                {formData.content.length > 0 && (
                  <div style={{ marginBottom: 12, display: "grid", gap: 6 }}>
                    {formData.content.map((block, index) => (
                      <div
                        key={block.id}
                        style={{
                          padding: 8,
                          border: "1px solid var(--color-border)",
                          borderRadius: 6,
                          fontSize: 12,
                          background: editingBlockId === block.id ? "#f0f7ff" : "#fff",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <button
                              type="button"
                              onClick={() => moveBlockUp(index)}
                              disabled={index === 0}
                              style={{ padding: "2px 4px", fontSize: 10, cursor: "pointer" }}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBlockDown(index)}
                              disabled={index === formData.content.length - 1}
                              style={{ padding: "2px 4px", fontSize: 10, cursor: "pointer" }}
                            >
                              ↓
                            </button>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontWeight: 600, textTransform: "uppercase", fontSize: 10 }}>
                              {block.type}
                            </span>
                            <div style={{ color: "var(--color-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {block.type === "image" ? block.imageUrl : block.content?.substring(0, 50)}
                            </div>
                            {block.linkUrl && (
                              <div style={{ color: "var(--color-primary)", fontSize: 10 }}>
                                → {block.linkUrl}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              type="button"
                              onClick={() => editContentBlock(block)}
                              style={{ padding: "4px 8px", fontSize: 10, cursor: "pointer" }}
                            >
                              Düzenle
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteContentBlock(block.id)}
                              style={{ padding: "4px 8px", fontSize: 10, cursor: "pointer", color: "var(--color-accent)" }}
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add/Edit block form */}
                <div style={{ background: "#f9f9f9", padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>
                    {editingBlockId ? "Blok Düzenle" : "Yeni Blok Ekle"}
                  </div>
                  <select
                    className="search-input"
                    value={blockForm.type}
                    onChange={(e) => setBlockForm({ ...blockForm, type: e.target.value as ContentBlock["type"] })}
                    style={{ marginBottom: 6 }}
                  >
                    <option value="text">Metin</option>
                    <option value="image">Resim</option>
                    <option value="button">Buton</option>
                    <option value="html">HTML</option>
                  </select>

                  {blockForm.type === "text" || blockForm.type === "html" ? (
                    <textarea
                      className="search-input"
                      placeholder={blockForm.type === "html" ? "HTML kodu..." : "Metin içeriği..."}
                      value={blockForm.content}
                      onChange={(e) => setBlockForm({ ...blockForm, content: e.target.value })}
                      rows={3}
                      style={{ resize: "vertical" }}
                    />
                  ) : null}

                  {blockForm.type === "image" && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, true)}
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ width: "100%", marginBottom: 4, fontSize: 11 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? "Yükleniyor..." : "Resim Yükle"}
                      </button>
                      <input
                        className="search-input"
                        placeholder="veya Resim URL"
                        value={blockForm.imageUrl || ""}
                        onChange={(e) => setBlockForm({ ...blockForm, imageUrl: e.target.value })}
                      />
                      <input
                        className="search-input"
                        placeholder="Alt metin (SEO için)"
                        value={blockForm.alt || ""}
                        onChange={(e) => setBlockForm({ ...blockForm, alt: e.target.value })}
                        style={{ marginTop: 4 }}
                      />
                    </>
                  )}

                  {blockForm.type === "button" && (
                    <input
                      className="search-input"
                      placeholder="Buton yazısı"
                      value={blockForm.content}
                      onChange={(e) => setBlockForm({ ...blockForm, content: e.target.value })}
                    />
                  )}

                  <input
                    className="search-input"
                    placeholder="Tıklanınca açılacak link (opsiyonel)"
                    value={blockForm.linkUrl || ""}
                    onChange={(e) => setBlockForm({ ...blockForm, linkUrl: e.target.value })}
                    style={{ marginTop: 6 }}
                  />

                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn"
                      style={{ flex: 1, padding: "6px 12px", fontSize: 11 }}
                      onClick={editingBlockId ? updateContentBlock : addContentBlock}
                    >
                      {editingBlockId ? "Bloğu Güncelle" : "Blok Ekle"}
                    </button>
                    {editingBlockId && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: "6px 12px", fontSize: 11 }}
                        onClick={() => {
                          setEditingBlockId(null);
                          setBlockForm({ id: "", type: "text", content: "", imageUrl: "", linkUrl: "", alt: "" });
                        }}
                      >
                        İptal
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  {editingId ? (editingId.startsWith("sys-") ? "Sayfa Oluştur" : "Güncelle") : "Ekle"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-outline" onClick={resetForm}>
                    İptal
                  </button>
                )}
              </div>
            </form>
          </aside>

          <section>
            <div className="card">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 12 }}>
                  Mevcut Sayfalar ({pages.length})
                </div>
                {loading ? (
                  <div>Yükleniyor...</div>
                ) : pages.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 20 }}>
                    Henüz sayfa eklenmemiş.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        className="card"
                        style={{
                          opacity: page.isPublished ? 1 : 0.6,
                          background: page.id.startsWith("sys-") ? "#fffbeb" : "#fff",
                        }}
                      >
                        <div
                          className="card-body"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                              {page.title}
                              {page.id.startsWith("sys-") && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    background: "#fbbf24",
                                    color: "#000",
                                  }}
                                >
                                  Sistem
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                              /{page.slug} • {page.template}
                              {page.showInMenu && " • Menüde"}
                              {Array.isArray(page.content) && page.content.length > 0 && (
                                <span> • {page.content.length} blok</span>
                              )}
                            </div>
                            {page.metaDescription && (
                              <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>
                                {page.metaDescription.substring(0, 80)}...
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Link
                              href={`/${page.slug}`}
                              target="_blank"
                              className="btn btn-outline"
                              style={{ padding: "6px 12px", fontSize: 12 }}
                            >
                              <i className="fa-solid fa-eye"></i>
                            </Link>
                            <button
                              className="btn btn-outline"
                              style={{ padding: "6px 12px", fontSize: 12 }}
                              onClick={() => handleEdit(page)}
                            >
                              Düzenle
                            </button>
                            {!page.id.startsWith("sys-") && (
                              <button
                                className="btn btn-outline"
                                style={{
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  color: "var(--color-accent)",
                                }}
                                onClick={() => handleDelete(page.id)}
                              >
                                Sil
                              </button>
                            )}
                          </div>
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
