"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { API_BASE_URL, fetchJson } from "../../../lib/api";
import { defaultSettings, type SiteSettings } from "../../../lib/settings";

export default function AdminSettingsPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [formState, setFormState] = useState(defaultSettings);
  const [status, setStatus] = useState<"idle" | "loading" | "saving">("loading");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = async () => {
    setStatus("loading");
    setError("");
    setSuccess("");
    try {
      const data = await fetchJson<SiteSettings>("/settings", { cache: "no-store" });
      setFormState({ ...defaultSettings, ...data });
    } catch {
      setError("Ayarlar yüklenemedi.");
    } finally {
      setStatus("idle");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    loadSettings();
  }, []);

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    setStatus("saving");
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error("Ayarlar kaydedilemedi.");
      }

      setSuccess("Ayarlar güncellendi.");
    } catch {
      setError("Ayarlar kaydedilemedi.");
    } finally {
      setStatus("idle");
    }
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Site Ayarları</div>
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
          <div className="section-title">Site Ayarları</div>
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
        <div className="section-title">Site Ayarları</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Link className="btn btn-outline" href="/admin">
            Yönetim Paneli
          </Link>
          <button className="btn btn-outline" onClick={loadSettings}>
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
        {success ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">{success}</div>
          </div>
        ) : null}

        <div className="card">
          <div className="card-body">
            <form style={{ display: "grid", gap: 12 }} onSubmit={handleSubmit}>
              <input
                className="search-input"
                placeholder="Site adı"
                value={formState.siteName ?? ""}
                onChange={(event) => handleChange("siteName", event.target.value)}
              />
              <input
                className="search-input"
                placeholder="Logo URL"
                value={formState.logoUrl ?? ""}
                onChange={(event) => handleChange("logoUrl", event.target.value)}
              />
              <input
                className="search-input"
                placeholder="Yetkili adı"
                value={formState.ownerName ?? ""}
                onChange={(event) => handleChange("ownerName", event.target.value)}
              />
              <input
                className="search-input"
                placeholder="Yetkili ünvanı"
                value={formState.ownerTitle ?? ""}
                onChange={(event) => handleChange("ownerTitle", event.target.value)}
              />
              <input
                className="search-input"
                placeholder="Telefon"
                value={formState.phoneNumber ?? ""}
                onChange={(event) => handleChange("phoneNumber", event.target.value)}
              />
              <input
                className="search-input"
                placeholder="WhatsApp"
                value={formState.whatsappNumber ?? ""}
                onChange={(event) => handleChange("whatsappNumber", event.target.value)}
              />
              <input
                className="search-input"
                placeholder="İletişim e-posta"
                value={formState.email ?? ""}
                onChange={(event) => handleChange("email", event.target.value)}
              />
              <input
                className="search-input"
                placeholder="Destek e-posta"
                value={formState.supportEmail ?? ""}
                onChange={(event) => handleChange("supportEmail", event.target.value)}
              />
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
                <input
                  className="search-input"
                  placeholder="Ana renk (#1a436e)"
                  value={formState.primaryColor ?? ""}
                  onChange={(event) =>
                    handleChange("primaryColor", event.target.value)
                  }
                />
                <input
                  className="search-input"
                  placeholder="Vurgu renk (#e20b0b)"
                  value={formState.accentColor ?? ""}
                  onChange={(event) =>
                    handleChange("accentColor", event.target.value)
                  }
                />
                <input
                  className="search-input"
                  placeholder="Arkaplan renk (#e9e9f0)"
                  value={formState.backgroundColor ?? ""}
                  onChange={(event) =>
                    handleChange("backgroundColor", event.target.value)
                  }
                />
                <input
                  className="search-input"
                  placeholder="Metin renk (#122033)"
                  value={formState.textColor ?? ""}
                  onChange={(event) => handleChange("textColor", event.target.value)}
                />
              </div>
              <button className="btn" disabled={status === "saving"}>
                {status === "saving" ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
