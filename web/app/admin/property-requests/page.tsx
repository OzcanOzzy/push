"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type PropertyRequest = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  city?: { name: string };
  district?: { name: string };
  neighborhood?: { name: string };
  requestType: string;
  listingStatus: string;
  category: string;
  subPropertyType?: string;
  attributes?: Record<string, unknown>;
  images?: string[];
  videoUrl?: string;
  notes?: string;
  address?: string;
  requestStatus: string;
  adminNotes?: string;
  createdAt: string;
};

type Stats = {
  total: number;
  new: number;
  inProgress: number;
  closed: number;
  sell: number;
  rentOut: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  HOUSING: "Konut",
  LAND: "Arsa",
  COMMERCIAL: "Ticari",
  TRANSFER: "Devren",
  FIELD: "Tarla",
  GARDEN: "Bahçe",
  HOBBY_GARDEN: "Hobi Bahçesi",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Yeni",
  IN_PROGRESS: "İşlemde",
  CLOSED: "Tamamlandı",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "#3b82f6",
  IN_PROGRESS: "#f59e0b",
  CLOSED: "#22c55e",
};

const REQUEST_TYPE_LABELS: Record<string, string> = {
  SELL: "Satmak İstiyorum",
  RENT_OUT: "Kiralamak İstiyorum",
};

export default function AdminPropertyRequestsPage() {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailModal, setDetailModal] = useState<PropertyRequest | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);

  const getToken = () => localStorage.getItem("auth_token") || "";

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    if (token) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);
      const queryString = params.toString();

      const [requestsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/property-requests${queryString ? `?${queryString}` : ""}`, { headers }),
        fetch(`${API_BASE_URL}/property-requests/stats`, { headers }),
      ]);

      if (requestsRes.ok) setRequests(await requestsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error("Veri yüklenemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed) loadData();
  }, [statusFilter, typeFilter, isAuthed]);

  const updateStatus = async (id: string, newStatus: string) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/property-requests/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) loadData();
    } catch (error) {
      console.error("Durum güncellenemedi:", error);
    }
  };

  const handleExport = () => {
    const token = getToken();
    const ids = selectedIds.length > 0 ? selectedIds.join(",") : "";
    window.open(`${API_BASE_URL}/property-requests/export?ids=${ids}&token=${token}`, "_blank");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === requests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(requests.map((r) => r.id));
    }
  };

  if (!isAuthed) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <div className="admin-card" style={{ textAlign: "center", padding: 40 }}>
            <i className="fa-solid fa-lock" style={{ fontSize: 48, color: "#ccc", marginBottom: 16 }}></i>
            <h2>Giriş Gerekli</h2>
            <p>Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
            <Link href="/admin/login" className="btn btn-primary" style={{ marginTop: 16 }}>
              Giriş Yap
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
              <i className="fa-solid fa-handshake" style={{ marginRight: 12, color: "#0a4ea3" }}></i>
              Satış / Kiralama Talepleri
            </h1>
            <p style={{ color: "#6b7280", margin: "4px 0 0" }}>Satmak/Kiralamak İstiyorum formundan gelen talepler</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/admin" className="btn btn-outline">
              <i className="fa-solid fa-arrow-left"></i> Admin Panel
            </Link>
            <button className="btn btn-primary" onClick={handleExport}>
              <i className="fa-solid fa-file-excel"></i> Excel İndir
            </button>
          </div>
        </div>

        {/* İstatistikler */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24 }}>
            <div className="card" style={{ padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#1f2937" }}>{stats.total}</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>Toplam</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: "center", borderLeft: "4px solid #dc2626" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#dc2626" }}>{stats.sell}</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>Satış</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: "center", borderLeft: "4px solid #7c3aed" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#7c3aed" }}>{stats.rentOut}</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>Kiralama</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: "center", borderLeft: "4px solid #3b82f6" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>{stats.new}</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>Yeni</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: "center", borderLeft: "4px solid #f59e0b" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{stats.inProgress}</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>İşlemde</div>
            </div>
            <div className="card" style={{ padding: 16, textAlign: "center", borderLeft: "4px solid #22c55e" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{stats.closed}</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>Tamamlandı</div>
            </div>
          </div>
        )}

        {/* Filtreler */}
        <div className="card" style={{ padding: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ maxWidth: 180 }}
            >
              <option value="">Tüm Tipler</option>
              <option value="SELL">Satış Talebi</option>
              <option value="RENT_OUT">Kiralama Talebi</option>
            </select>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: 180 }}
            >
              <option value="">Tüm Durumlar</option>
              <option value="NEW">Yeni</option>
              <option value="IN_PROGRESS">İşlemde</option>
              <option value="CLOSED">Tamamlandı</option>
            </select>
            <button className="btn btn-outline" onClick={loadData}>
              <i className="fa-solid fa-refresh"></i> Yenile
            </button>
            {selectedIds.length > 0 && (
              <span style={{ marginLeft: "auto", color: "#6b7280" }}>
                {selectedIds.length} talep seçildi
              </span>
            )}
          </div>
        </div>

        {/* Tablo */}
        <div className="card">
          {isLoading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32 }}></i>
              <p>Yükleniyor...</p>
            </div>
          ) : requests.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
              <i className="fa-solid fa-inbox" style={{ fontSize: 48, marginBottom: 16 }}></i>
              <p>Henüz talep yok</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: 12, textAlign: "left", width: 40 }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.length === requests.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th style={{ padding: 12, textAlign: "left" }}>Tarih</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Tip</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Ad Soyad</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Telefon</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Konum</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Kategori</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Durum</th>
                    <th style={{ padding: 12, textAlign: "center", width: 100 }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: 12 }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(req.id)}
                          onChange={() => toggleSelect(req.id)}
                        />
                      </td>
                      <td style={{ padding: 12, fontSize: 13 }}>
                        {new Date(req.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            background: req.requestType === "SELL" ? "#fee2e2" : "#ede9fe",
                            color: req.requestType === "SELL" ? "#dc2626" : "#7c3aed",
                          }}
                        >
                          {req.requestType === "SELL" ? "Satış" : "Kiralama"}
                        </span>
                      </td>
                      <td style={{ padding: 12, fontWeight: 500 }}>{req.fullName}</td>
                      <td style={{ padding: 12, fontSize: 13 }}>{req.phone}</td>
                      <td style={{ padding: 12, fontSize: 13 }}>
                        {req.city?.name}, {req.district?.name}
                      </td>
                      <td style={{ padding: 12, fontSize: 13 }}>
                        {CATEGORY_LABELS[req.category] || req.category}
                      </td>
                      <td style={{ padding: 12 }}>
                        <select
                          value={req.requestStatus}
                          onChange={(e) => updateStatus(req.id, e.target.value)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 4,
                            border: "1px solid #d1d5db",
                            background: STATUS_COLORS[req.requestStatus] + "20",
                            color: STATUS_COLORS[req.requestStatus],
                            fontWeight: 500,
                            fontSize: 12,
                          }}
                        >
                          <option value="NEW">Yeni</option>
                          <option value="IN_PROGRESS">İşlemde</option>
                          <option value="CLOSED">Tamamlandı</option>
                        </select>
                      </td>
                      <td style={{ padding: 12, textAlign: "center" }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => setDetailModal(req)}
                          style={{ padding: "6px 12px", fontSize: 12 }}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detay Modal */}
        {detailModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 20,
            }}
            onClick={() => setDetailModal(null)}
          >
            <div
              className="card"
              style={{ maxWidth: 600, width: "100%", maxHeight: "90vh", overflow: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ margin: 0 }}>Talep Detayı</h2>
                  <button
                    onClick={() => setDetailModal(null)}
                    style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <strong>Talep Tipi:</strong>{" "}
                    <span style={{ color: detailModal.requestType === "SELL" ? "#dc2626" : "#7c3aed", fontWeight: 500 }}>
                      {REQUEST_TYPE_LABELS[detailModal.requestType]}
                    </span>
                  </div>
                  <div>
                    <strong>Ad Soyad:</strong> {detailModal.fullName}
                  </div>
                  <div>
                    <strong>Telefon:</strong> {detailModal.phone}
                  </div>
                  {detailModal.email && (
                    <div>
                      <strong>E-posta:</strong> {detailModal.email}
                    </div>
                  )}
                  <div>
                    <strong>Konum:</strong> {detailModal.city?.name}, {detailModal.district?.name}, {detailModal.neighborhood?.name}
                  </div>
                  {detailModal.address && (
                    <div>
                      <strong>Adres:</strong> {detailModal.address}
                    </div>
                  )}
                  <div>
                    <strong>Kategori:</strong> {CATEGORY_LABELS[detailModal.category]} ({detailModal.listingStatus === "FOR_SALE" ? "Satılık" : "Kiralık"})
                  </div>
                  {detailModal.subPropertyType && (
                    <div>
                      <strong>Alt Kategori:</strong> {detailModal.subPropertyType}
                    </div>
                  )}
                  {detailModal.attributes && Object.keys(detailModal.attributes).length > 0 && (
                    <div>
                      <strong>Özellikler:</strong>
                      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {Object.entries(detailModal.attributes).map(([key, value]) => (
                          <span
                            key={key}
                            style={{
                              padding: "4px 8px",
                              background: "#f3f4f6",
                              borderRadius: 4,
                              fontSize: 13,
                            }}
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {detailModal.notes && (
                    <div>
                      <strong>Notlar:</strong>
                      <p style={{ margin: "8px 0 0", color: "#4b5563" }}>{detailModal.notes}</p>
                    </div>
                  )}
                  {detailModal.images && detailModal.images.length > 0 && (
                    <div>
                      <strong>Fotoğraflar:</strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                        {detailModal.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.startsWith("http") ? img : `${API_BASE_URL}${img}`}
                            alt=""
                            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <strong>Tarih:</strong> {new Date(detailModal.createdAt).toLocaleString("tr-TR")}
                  </div>
                  <div>
                    <strong>Durum:</strong>{" "}
                    <span style={{ color: STATUS_COLORS[detailModal.requestStatus], fontWeight: 500 }}>
                      {STATUS_LABELS[detailModal.requestStatus]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
