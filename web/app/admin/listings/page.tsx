"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL, fetchJson } from "../../../lib/api";
import { formatPrice, getStatusClass, getStatusLabel } from "../../../lib/listings";

type Listing = {
  id: string;
  listingNo?: string | null;
  title: string;
  status?: string | null;
  category?: string | null;
  subPropertyType?: string | null;
  price?: string | null;
  city?: { name: string } | null;
  district?: { name: string } | null;
  neighborhood?: { name: string } | null;
  branch?: { id: string; name: string } | null;
  consultant?: { id: string; user?: { name: string } } | null;
  createdBy?: { id: string; name: string; role: string } | null;
  areaGross?: string | null;
  areaNet?: string | null;
  attributes?: Record<string, string | string[] | boolean | number> | null;
  images?: { url: string; isCover?: boolean | null }[] | null;
  createdAt?: string | null;
};

type Branch = {
  id: string;
  name: string;
};

type Consultant = {
  id: string;
  user?: { name: string };
  branch?: { id: string; name: string };
};

type AuthUser = {
  id: string;
  name: string;
  role: string;
};

const categoryLabels: Record<string, string> = {
  HOUSING: "Konut",
  LAND: "Arsa",
  COMMERCIAL: "Ticari",
  TRANSFER: "Devren",
  FIELD: "Tarla",
  GARDEN: "Bahçe",
  HOBBY_GARDEN: "Hobi Bahçesi",
};

// Rol kontrolleri
const MANAGER_ROLES = ["ADMIN", "MANAGER", "BROKER", "FIRM_OWNER", "REAL_ESTATE_EXPERT"];
const isManagerRole = (role: string) => MANAGER_ROLES.includes(role);

export default function AdminListingsPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteError, setDeleteError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Tab state (sadece yöneticiler için)
  const [activeTab, setActiveTab] = useState<"my" | "all">("my");
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [consultantFilter, setConsultantFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Transfer modal
  const [transferModal, setTransferModal] = useState<{ listingId: string; title: string } | null>(null);
  const [transferConsultantId, setTransferConsultantId] = useState("");

  const isManager = user?.role ? isManagerRole(user.role) : false;

  const loadData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    
    try {
      // Şubeleri yükle
      const branchData = await fetchJson<Branch[]>("/branches", { cache: "no-store" });
      setBranches(branchData);

      if (token && user) {
        const headers = { Authorization: `Bearer ${token}` };

        // Kendi ilanlarını yükle
        const myRes = await fetch(`${API_BASE_URL}/listings/my-listings`, { headers });
        if (myRes.ok) {
          const myData = await myRes.json();
          setMyListings(myData);
        }

        // Yöneticiler için tüm ilanları yükle
        if (isManager) {
          const allRes = await fetch(`${API_BASE_URL}/listings/all-listings`, { headers });
          if (allRes.ok) {
            const allData = await allRes.json();
            setListings(allData);
          }

          // Danışmanları yükle
          const consultantRes = await fetch(`${API_BASE_URL}/consultants`, { headers });
          if (consultantRes.ok) {
            const consultantData = await consultantRes.json();
            setConsultants(consultantData);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");
    
    setIsAuthed(Boolean(token));
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        // ignore
      }
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && user) {
      loadData();
    }
  }, [isReady, user]);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setDeleteError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    const shouldDelete = window.confirm("Bu ilanı silmek istediğinize emin misiniz?");
    if (!shouldDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("İlan silinemedi.");
      setSuccessMsg("İlan silindi");
      await loadData();
    } catch {
      setDeleteError("İlan silme başarısız.");
    }
  };

  const handleTransfer = async () => {
    if (!transferModal || !transferConsultantId) return;
    
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/listings/${transferModal.listingId}/transfer`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ consultantId: transferConsultantId }),
      });

      if (!response.ok) throw new Error("Transfer başarısız.");
      
      setSuccessMsg("İlan başarıyla transfer edildi");
      setTransferModal(null);
      setTransferConsultantId("");
      await loadData();
    } catch {
      setDeleteError("Transfer işlemi başarısız.");
    }
  };

  // Aktif listeyi belirle
  const currentListings = activeTab === "my" || !isManager ? myListings : listings;

  // Filter and sort listings
  const filteredListings = currentListings
    .filter((listing) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchTitle = listing.title?.toLowerCase().includes(search);
        const matchNo = listing.listingNo?.toLowerCase().includes(search);
        if (!matchTitle && !matchNo) return false;
      }
      if (statusFilter && listing.status !== statusFilter) return false;
      if (categoryFilter && listing.category !== categoryFilter) return false;
      if (branchFilter && listing.branch?.id !== branchFilter) return false;
      if (consultantFilter && listing.consultant?.id !== consultantFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "price-asc":
          return Number(a.price || 0) - Number(b.price || 0);
        case "price-desc":
          return Number(b.price || 0) - Number(a.price || 0);
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        default: // newest
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

  // Şubeye göre danışmanları filtrele
  const filteredConsultants = branchFilter
    ? consultants.filter(c => c.branch?.id === branchFilter)
    : consultants;

  return (
    <main className="section">
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
              {isManager ? "İlan Yönetimi" : "İlanlarım"}
            </h1>
            <p style={{ color: "var(--color-muted)", margin: "4px 0 0", fontSize: 14 }}>
              {activeTab === "my" || !isManager
                ? `${myListings.length} ilanınız var`
                : `Toplam ${listings.length} ilan`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/admin" className="btn btn-outline">
              <i className="fa-solid fa-arrow-left" style={{ marginRight: 8 }}></i>
              Yönetim Paneli
            </Link>
            <Link href="/admin/listings/new" className="btn">
              <i className="fa-solid fa-plus" style={{ marginRight: 8 }}></i>
              Yeni İlan Ekle
            </Link>
          </div>
        </div>

        {!isReady ? (
          <div className="card"><div className="card-body">Kontrol ediliyor...</div></div>
        ) : null}

        {isReady && !isAuthed ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">
              Bu sayfayı kullanmak için giriş yapın.{" "}
              <Link href="/admin/login" className="btn btn-outline">Giriş Yap</Link>
            </div>
          </div>
        ) : null}

        {deleteError && (
          <div className="card" style={{ marginBottom: 16, background: "#fee2e2", borderColor: "#ef4444" }}>
            <div className="card-body" style={{ color: "#dc2626" }}>
              {deleteError}
              <button onClick={() => setDeleteError("")} style={{ marginLeft: 12, cursor: "pointer" }}>✕</button>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="card" style={{ marginBottom: 16, background: "#d1fae5", borderColor: "#10b981" }}>
            <div className="card-body" style={{ color: "#059669" }}>
              {successMsg}
              <button onClick={() => setSuccessMsg("")} style={{ marginLeft: 12, cursor: "pointer" }}>✕</button>
            </div>
          </div>
        )}

        {/* Tabs - Sadece yöneticiler için */}
        {isManager && (
          <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
            <button
              className={`btn ${activeTab === "my" ? "" : "btn-outline"}`}
              style={{ borderRadius: "8px 0 0 8px", minWidth: 140 }}
              onClick={() => setActiveTab("my")}
            >
              <i className="fa-solid fa-user" style={{ marginRight: 8 }}></i>
              İlanlarım ({myListings.length})
            </button>
            <button
              className={`btn ${activeTab === "all" ? "" : "btn-outline"}`}
              style={{ borderRadius: "0 8px 8px 0", minWidth: 180 }}
              onClick={() => setActiveTab("all")}
            >
              <i className="fa-solid fa-users" style={{ marginRight: 8 }}></i>
              Danışman İlanları ({listings.length})
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <input
              className="search-input"
              placeholder="Ara (başlık, ilan no)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: 200 }}
            />
            <select
              className="search-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: 120 }}
            >
              <option value="">Tüm Durum</option>
              <option value="FOR_SALE">Satılık</option>
              <option value="FOR_RENT">Kiralık</option>
            </select>
            <select
              className="search-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ maxWidth: 130 }}
            >
              <option value="">Tüm Kategori</option>
              <option value="HOUSING">Konut</option>
              <option value="LAND">Arsa</option>
              <option value="COMMERCIAL">Ticari</option>
              <option value="FIELD">Tarla</option>
              <option value="GARDEN">Bahçe</option>
              <option value="HOBBY_GARDEN">Hobi Bahçesi</option>
              <option value="TRANSFER">Devren</option>
            </select>
            
            {/* Şube ve Danışman filtreleri - sadece yöneticiler için "tüm ilanlar" tabında */}
            {isManager && activeTab === "all" && (
              <>
                <select
                  className="search-input"
                  value={branchFilter}
                  onChange={(e) => {
                    setBranchFilter(e.target.value);
                    setConsultantFilter(""); // Şube değişince danışman filtresini sıfırla
                  }}
                  style={{ maxWidth: 150 }}
                >
                  <option value="">Tüm Şubeler</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
                <select
                  className="search-input"
                  value={consultantFilter}
                  onChange={(e) => setConsultantFilter(e.target.value)}
                  style={{ maxWidth: 160 }}
                >
                  <option value="">Tüm Danışmanlar</option>
                  {filteredConsultants.map((c) => (
                    <option key={c.id} value={c.id}>{c.user?.name || "İsimsiz"}</option>
                  ))}
                </select>
              </>
            )}
            
            <select
              className="search-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ maxWidth: 140 }}
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="price-asc">Fiyat (Artan)</option>
              <option value="price-desc">Fiyat (Azalan)</option>
              <option value="title">Başlık (A-Z)</option>
            </select>
            <button className="btn btn-outline" onClick={loadData} style={{ marginLeft: "auto" }}>
              <i className="fa-solid fa-refresh"></i>
            </button>
          </div>
        </div>

        {/* Listings Table */}
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {isLoading ? (
              <div style={{ padding: 24, textAlign: "center" }}>Yükleniyor...</div>
            ) : filteredListings.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center" }}>
                {currentListings.length === 0 ? "Henüz ilan yok." : "Filtrelere uygun ilan bulunamadı."}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-border)", textAlign: "left", background: "#f9fafb" }}>
                      <th style={{ padding: "12px 8px", width: 60 }}>Foto</th>
                      <th style={{ padding: "12px 8px", width: 75 }}>İlan No</th>
                      <th style={{ padding: "12px 8px", width: 70 }}>Durum</th>
                      <th style={{ padding: "12px 8px" }}>Başlık</th>
                      <th style={{ padding: "12px 8px", width: 90 }}>Kategori</th>
                      {isManager && activeTab === "all" && (
                        <th style={{ padding: "12px 8px", width: 120 }}>Danışman</th>
                      )}
                      <th style={{ padding: "12px 8px", width: 100 }}>Konum</th>
                      <th style={{ padding: "12px 8px", width: 100 }}>Fiyat</th>
                      <th style={{ padding: "12px 8px", width: isManager ? 150 : 110 }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((listing) => {
                      const coverImage = listing.images?.find(img => img.isCover) || listing.images?.[0];
                      
                      return (
                        <tr key={listing.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <td style={{ padding: "8px" }}>
                            {coverImage ? (
                              <img
                                src={coverImage.url.startsWith("http") ? coverImage.url : `${API_BASE_URL}${coverImage.url}`}
                                alt=""
                                style={{ width: 50, height: 40, objectFit: "cover", borderRadius: 4 }}
                              />
                            ) : (
                              <div style={{ width: 50, height: 40, background: "#f0f0f0", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className="fa-solid fa-image" style={{ color: "#ccc" }}></i>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "8px", fontFamily: "monospace", fontSize: 11 }}>
                            #{listing.listingNo || listing.id.slice(-5)}
                          </td>
                          <td style={{ padding: "8px" }}>
                            <span className={`badge ${getStatusClass(listing.status)}`} style={{ fontSize: 10, padding: "2px 6px" }}>
                              {getStatusLabel(listing.status)}
                            </span>
                          </td>
                          <td style={{ padding: "8px" }}>
                            <div style={{ fontWeight: 600, maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {listing.title}
                            </div>
                          </td>
                          <td style={{ padding: "8px", fontSize: 11 }}>
                            {categoryLabels[listing.category || ""] || listing.category}
                          </td>
                          {isManager && activeTab === "all" && (
                            <td style={{ padding: "8px", fontSize: 11 }}>
                              <div>{listing.consultant?.user?.name || listing.createdBy?.name || "-"}</div>
                              <div style={{ color: "var(--color-muted)", fontSize: 10 }}>
                                {listing.branch?.name}
                              </div>
                            </td>
                          )}
                          <td style={{ padding: "8px", fontSize: 11 }}>
                            <div>{listing.city?.name}</div>
                            <div style={{ color: "var(--color-muted)", fontSize: 10 }}>
                              {listing.district?.name}
                            </div>
                          </td>
                          <td style={{ padding: "8px", fontWeight: 600, color: "var(--color-primary)", fontSize: 12 }}>
                            {formatPrice(listing.price)}
                          </td>
                          <td style={{ padding: "8px" }}>
                            <div style={{ display: "flex", gap: 4 }}>
                              <Link
                                href={`/listings/${listing.id}`}
                                className="btn btn-outline"
                                style={{ padding: "5px 8px", fontSize: 10 }}
                                title="Görüntüle"
                              >
                                <i className="fa-solid fa-eye"></i>
                              </Link>
                              <Link
                                href={`/admin/listings/${listing.id}/edit`}
                                className="btn btn-outline"
                                style={{ padding: "5px 8px", fontSize: 10 }}
                                title="Düzenle"
                              >
                                <i className="fa-solid fa-edit"></i>
                              </Link>
                              {/* Transfer butonu - sadece yöneticiler için */}
                              {isManager && activeTab === "all" && (
                                <button
                                  className="btn btn-outline"
                                  onClick={() => setTransferModal({ listingId: listing.id, title: listing.title })}
                                  style={{ padding: "5px 8px", fontSize: 10 }}
                                  title="Transfer Et"
                                >
                                  <i className="fa-solid fa-right-left"></i>
                                </button>
                              )}
                              <button
                                className="btn btn-outline"
                                onClick={() => handleDelete(listing.id)}
                                disabled={!isAuthed}
                                style={{ padding: "5px 8px", fontSize: 10, color: "#dc2626", borderColor: "#dc2626" }}
                                title="Sil"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div style={{ marginTop: 16, fontSize: 13, color: "var(--color-muted)", textAlign: "center" }}>
          {filteredListings.length} / {currentListings.length} ilan gösteriliyor
        </div>

        {/* Transfer Modal */}
        {transferModal && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}>
            <div className="card" style={{ width: "100%", maxWidth: 450, margin: 16 }}>
              <div className="card-body">
                <h3 style={{ margin: "0 0 16px" }}>İlan Transfer Et</h3>
                <p style={{ fontSize: 14, color: "var(--color-muted)", marginBottom: 16 }}>
                  <strong>&quot;{transferModal.title}&quot;</strong> ilanını başka bir danışmana transfer ediyorsunuz.
                </p>
                
                <label className="form-label">Şube Seçin</label>
                <select
                  className="form-select"
                  value={branchFilter}
                  onChange={(e) => {
                    setBranchFilter(e.target.value);
                    setTransferConsultantId("");
                  }}
                  style={{ marginBottom: 12 }}
                >
                  <option value="">Tüm Şubeler</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>

                <label className="form-label">Danışman Seçin *</label>
                <select
                  className="form-select"
                  value={transferConsultantId}
                  onChange={(e) => setTransferConsultantId(e.target.value)}
                  style={{ marginBottom: 20 }}
                >
                  <option value="">Danışman Seçin</option>
                  {filteredConsultants.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.user?.name || "İsimsiz"} {c.branch ? `(${c.branch.name})` : ""}
                    </option>
                  ))}
                </select>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setTransferModal(null);
                      setTransferConsultantId("");
                    }}
                  >
                    İptal
                  </button>
                  <button
                    className="btn"
                    onClick={handleTransfer}
                    disabled={!transferConsultantId}
                  >
                    <i className="fa-solid fa-right-left" style={{ marginRight: 8 }}></i>
                    Transfer Et
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
