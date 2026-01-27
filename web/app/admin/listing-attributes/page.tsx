"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { API_BASE_URL, fetchJson } from "../../../lib/api";

type ListingAttributeDefinition = {
  id: string;
  category: string;
  key: string;
  label: string;
  type: "TEXT" | "NUMBER" | "SELECT" | "BOOLEAN";
  options?: string[] | null;
  isRequired?: boolean | null;
  sortOrder?: number | null;
};

const categoryOptions = [
  { value: "HOUSING", label: "Konut" },
  { value: "LAND", label: "Arsa" },
  { value: "COMMERCIAL", label: "Ticari" },
  { value: "TRANSFER", label: "Devren" },
  { value: "FIELD", label: "Tarla" },
  { value: "GARDEN", label: "Bahçe" },
  { value: "HOBBY_GARDEN", label: "Hobi Bahçesi" },
];

const typeOptions = [
  { value: "TEXT", label: "Metin" },
  { value: "NUMBER", label: "Sayı" },
  { value: "SELECT", label: "Seçim" },
  { value: "BOOLEAN", label: "Evet/Hayır" },
];

export default function AdminListingAttributesPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [attributes, setAttributes] = useState<ListingAttributeDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    category: "HOUSING",
    key: "",
    label: "",
    type: "TEXT",
    options: "",
    isRequired: false,
    sortOrder: "0",
  });

  const loadData = async () => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    setIsLoading(true);
    setError("");

    try {
      const data = await fetchJson<ListingAttributeDefinition[]>(
        "/listing-attributes",
        { cache: "no-store" },
      );
      setAttributes(data);
    } catch {
      setError("Özellikler yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    const options = formState.options
      ? formState.options.split(",").map((item) => item.trim()).filter(Boolean)
      : undefined;

    try {
      const response = await fetch(
        `${API_BASE_URL}/listing-attributes${editId ? `/${editId}` : ""}`,
        {
          method: editId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category: formState.category,
            key: formState.key,
            label: formState.label,
            type: formState.type,
            options,
            isRequired: formState.isRequired,
            sortOrder: Number(formState.sortOrder || 0),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Özellik kaydedilemedi.");
      }

      setFormState({
        category: "HOUSING",
        key: "",
        label: "",
        type: "TEXT",
        options: "",
        isRequired: false,
        sortOrder: "0",
      });
      setEditId(null);
      await loadData();
    } catch {
      setError("Özellik kaydedilemedi.");
    }
  };

  const handleEdit = (item: ListingAttributeDefinition) => {
    setEditId(item.id);
    setFormState({
      category: item.category,
      key: item.key,
      label: item.label,
      type: item.type,
      options: item.options?.join(", ") ?? "",
      isRequired: Boolean(item.isRequired),
      sortOrder: String(item.sortOrder ?? 0),
    });
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    if (!window.confirm("Bu özelliği silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/listing-attributes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Özellik silinemedi.");
      }

      await loadData();
    } catch {
      setError("Özellik silinemedi.");
    }
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">İlan Özellikleri</div>
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
          <div className="section-title">İlan Özellikleri</div>
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
        <div className="section-title">İlan Özellik Yönetimi</div>
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
              {editId ? "Özellik Güncelle" : "Yeni Özellik"}
            </div>
            <form style={{ display: "grid", gap: 10 }} onSubmit={handleSubmit}>
              <select
                className="search-input"
                value={formState.category}
                onChange={(event) => handleChange("category", event.target.value)}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                className="search-input"
                placeholder="Anahtar (ör: rooms)"
                value={formState.key}
                onChange={(event) => handleChange("key", event.target.value)}
                required
              />
              <input
                className="search-input"
                placeholder="Etiket (ör: Oda Sayısı)"
                value={formState.label}
                onChange={(event) => handleChange("label", event.target.value)}
                required
              />
              <select
                className="search-input"
                value={formState.type}
                onChange={(event) => handleChange("type", event.target.value)}
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                className="search-input"
                placeholder="Seçenekler (virgülle)"
                value={formState.options}
                onChange={(event) => handleChange("options", event.target.value)}
                disabled={formState.type !== "SELECT"}
              />
              <input
                className="search-input"
                placeholder="Sıra"
                type="number"
                value={formState.sortOrder}
                onChange={(event) => handleChange("sortOrder", event.target.value)}
              />
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={formState.isRequired}
                  onChange={(event) =>
                    handleChange("isRequired", event.target.checked)
                  }
                />
                Zorunlu
              </label>
              <button className="btn">
                {editId ? "Güncelle" : "Kaydet"}
              </button>
            </form>
          </aside>
          <section>
            <div className="card">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 12 }}>
                  Özellikler
                </div>
                {isLoading ? <div>Yükleniyor...</div> : null}
                {!isLoading && attributes.length === 0 ? (
                  <div>Özellik bulunamadı.</div>
                ) : null}
                <div style={{ display: "grid", gap: 12 }}>
                  {attributes.map((item) => (
                    <div key={item.id} className="card">
                      <div className="card-body">
                        <div style={{ fontWeight: 700 }}>{item.label}</div>
                        <div style={{ color: "var(--color-muted)" }}>
                          {item.category} · {item.key}
                        </div>
                        <div style={{ color: "var(--color-muted)" }}>
                          {item.type}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleEdit(item)}
                          >
                            Düzenle
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleDelete(item.id)}
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
