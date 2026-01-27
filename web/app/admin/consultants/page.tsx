"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { API_BASE_URL, fetchJson } from "../../../lib/api";

type Branch = {
  id: string;
  name: string;
  city?: { name: string } | null;
};

type Consultant = {
  id: string;
  title?: string | null;
  contactPhone?: string | null;
  whatsappNumber?: string | null;
  bio?: string | null;
  branch?: Branch | null;
  user?: { id: string; name: string; email: string } | null;
};

export default function AdminConsultantsPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    branchId: "",
    title: "",
    whatsappNumber: "",
    contactPhone: "",
    bio: "",
  });

  const loadData = async () => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    setIsLoading(true);
    setError("");

    try {
      const [consultantData, branchData] = await Promise.all([
        fetchJson<Consultant[]>("/consultants", { cache: "no-store" }),
        fetchJson<Branch[]>("/branches", { cache: "no-store" }),
      ]);
      setConsultants(consultantData);
      setBranches(branchData);
    } catch {
      setError("Danışmanlar yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field: string, value: string) => {
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

    try {
      const response = await fetch(
        `${API_BASE_URL}/consultants${editId ? `/${editId}` : ""}`,
        {
          method: editId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formState.name,
            email: formState.email,
            password: formState.password || undefined,
            branchId: formState.branchId,
            title: formState.title || undefined,
            whatsappNumber: formState.whatsappNumber || undefined,
            contactPhone: formState.contactPhone || undefined,
            bio: formState.bio || undefined,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Danışman kaydedilemedi.");
      }

      setFormState({
        name: "",
        email: "",
        password: "",
        branchId: "",
        title: "",
        whatsappNumber: "",
        contactPhone: "",
        bio: "",
      });
      setEditId(null);
      await loadData();
    } catch {
      setError("Danışman kaydedilemedi.");
    }
  };

  const handleEdit = (consultant: Consultant) => {
    setEditId(consultant.id);
    setFormState({
      name: consultant.user?.name ?? "",
      email: consultant.user?.email ?? "",
      password: "",
      branchId: consultant.branch?.id ?? "",
      title: consultant.title ?? "",
      whatsappNumber: consultant.whatsappNumber ?? "",
      contactPhone: consultant.contactPhone ?? "",
      bio: consultant.bio ?? "",
    });
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    if (!window.confirm("Bu danışmanı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/consultants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Danışman silinemedi.");
      }

      await loadData();
    } catch {
      setError("Danışman silinemedi.");
    }
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Danışmanlar</div>
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
          <div className="section-title">Danışmanlar</div>
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
        <div className="section-title">Danışman Yönetimi</div>
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
              {editId ? "Danışman Güncelle" : "Yeni Danışman"}
            </div>
            <form style={{ display: "grid", gap: 10 }} onSubmit={handleSubmit}>
              <input
                className="search-input"
                placeholder="Ad Soyad"
                value={formState.name}
                onChange={(event) => handleChange("name", event.target.value)}
                required
              />
              <input
                className="search-input"
                placeholder="E-posta"
                type="email"
                value={formState.email}
                onChange={(event) => handleChange("email", event.target.value)}
                required
              />
              <input
                className="search-input"
                placeholder={editId ? "Yeni şifre (opsiyonel)" : "Şifre"}
                type="password"
                value={formState.password}
                onChange={(event) => handleChange("password", event.target.value)}
                required={!editId}
              />
              <select
                className="search-input"
                value={formState.branchId}
                onChange={(event) => handleChange("branchId", event.target.value)}
                required
              >
                <option value="">Şube seçin</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} · {branch.city?.name ?? ""}
                  </option>
                ))}
              </select>
              <input
                className="search-input"
                placeholder="Unvan (opsiyonel)"
                value={formState.title}
                onChange={(event) => handleChange("title", event.target.value)}
              />
              <input
                className="search-input"
                placeholder="WhatsApp (opsiyonel)"
                value={formState.whatsappNumber}
                onChange={(event) => handleChange("whatsappNumber", event.target.value)}
              />
              <input
                className="search-input"
                placeholder="Telefon (opsiyonel)"
                value={formState.contactPhone}
                onChange={(event) => handleChange("contactPhone", event.target.value)}
              />
              <textarea
                className="search-input"
                placeholder="Bio (opsiyonel)"
                value={formState.bio}
                onChange={(event) => handleChange("bio", event.target.value)}
                rows={3}
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
                  Danışmanlar
                </div>
                {isLoading ? <div>Yükleniyor...</div> : null}
                {!isLoading && consultants.length === 0 ? (
                  <div>Danışman bulunamadı.</div>
                ) : null}
                <div style={{ display: "grid", gap: 12 }}>
                  {consultants.map((consultant) => (
                    <div key={consultant.id} className="card">
                      <div className="card-body">
                        <div style={{ fontWeight: 700 }}>
                          {consultant.user?.name ?? "Danışman"}
                        </div>
                        <div style={{ color: "var(--color-muted)" }}>
                          {consultant.user?.email ?? ""}
                        </div>
                        <div style={{ color: "var(--color-muted)" }}>
                          {consultant.branch?.name ?? "Şube yok"} ·{" "}
                          {consultant.branch?.city?.name ?? ""}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleEdit(consultant)}
                          >
                            Düzenle
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleDelete(consultant.id)}
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
