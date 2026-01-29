"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  showOnHome: boolean;
};

export default function AdminBlogPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    isPublished: false,
    showOnHome: false,
  });

  const loadPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/blog/admin/all`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    loadPosts();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch(`${API_BASE_URL}/blog/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, coverImage: data.url }));
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

    const url = editingId
      ? `${API_BASE_URL}/blog/${editingId}`
      : `${API_BASE_URL}/blog`;
    const method = editingId ? "PATCH" : "POST";

    const submitData = {
      ...formData,
      publishedAt: formData.isPublished ? new Date().toISOString() : undefined,
    };

    try {
      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });
      loadPosts();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setFormData({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content || "",
      coverImage: post.coverImage || "",
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
      metaKeywords: post.metaKeywords || "",
      isPublished: post.isPublished,
      showOnHome: post.showOnHome,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/blog/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      slug: "",
      title: "",
      excerpt: "",
      content: "",
      coverImage: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      isPublished: false,
      showOnHome: false,
    });
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Blog Yönetimi</div>
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
          <div className="section-title">Blog Yönetimi</div>
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
        <div className="section-title">Blog Yönetimi</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Link className="btn btn-outline" href="/admin">
            Yönetim Paneli
          </Link>
        </div>

        <div className="layout-grid">
          <aside className="sidebar">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              {editingId ? "Yazı Düzenle" : "Yeni Yazı"}
            </div>
            <form style={{ display: "grid", gap: 10 }} onSubmit={handleSubmit}>
              <input
                className="search-input"
                placeholder="Yazı Başlığı"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <input
                className="search-input"
                placeholder="URL Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
              <textarea
                className="search-input"
                placeholder="Özet"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                style={{ resize: "vertical" }}
              />
              <textarea
                className="search-input"
                placeholder="İçerik (HTML desteklenir)"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                style={{ resize: "vertical" }}
              />

              {/* Cover Image Upload */}
              <div>
                <label style={{ fontSize: 12, color: "var(--color-muted)" }}>Kapak Görseli</label>
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
                    style={{ flex: 1 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Yükleniyor..." : "Görsel Yükle"}
                  </button>
                  {formData.coverImage && (
                    <img
                      src={formData.coverImage.startsWith("http") ? formData.coverImage : `${API_BASE_URL}${formData.coverImage}`}
                      alt="Preview"
                      style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }}
                    />
                  )}
                </div>
              </div>

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
                  placeholder="Meta Açıklama"
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
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  />
                  Yayınla
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={formData.showOnHome}
                    onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                  />
                  Ana Sayfada Göster
                </label>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  {editingId ? "Güncelle" : "Ekle"}
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
            {loading ? (
              <div className="card">
                <div className="card-body">Yükleniyor...</div>
              </div>
            ) : posts.length === 0 ? (
              <div className="card">
                <div className="card-body">Henüz blog yazısı eklenmemiş.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="card"
                    style={{ opacity: post.isPublished ? 1 : 0.5 }}
                  >
                    <div
                      className="card-body"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      {post.coverImage && (
                        <img
                          src={post.coverImage.startsWith("http") ? post.coverImage : `${API_BASE_URL}${post.coverImage}`}
                          alt=""
                          style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 4 }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{post.title}</div>
                        <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                          /{post.slug}
                          {post.isPublished && " • Yayında"}
                          {post.showOnHome && " • Ana Sayfa"}
                        </div>
                        {post.excerpt && (
                          <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 4 }}>
                            {post.excerpt.substring(0, 80)}...
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => handleEdit(post)}
                        >
                          Düzenle
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{
                            padding: "6px 12px",
                            fontSize: 12,
                            color: "var(--color-accent)",
                          }}
                          onClick={() => handleDelete(post.id)}
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
