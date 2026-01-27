"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { API_BASE_URL } from "../../../lib/api";

type City = {
  id: string;
  name: string;
  slug: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminCitiesPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [importStatus, setImportStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [importMessage, setImportMessage] = useState("");
  const [formState, setFormState] = useState({ name: "", slug: "" });
  const [editId, setEditId] = useState<string | null>(null);

  const loadData = async () => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/cities`);
      const data = await response.json();
      setCities(data);
    } catch {
      setError("Şehirler yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field: "name" | "slug", value: string) => {
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
      const response = await fetch(`${API_BASE_URL}/cities${editId ? `/${editId}` : ""}`, {
        method: editId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error("Şehir kaydedilemedi.");
      }

      setFormState({ name: "", slug: "" });
      setEditId(null);
      await loadData();
    } catch {
      setError("Şehir kaydedilemedi.");
    }
  };

  const handleEdit = (city: City) => {
    setEditId(city.id);
    setFormState({ name: city.name, slug: city.slug });
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    if (!window.confirm("Bu şehri silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cities/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Şehir silinemedi.");
      }

      await loadData();
    } catch {
      setError("Şehir silinemedi. Şube veya ilan bağlı olabilir.");
    }
  };

  const handleImport = async () => {
    setError("");
    setImportMessage("");
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    if (
      !window.confirm(
        "Türkiye şehir/ilçe/mahalle verilerini içe aktarmak istiyor musunuz?",
      )
    ) {
      return;
    }

    setImportStatus("loading");
    try {
      const response = await fetch(`${API_BASE_URL}/cities/import/tr`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("İçe aktarma başarısız.");
      }

      const result = await response.json();
      setImportStatus("done");
      setImportMessage(
        `İçe aktarıldı: ${result.cities} şehir, ${result.districts} ilçe, ${result.neighborhoods} mahalle.`,
      );
      await loadData();
    } catch {
      setImportStatus("error");
      setImportMessage("İçe aktarma başarısız. Lütfen tekrar deneyin.");
    }
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Şehirler</div>
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
          <div className="section-title">Şehirler</div>
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
        <div className="section-title">Şehir Yönetimi</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Link className="btn btn-outline" href="/admin">
            Yönetim Paneli
          </Link>
          <button className="btn btn-outline" onClick={loadData}>
            Yenile
          </button>
          <button
            className="btn"
            onClick={handleImport}
            disabled={importStatus === "loading"}
          >
            {importStatus === "loading"
              ? "İçe aktarılıyor..."
              : "Türkiye Verisini İçe Aktar"}
          </button>
        </div>

        {error ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body" style={{ color: "var(--color-accent)" }}>
              {error}
            </div>
          </div>
        ) : null}
        {importMessage ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <div
              className="card-body"
              style={{
                color:
                  importStatus === "error"
                    ? "var(--color-accent)"
                    : "var(--color-ink)",
              }}
            >
              {importMessage}
            </div>
          </div>
        ) : null}

        <div className="layout-grid">
          <aside className="sidebar">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              {editId ? "Şehir Güncelle" : "Yeni Şehir"}
            </div>
            <form style={{ display: "grid", gap: 10 }} onSubmit={handleSubmit}>
              <input
                className="search-input"
                placeholder="Şehir adı"
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
              <button className="btn">
                {editId ? "Güncelle" : "Kaydet"}
              </button>
            </form>
          </aside>
          <section>
            <div className="card">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 12 }}>
                  Şehirler
                </div>
                {isLoading ? <div>Yükleniyor...</div> : null}
                {!isLoading && cities.length === 0 ? (
                  <div>Şehir bulunamadı.</div>
                ) : null}
                <div style={{ display: "grid", gap: 12 }}>
                  {cities.map((city) => (
                    <div key={city.id} className="card">
                      <div className="card-body">
                        <div style={{ fontWeight: 700 }}>{city.name}</div>
                        <div style={{ color: "var(--color-muted)" }}>{city.slug}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleEdit(city)}
                          >
                            Düzenle
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleDelete(city.id)}
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
