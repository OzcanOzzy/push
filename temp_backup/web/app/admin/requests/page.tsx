"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../lib/api";

const statusOptions = [
  { value: "NEW", label: "Yeni" },
  { value: "IN_PROGRESS", label: "İşleme alındı" },
  { value: "CLOSED", label: "Kapatıldı" },
];

type CustomerRequest = {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  type: string;
  status: string;
  notes?: string | null;
  createdAt: string;
};

type ConsultantRequest = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  status: string;
  createdAt: string;
  consultant?: { user?: { name?: string | null } | null } | null;
};

export default function AdminRequestsPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerRequests, setCustomerRequests] = useState<CustomerRequest[]>([]);
  const [consultantRequests, setConsultantRequests] = useState<ConsultantRequest[]>([]);

  const updateStatus = async (
    type: "customer" | "consultant",
    id: string,
    status: string,
  ) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/requests/${type}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Durum güncellenemedi.");
      }

      await loadData();
    } catch {
      setError("Durum güncellenemedi.");
    }
  };

  const loadData = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsAuthed(false);
      setIsReady(true);
      return;
    }

    setIsAuthed(true);
    setIsReady(true);
    setIsLoading(true);
    setError("");

    try {
      const [customerRes, consultantRes] = await Promise.all([
        fetch(`${API_BASE_URL}/requests/customer`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/requests/consultant`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!customerRes.ok || !consultantRes.ok) {
        throw new Error("Talepler yüklenemedi.");
      }

      const [customerData, consultantData] = await Promise.all([
        customerRes.json(),
        consultantRes.json(),
      ]);

      setCustomerRequests(customerData);
      setConsultantRequests(consultantData);
    } catch (err) {
      setError("Talepler yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Talepler</div>
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
          <div className="section-title">Talepler</div>
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
        <div className="section-title">Talepler</div>
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

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              Müşteri Talepleri
            </div>
            {isLoading ? <div>Yükleniyor...</div> : null}
            {!isLoading && customerRequests.length === 0 ? (
              <div>Henüz talep yok.</div>
            ) : null}
            <div style={{ display: "grid", gap: 12 }}>
              {customerRequests.map((request) => (
                <div key={request.id} className="card">
                  <div className="card-body">
                    <div style={{ fontWeight: 700 }}>{request.fullName}</div>
                    <div style={{ color: "var(--color-muted)" }}>
                      {request.phone} {request.email ? `· ${request.email}` : ""}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      Tür: {request.type} · Durum: {request.status}
                    </div>
                    {request.notes ? (
                      <div style={{ marginTop: 6 }}>{request.notes}</div>
                    ) : null}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <select
                        className="search-input"
                        value={request.status}
                        onChange={(event) =>
                          updateStatus("customer", request.id, event.target.value)
                        }
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              Danışman Talepleri
            </div>
            {isLoading ? <div>Yükleniyor...</div> : null}
            {!isLoading && consultantRequests.length === 0 ? (
              <div>Henüz talep yok.</div>
            ) : null}
            <div style={{ display: "grid", gap: 12 }}>
              {consultantRequests.map((request) => (
                <div key={request.id} className="card">
                  <div className="card-body">
                    <div style={{ fontWeight: 700 }}>{request.customerName}</div>
                    <div style={{ color: "var(--color-muted)" }}>
                      {request.customerPhone}{" "}
                      {request.customerEmail ? `· ${request.customerEmail}` : ""}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      Durum: {request.status} · Danışman:{" "}
                      {request.consultant?.user?.name ?? "Bilinmiyor"}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <select
                        className="search-input"
                        value={request.status}
                        onChange={(event) =>
                          updateStatus("consultant", request.id, event.target.value)
                        }
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
