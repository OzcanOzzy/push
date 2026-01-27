"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { fetchJson } from "../../../lib/api";

type City = {
  id: string;
  name: string;
};

const typeOptions = [
  { value: "SELL", label: "Satmak istiyorum" },
  { value: "RENT", label: "Kiralamak istiyorum" },
  { value: "VALUATION", label: "Değerleme istiyorum" },
];

function CustomerRequestForm() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "SELL";
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState("");
  const [formState, setFormState] = useState({
    fullName: "",
    phone: "",
    email: "",
    type: initialType,
    notes: "",
    cityId: "",
  });

  const selectedType = useMemo(
    () =>
      typeOptions.find((option) => option.value === formState.type) ??
      typeOptions[0],
    [formState.type],
  );

  useEffect(() => {
    const loadCities = async () => {
      setIsLoading(true);
      try {
        const data = await fetchJson<City[]>("/cities", { cache: "no-store" });
        setCities(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadCities();
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
    setStatus("saving");

    try {
      const payload = {
        fullName: formState.fullName,
        phone: formState.phone,
        email: formState.email || undefined,
        type: formState.type,
        notes: formState.notes || undefined,
        cityId: formState.cityId || undefined,
      };

      await fetchJson("/requests/customer", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setStatus("done");
      setFormState({
        fullName: "",
        phone: "",
        email: "",
        type: initialType,
        notes: "",
        cityId: "",
      });
    } catch (err) {
      setError("Talep gönderilemedi. Lütfen bilgileri kontrol edin.");
      setStatus("idle");
    }
  };

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="section-title">Talep Formu</div>
        <div className="card">
          <form className="card-body" style={{ display: "grid", gap: 12 }} onSubmit={handleSubmit}>
            <div style={{ fontWeight: 600 }}>{selectedType.label}</div>
            <input
              className="search-input"
              placeholder="Ad Soyad"
              value={formState.fullName}
              onChange={(event) => handleChange("fullName", event.target.value)}
              required
              minLength={2}
            />
            <input
              className="search-input"
              placeholder="Telefon"
              value={formState.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              required
            />
            <input
              className="search-input"
              placeholder="E-posta (opsiyonel)"
              value={formState.email}
              onChange={(event) => handleChange("email", event.target.value)}
              type="email"
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
            <select
              className="search-input"
              value={formState.cityId}
              onChange={(event) => handleChange("cityId", event.target.value)}
              disabled={isLoading}
            >
              <option value="">Şehir seçin (opsiyonel)</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            <textarea
              className="search-input"
              placeholder="Açıklama / Notlar"
              value={formState.notes}
              onChange={(event) => handleChange("notes", event.target.value)}
              rows={4}
            />
            {error ? (
              <div style={{ color: "var(--color-accent)", fontSize: 12 }}>
                {error}
              </div>
            ) : null}
            {status === "done" ? (
              <div style={{ color: "var(--color-opportunity)", fontSize: 12 }}>
                Talebiniz alındı. En kısa sürede dönüş yapılacaktır.
              </div>
            ) : null}
            <button className="btn" disabled={status === "saving"}>
              {status === "saving" ? "Gönderiliyor..." : "Talep Gönder"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function CustomerRequestPage() {
  return (
    <Suspense
      fallback={
        <main className="section">
          <div className="container" style={{ maxWidth: 640 }}>
            <div className="section-title">Talep Formu</div>
            <div className="card">
              <div className="card-body">Yükleniyor...</div>
            </div>
          </div>
        </main>
      }
    >
      <CustomerRequestForm />
    </Suspense>
  );
}
