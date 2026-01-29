"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { fetchJson } from "../../../lib/api";
import PageWrapper from "../../components/PageWrapper";

type Consultant = {
  id: string;
  user?: { name?: string | null } | null;
  branch?: { name?: string | null; city?: { name?: string | null } | null } | null;
};

export default function ConsultantRequestPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState("");
  const [formState, setFormState] = useState({
    consultantId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    requestText: "",
  });

  const selectedConsultant = useMemo(
    () => consultants.find((consultant) => consultant.id === formState.consultantId),
    [consultants, formState.consultantId],
  );

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);

    const loadConsultants = async () => {
      try {
        const data = await fetchJson<Consultant[]>("/consultants", {
          cache: "no-store",
        });
        setConsultants(data);
      } catch {
        setError("Danışman listesi alınamadı.");
      }
    };

    loadConsultants();
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

    setStatus("saving");
    try {
      await fetchJson("/requests/consultant", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          consultantId: formState.consultantId,
          customerName: formState.customerName,
          customerPhone: formState.customerPhone,
          customerEmail: formState.customerEmail || undefined,
          requestText: formState.requestText || undefined,
        }),
      });

      setStatus("done");
      setFormState({
        consultantId: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        requestText: "",
      });
    } catch (err) {
      setStatus("idle");
      setError("Talep gönderilemedi.");
    }
  };

  if (!isReady) {
    return (
      <PageWrapper>
      <main className="section">
        <div className="container">
          <div className="section-title">Danışman Talebi</div>
          <div className="card">
            <div className="card-body">Kontrol ediliyor...</div>
          </div>
        </div>
      </main>
      </PageWrapper>
    );
  }

  if (!isAuthed) {
    return (
      <PageWrapper>
      <main className="section">
        <div className="container">
          <div className="section-title">Danışman Talebi</div>
          <div className="card">
            <div className="card-body">
              Bu formu kullanmak için giriş yapın.{" "}
              <Link href="/admin/login" className="btn btn-outline">
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </main>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
    <main className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="section-title">Danışman Talebi</div>
        <div className="card">
          <form className="card-body" style={{ display: "grid", gap: 12 }} onSubmit={handleSubmit}>
            <select
              className="search-input"
              value={formState.consultantId}
              onChange={(event) => handleChange("consultantId", event.target.value)}
              required
            >
              <option value="">Danışman seçin</option>
              {consultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.user?.name ?? "Danışman"} ·{" "}
                  {consultant.branch?.city?.name ?? ""}{" "}
                  {consultant.branch?.name ?? ""}
                </option>
              ))}
            </select>
            {selectedConsultant ? (
              <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                Seçilen danışman: {selectedConsultant.user?.name ?? "Danışman"}
              </div>
            ) : null}
            <input
              className="search-input"
              placeholder="Müşteri Adı"
              value={formState.customerName}
              onChange={(event) => handleChange("customerName", event.target.value)}
              required
              minLength={2}
            />
            <input
              className="search-input"
              placeholder="Müşteri Telefon"
              value={formState.customerPhone}
              onChange={(event) => handleChange("customerPhone", event.target.value)}
              required
            />
            <input
              className="search-input"
              placeholder="Müşteri E-posta (opsiyonel)"
              value={formState.customerEmail}
              onChange={(event) => handleChange("customerEmail", event.target.value)}
              type="email"
            />
            <textarea
              className="search-input"
              placeholder="Talep Notu"
              value={formState.requestText}
              onChange={(event) => handleChange("requestText", event.target.value)}
              rows={4}
            />
            {error ? (
              <div style={{ color: "var(--color-accent)", fontSize: 12 }}>{error}</div>
            ) : null}
            {status === "done" ? (
              <div style={{ color: "var(--color-opportunity)", fontSize: 12 }}>
                Talebiniz alınmıştır.
              </div>
            ) : null}
            <button className="btn" disabled={status === "saving"}>
              {status === "saving" ? "Gönderiliyor..." : "Talep Gönder"}
            </button>
          </form>
        </div>
      </div>
    </main>
    </PageWrapper>
  );
}
