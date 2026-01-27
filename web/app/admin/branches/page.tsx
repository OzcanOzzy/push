"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
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
  const [formState, setFormState] = useState({
    name: "",
    slug: "",
    address: "",
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
            cityId: formState.cityId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Şube kaydedilemedi.");
      }

      setFormState({ name: "", slug: "", address: "", cityId: "" });
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
              <input
                className="search-input"
                placeholder="Adres (opsiyonel)"
                value={formState.address}
                onChange={(event) => handleChange("address", event.target.value)}
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
              <button className="btn">
                {editId ? "Güncelle" : "Kaydet"}
              </button>
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
                      <div className="card-body">
                        <div style={{ fontWeight: 700 }}>{branch.name}</div>
                        <div style={{ color: "var(--color-muted)" }}>{branch.slug}</div>
                        <div style={{ color: "var(--color-muted)" }}>
                          {branch.city?.name ?? "Şehir yok"}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleEdit(branch)}
                          >
                            Düzenle
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleDelete(branch.id)}
                          >
                            Sil
                          </button>
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
