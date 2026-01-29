"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { API_BASE_URL, fetchJson } from "../../../lib/api";

type City = {
  id: string;
  name: string;
};

type Branch = {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
  city?: { id: string; name: string } | null;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminBranchesPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formState, setFormState] = useState({
    name: "",
    slug: "",
    address: "",
    photoUrl: "",
    phone: "",
    whatsappNumber: "",
    email: "",
    cityId: "",
  });

  const loadData = async () => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    setIsLoading(true);
    setError("");

    try {
      const [branchData, cityData] = await Promise.all([
        fetchJson<Branch[]>("/branches", { cache: "no-store" }),
        fetchJson<City[]>("/cities", { cache: "no-store" }),
      ]);
      setBranches(branchData);
      setCities(cityData);
    } catch {
      setError("Şubeler yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !prev.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
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
        setFormState((prev) => ({ ...prev, photoUrl: data.url }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/branches${editId ? `/${editId}` : ""}`,
        {
          method: editId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formState.name,
            slug: formState.slug,
            address: formState.address || undefined,
            photoUrl: formState.photoUrl || undefined,
            phone: formState.phone || undefined,
            whatsappNumber: formState.whatsappNumber || undefined,
            email: formState.email || undefined,
            cityId: formState.cityId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Şube kaydedilemedi.");
      }

      setFormState({
        name: "",
        slug: "",
        address: "",
        photoUrl: "",
        phone: "",
        whatsappNumber: "",
        email: "",
        cityId: "",
      });
      setEditId(null);
      await loadData();
    } catch {
      setError("Şube kaydedilemedi.");
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditId(branch.id);
    setFormState({
      name: branch.name,
      slug: branch.slug,
      address: branch.address ?? "",
      photoUrl: branch.photoUrl ?? "",
      phone: branch.phone ?? "",
      whatsappNumber: branch.whatsappNumber ?? "",
      email: branch.email ?? "",
      cityId: branch.city?.id ?? "",
    });
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    if (!window.confirm("Bu şubeyi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/branches/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Şube silinemedi.");
      }

      await loadData();
    } catch {
      setError("Şube silinemedi. İlan bağlı olabilir.");
    }
  };

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Şubeler</div>
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
          <div className="section-title">Şubeler</div>
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
        <div className="section-title">Şube Yönetimi</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Link className="btn btn-outline" href="/admin">
            Yönetim Paneli
          </Link>
          <button className="btn btn-outline" onClick={loadData}>
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

        <div className="layout-grid">
          <aside className="sidebar">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              {editId ? "Şube Güncelle" : "Yeni Şube"}
            </div>
            <form style={{ display: "grid", gap: 10 }} onSubmit={handleSubmit}>
              {/* Photo Upload */}
              <div>
                <label style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4, display: "block" }}>
                  Şube Fotoğrafı
                </label>
                {formState.photoUrl && (
                  <div style={{ marginBottom: 8 }}>
                    <img
                      src={resolveImageUrl(formState.photoUrl) || ""}
                      alt="Şube"
                      style={{ width: "100%", maxWidth: 200, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid var(--color-border)" }}
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
                  {uploading ? "Yükleniyor..." : "Fotoğraf Yükle"}
                </button>
                <input
                  className="search-input"
                  placeholder="veya Fotoğraf URL'si"
                  value={formState.photoUrl}
                  onChange={(e) => handleChange("photoUrl", e.target.value)}
                />
              </div>

              <input
                className="search-input"
                placeholder="Şube adı"
                value={formState.name}
                onChange={(event) => handleChange("name", event.target.value)}
                required
              />
              <input
                className="search-input"
                placeholder="Slug"
                value={formState.slug}
                onChange={(event) => handleChange("slug", event.target.value)}
                required
              />
              <select
                className="search-input"
                value={formState.cityId}
                onChange={(event) => handleChange("cityId", event.target.value)}
                required
              >
                <option value="">Şehir seçin</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>

              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 10, marginTop: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: "var(--color-muted)", marginBottom: 8 }}>
                  <i className="fa-solid fa-address-card" style={{ marginRight: 6 }}></i>
                  İletişim Bilgileri
                </div>
                <textarea
                  className="search-input"
                  placeholder="Adres"
                  value={formState.address}
                  onChange={(event) => handleChange("address", event.target.value)}
                  rows={2}
                  style={{ resize: "vertical" }}
                />
                <input
                  className="search-input"
                  placeholder="Telefon"
                  value={formState.phone}
                  onChange={(event) => handleChange("phone", event.target.value)}
                  style={{ marginTop: 8 }}
                />
                <input
                  className="search-input"
                  placeholder="WhatsApp"
                  value={formState.whatsappNumber}
                  onChange={(event) => handleChange("whatsappNumber", event.target.value)}
                  style={{ marginTop: 8 }}
                />
                <input
                  className="search-input"
                  placeholder="E-posta"
                  type="email"
                  value={formState.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  style={{ marginTop: 8 }}
                />
              </div>

              <button className="btn">
                {editId ? "Güncelle" : "Kaydet"}
              </button>
              {editId && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setEditId(null);
                    setFormState({
                      name: "",
                      slug: "",
                      address: "",
                      photoUrl: "",
                      phone: "",
                      whatsappNumber: "",
                      email: "",
                      cityId: "",
                    });
                  }}
                >
                  İptal
                </button>
              )}
            </form>
          </aside>
          <section>
            <div className="card">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 12 }}>
                  Şubeler
                </div>
                {isLoading ? <div>Yükleniyor...</div> : null}
                {!isLoading && branches.length === 0 ? (
                  <div>Şube bulunamadı.</div>
                ) : null}
                <div style={{ display: "grid", gap: 12 }}>
                  {branches.map((branch) => (
                    <div key={branch.id} className="card">
                      <div className="card-body" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        {branch.photoUrl ? (
                          <img
                            src={resolveImageUrl(branch.photoUrl) || ""}
                            alt={branch.name}
                            style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: 80,
                            height: 60,
                            borderRadius: 8,
                            background: "var(--color-bg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            <i className="fa-solid fa-building" style={{ fontSize: 20, color: "var(--color-muted)" }}></i>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700 }}>{branch.name}</div>
                          <div style={{ color: "var(--color-muted)", fontSize: 12 }}>{branch.slug}</div>
                          <div style={{ color: "var(--color-muted)", fontSize: 12 }}>
                            {branch.city?.name ?? "Şehir yok"}
                          </div>
                          {branch.phone && (
                            <div style={{ fontSize: 12, marginTop: 4 }}>
                              <i className="fa-solid fa-phone" style={{ marginRight: 6, color: "var(--color-primary)" }}></i>
                              {branch.phone}
                            </div>
                          )}
                          {branch.address && (
                            <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>
                              <i className="fa-solid fa-location-dot" style={{ marginRight: 6 }}></i>
                              {branch.address.substring(0, 50)}...
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <button
                              className="btn btn-outline"
                              style={{ padding: "6px 12px", fontSize: 12 }}
                              onClick={() => handleEdit(branch)}
                            >
                              Düzenle
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: "6px 12px", fontSize: 12 }}
                              onClick={() => handleDelete(branch.id)}
                            >
                              Sil
                            </button>
                          </div>
                        </div>
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
