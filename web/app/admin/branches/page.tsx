"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Branch {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  districtId?: string;
  address?: string;
  photoUrl?: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  mapUrl?: string;
  workingHours?: string;
  city?: { id: string; name: string };
  district?: { id: string; name: string };
  neighborhoods?: { neighborhood: Neighborhood }[];
}

interface City {
  id: string;
  name: string;
  slug: string;
}

interface District {
  id: string;
  name: string;
  slug: string;
  cityId: string;
}

interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  districtId: string;
  district?: { id: string; name: string };
}

export default function AdminBranchesPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [calculatingNeighbors, setCalculatingNeighbors] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showNeighborhoodModal, setShowNeighborhoodModal] = useState(false);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    cityId: "",
    districtId: "",
    address: "",
    photoUrl: "",
    phone: "",
    whatsappNumber: "",
    email: "",
    mapUrl: "",
    workingHours: "",
    neighborhoodIds: [] as string[],
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(!!token);
    setIsReady(true);
    if (token) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");

      // Şehirleri yükle
      const citiesRes = await fetch(`${API_BASE_URL}/cities`);
      const citiesData = await citiesRes.json();
      setCities(Array.isArray(citiesData) ? citiesData : []);

      // Şubeleri yükle (yeni Branch API)
      const branchesRes = await fetch(`${API_BASE_URL}/branches`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const branchesData = await branchesRes.json();
      setBranches(Array.isArray(branchesData) ? branchesData : []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Şehir değişince ilçeleri yükle
  const loadDistricts = useCallback(async (cityId: string) => {
    if (!cityId) {
      setDistricts([]);
      setNeighborhoods([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/districts?cityId=${cityId}`);
      const data = await res.json();
      setDistricts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Districts load error:", error);
      setDistricts([]);
    }
  }, []);

  // İlçe veya şehir değişince mahalleleri yükle
  const loadNeighborhoods = useCallback(async (cityId: string, districtId?: string) => {
    if (!cityId) {
      setNeighborhoods([]);
      return;
    }
    try {
      const url = districtId
        ? `${API_BASE_URL}/neighborhoods?districtId=${districtId}`
        : `${API_BASE_URL}/neighborhoods?cityId=${cityId}`;
      const res = await fetch(url);
      const data = await res.json();
      setNeighborhoods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Neighborhoods load error:", error);
      setNeighborhoods([]);
    }
  }, []);

  // Şehir değişince
  useEffect(() => {
    if (formData.cityId) {
      loadDistricts(formData.cityId);
      loadNeighborhoods(formData.cityId, formData.districtId || undefined);
    } else {
      setDistricts([]);
      setNeighborhoods([]);
    }
  }, [formData.cityId, loadDistricts, loadNeighborhoods]);

  // İlçe değişince
  useEffect(() => {
    if (formData.cityId) {
      loadNeighborhoods(formData.cityId, formData.districtId || undefined);
    }
  }, [formData.districtId, formData.cityId, loadNeighborhoods]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/settings/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });

      const data = await res.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, photoUrl: data.url }));
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    if (!formData.cityId) {
      setMessage({ type: "error", text: "Şehir seçimi zorunludur!" });
      return;
    }

    try {
      const url = editingId
        ? `${API_BASE_URL}/branches/${editingId}`
        : `${API_BASE_URL}/branches`;

      const method = editingId ? "PATCH" : "POST";

      const payload = {
        name: formData.name,
        slug: formData.slug,
        cityId: formData.cityId,
        districtId: formData.districtId || null,
        address: formData.address || null,
        photoUrl: formData.photoUrl || null,
        phone: formData.phone || null,
        whatsappNumber: formData.whatsappNumber || null,
        email: formData.email || null,
        mapUrl: formData.mapUrl || null,
        workingHours: formData.workingHours || null,
        neighborhoodIds: formData.neighborhoodIds,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: "success", text: editingId ? "Şube güncellendi!" : "Şube eklendi!" });
        loadData();
        resetForm();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: errorData.message || "İşlem başarısız!" });
      }
    } catch (error) {
      console.error("Save error:", error);
      setMessage({ type: "error", text: "Bir hata oluştu!" });
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingId(branch.id);
    const neighborhoodIds = branch.neighborhoods?.map((n) => n.neighborhood.id) || [];
    
    setFormData({
      name: branch.name || "",
      slug: branch.slug || "",
      cityId: branch.cityId || branch.city?.id || "",
      districtId: branch.districtId || branch.district?.id || "",
      address: branch.address || "",
      photoUrl: branch.photoUrl || "",
      phone: branch.phone || "",
      whatsappNumber: branch.whatsappNumber || "",
      email: branch.email || "",
      mapUrl: branch.mapUrl || "",
      workingHours: branch.workingHours || "",
      neighborhoodIds,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu şubeyi silmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/branches/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        loadData();
        setMessage({ type: "success", text: "Şube silindi!" });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: errorData.message || "Silme işlemi başarısız!" });
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleCalculateNeighbors = async () => {
    if (!formData.cityId) {
      setMessage({ type: "error", text: "Önce şehir seçin!" });
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    setCalculatingNeighbors(true);
    try {
      const res = await fetch(`${API_BASE_URL}/branches/calculate-neighbors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cityId: formData.cityId,
          maxDistance: 3, // Varsayılan 3km
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `Komşu mahalleler hesaplandı! ${data.processed} mahalle işlendi, ${data.neighborPairsCreated} komşuluk oluşturuldu.`,
        });
      } else {
        setMessage({ type: "error", text: data.message || "Hesaplama başarısız!" });
      }
    } catch (error) {
      console.error("Calculate neighbors error:", error);
      setMessage({ type: "error", text: "Bir hata oluştu!" });
    } finally {
      setCalculatingNeighbors(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      cityId: "",
      districtId: "",
      address: "",
      photoUrl: "",
      phone: "",
      whatsappNumber: "",
      email: "",
      mapUrl: "",
      workingHours: "",
      neighborhoodIds: [],
    });
    setDistricts([]);
    setNeighborhoods([]);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const toggleNeighborhood = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      neighborhoodIds: prev.neighborhoodIds.includes(id)
        ? prev.neighborhoodIds.filter((n) => n !== id)
        : [...prev.neighborhoodIds, id],
    }));
  };

  const selectAllNeighborhoods = () => {
    const filtered = neighborhoods.filter((n) =>
      n.name.toLowerCase().includes(neighborhoodSearch.toLowerCase())
    );
    const ids = filtered.map((n) => n.id);
    setFormData((prev) => ({
      ...prev,
      neighborhoodIds: [...new Set([...prev.neighborhoodIds, ...ids])],
    }));
  };

  const clearAllNeighborhoods = () => {
    setFormData((prev) => ({ ...prev, neighborhoodIds: [] }));
  };

  // Filtrelenmiş mahalleler
  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.name.toLowerCase().includes(neighborhoodSearch.toLowerCase())
  );

  // İlçe bazlı grupla
  const groupedNeighborhoods = filteredNeighborhoods.reduce((acc, n) => {
    const districtName = n.district?.name || "Diğer";
    if (!acc[districtName]) acc[districtName] = [];
    acc[districtName].push(n);
    return acc;
  }, {} as Record<string, Neighborhood[]>);

  if (!isReady) return null;

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
        <div className="admin-header">
          <h1 className="admin-title">
            <i className="fa-solid fa-building"></i> Şube Yönetimi
          </h1>
          <div className="admin-actions">
            <Link href="/admin" className="btn btn-secondary">
              <i className="fa-solid fa-arrow-left"></i> Admin Panel
            </Link>
            <button onClick={loadData} className="btn btn-secondary">
              <i className="fa-solid fa-rotate"></i> Yenile
            </button>
          </div>
        </div>

        {/* Mesaj */}
        {message.text && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 20,
              background: message.type === "success" ? "#d4edda" : "#f8d7da",
              color: message.type === "success" ? "#155724" : "#721c24",
            }}
          >
            <i className={`fa-solid ${message.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>{" "}
            {message.text}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "450px 1fr", gap: 24 }}>
          {/* Sol - Form */}
          <div className="admin-card">
            <h3 style={{ margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-edit" style={{ color: "#0a4ea3" }}></i>
              {editingId ? "Şube Düzenle" : "Yeni Şube Ekle"}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
              {/* Şube Adı */}
              <div className="form-group">
                <label className="form-label">Şube Adı *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: editingId ? formData.slug : generateSlug(e.target.value),
                    });
                  }}
                  placeholder="Örn: Karaman Merkez"
                  required
                />
              </div>

              {/* Slug */}
              <div className="form-group">
                <label className="form-label">URL Slug *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="karaman-merkez"
                  required
                />
                <small style={{ color: "#666", fontSize: 11 }}>
                  Sayfa URL'i: /subeler/{formData.slug || "..."}
                </small>
              </div>

              {/* Şehir ve İlçe Seçimi */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Şehir *</label>
                  <select
                    className="form-select"
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value, districtId: "", neighborhoodIds: [] })}
                    required
                  >
                    <option value="">Şehir Seçin</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">İlçe (Opsiyonel)</label>
                  <select
                    className="form-select"
                    value={formData.districtId}
                    onChange={(e) => setFormData({ ...formData, districtId: e.target.value, neighborhoodIds: [] })}
                    disabled={!formData.cityId || districts.length === 0}
                  >
                    <option value="">Tüm İlçeler</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: "#666", fontSize: 11 }}>
                    İlçe seçilmezse şehirdeki tüm mahalleler listelenir
                  </small>
                </div>
              </div>

              {/* Mahalle Seçimi */}
              <div className="form-group">
                <label className="form-label">
                  Hizmet Verilen Mahalleler
                  {formData.neighborhoodIds.length > 0 && (
                    <span style={{ color: "#10b981", marginLeft: 8 }}>
                      ({formData.neighborhoodIds.length} seçili)
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => setShowNeighborhoodModal(true)}
                  disabled={!formData.cityId}
                >
                  <i className="fa-solid fa-map-marker-alt"></i>
                  Mahalle Seç
                </button>
                {formData.neighborhoodIds.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {formData.neighborhoodIds.slice(0, 5).map((id) => {
                      const n = neighborhoods.find((n) => n.id === id);
                      return n ? (
                        <span
                          key={id}
                          style={{
                            background: "#e0f2fe",
                            color: "#0369a1",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                          }}
                        >
                          {n.name}
                        </span>
                      ) : null;
                    })}
                    {formData.neighborhoodIds.length > 5 && (
                      <span style={{ color: "#666", fontSize: 11 }}>
                        +{formData.neighborhoodIds.length - 5} daha
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Komşu Mahalleleri Hesapla */}
              {formData.cityId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCalculateNeighbors}
                  disabled={calculatingNeighbors}
                  style={{ background: "#f0fdf4", borderColor: "#10b981", color: "#059669" }}
                >
                  {calculatingNeighbors ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fa-solid fa-calculator"></i>
                  )}
                  Komşu Mahalleleri Hesapla (3km)
                </button>
              )}

              {/* Fotoğraf */}
              <div className="form-group">
                <label className="form-label">Şube Fotoğrafı</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="URL veya yükle"
                    style={{ flex: 1 }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-upload"></i>}
                  </button>
                </div>
                {formData.photoUrl && (
                  <img
                    src={formData.photoUrl.startsWith("http") ? formData.photoUrl : `${API_BASE_URL}${formData.photoUrl}`}
                    alt="Önizleme"
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, marginTop: 8 }}
                  />
                )}
              </div>

              {/* İletişim Bilgileri */}
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#64748b" }}>
                  <i className="fa-solid fa-address-card" style={{ marginRight: 8 }}></i>
                  İletişim Bilgileri
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Telefon</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0555 123 45 67"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">WhatsApp</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder="905551234567"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">E-posta</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="karaman@emlaknomi.com"
                  />
                </div>

                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">Adres</label>
                  <textarea
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Şube adresi..."
                    rows={2}
                  />
                </div>

                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">Google Maps Embed URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.mapUrl}
                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                    placeholder="https://www.google.com/maps/embed?..."
                  />
                </div>

                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">Çalışma Saatleri</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.workingHours}
                    onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                    placeholder="Hafta içi: 09:00 - 18:00"
                  />
                </div>
              </div>

              {/* Butonlar */}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <i className={`fa-solid ${editingId ? "fa-check" : "fa-plus"}`}></i>
                  {editingId ? "Güncelle" : "Ekle"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    İptal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Sağ - Liste */}
          <div className="admin-card">
            <h3 style={{ margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-list" style={{ color: "#0a4ea3" }}></i>
              Şubeler ({branches.length})
            </h3>

            {loading ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24 }}></i>
              </div>
            ) : branches.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
                <i className="fa-solid fa-building" style={{ fontSize: 40, marginBottom: 12, display: "block" }}></i>
                Henüz şube eklenmemiş.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: 16,
                      background: "#f8fafc",
                      borderRadius: 10,
                      border: editingId === branch.id ? "2px solid #0a4ea3" : "1px solid #e2e8f0",
                    }}
                  >
                    {/* Fotoğraf */}
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#e2e8f0",
                      }}
                    >
                      {branch.photoUrl ? (
                        <img
                          src={branch.photoUrl.startsWith("http") ? branch.photoUrl : `${API_BASE_URL}${branch.photoUrl}`}
                          alt={branch.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="fa-solid fa-building" style={{ fontSize: 24, color: "#94a3b8" }}></i>
                        </div>
                      )}
                    </div>

                    {/* Bilgiler */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{branch.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        /subeler/{branch.slug}
                        {branch.city && <span> • {branch.city.name}</span>}
                        {branch.district && <span> / {branch.district.name}</span>}
                      </div>
                      {branch.neighborhoods && branch.neighborhoods.length > 0 && (
                        <div style={{ fontSize: 11, color: "#10b981", marginTop: 2 }}>
                          <i className="fa-solid fa-map-marker-alt" style={{ marginRight: 4 }}></i>
                          {branch.neighborhoods.length} mahalle
                        </div>
                      )}
                      {branch.phone && (
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          <i className="fa-solid fa-phone" style={{ marginRight: 4 }}></i>
                          {branch.phone}
                        </div>
                      )}
                    </div>

                    {/* Aksiyonlar */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link
                        href={`/subeler/${branch.slug}`}
                        target="_blank"
                        className="btn btn-secondary"
                        style={{ padding: "8px 12px" }}
                      >
                        <i className="fa-solid fa-eye"></i>
                      </Link>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "8px 12px" }}
                        onClick={() => handleEdit(branch)}
                      >
                        <i className="fa-solid fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "8px 12px", color: "#dc2626" }}
                        onClick={() => handleDelete(branch.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mahalle Seçim Modalı */}
      {showNeighborhoodModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowNeighborhoodModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              width: "90%",
              maxWidth: 600,
              maxHeight: "80vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>
                <i className="fa-solid fa-map-marker-alt" style={{ marginRight: 8, color: "#10b981" }}></i>
                Mahalle Seç
                <span style={{ fontSize: 14, fontWeight: 400, color: "#64748b", marginLeft: 8 }}>
                  ({formData.neighborhoodIds.length} seçili)
                </span>
              </h3>
              <button
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}
                onClick={() => setShowNeighborhoodModal(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Arama */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #e5e7eb", background: "#f8fafc" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <i className="fa-solid fa-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                  <input
                    type="text"
                    placeholder="Mahalle ara..."
                    value={neighborhoodSearch}
                    onChange={(e) => setNeighborhoodSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </div>
                <button className="btn btn-secondary" onClick={selectAllNeighborhoods} style={{ fontSize: 12 }}>
                  Tümünü Seç
                </button>
                <button className="btn btn-secondary" onClick={clearAllNeighborhoods} style={{ fontSize: 12 }}>
                  Temizle
                </button>
              </div>
            </div>

            {/* Mahalle Listesi */}
            <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
              {Object.keys(groupedNeighborhoods).length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
                  {neighborhoodSearch ? "Arama sonucu bulunamadı" : "Mahalle bulunamadı"}
                </div>
              ) : (
                Object.entries(groupedNeighborhoods).map(([districtName, neighs]) => (
                  <div key={districtName} style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: 13, color: "#64748b", marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid #e5e7eb" }}>
                      {districtName} ({neighs.length})
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                      {neighs.map((n) => (
                        <label
                          key={n.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 12px",
                            background: formData.neighborhoodIds.includes(n.id) ? "#e0f2fe" : "#f8fafc",
                            border: formData.neighborhoodIds.includes(n.id) ? "1px solid #0ea5e9" : "1px solid #e2e8f0",
                            borderRadius: 6,
                            cursor: "pointer",
                            transition: "all 200ms",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.neighborhoodIds.includes(n.id)}
                            onChange={() => toggleNeighborhood(n.id)}
                            style={{ accentColor: "#0ea5e9" }}
                          />
                          <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {n.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowNeighborhoodModal(false)}>
                Kapat
              </button>
              <button className="btn btn-primary" onClick={() => setShowNeighborhoodModal(false)}>
                Uygula ({formData.neighborhoodIds.length} mahalle)
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
