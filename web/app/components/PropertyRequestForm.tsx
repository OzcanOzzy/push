"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Tip tanımları
type City = { id: string; name: string; slug: string };
type District = { id: string; name: string; slug: string; cityId: string };
type Neighborhood = { id: string; name: string; slug: string; districtId: string };

type ListingAttributeDefinition = {
  id: string;
  key: string;
  label: string;
  type: "TEXT" | "NUMBER" | "SELECT" | "BOOLEAN";
  options?: string[] | null;
  allowsMultiple?: boolean | null;
  isRequired?: boolean | null;
  groupName?: string | null;
  suffix?: string | null;
};

// Kategoriler
const CATEGORIES_FOR_SALE = [
  { value: "HOUSING", label: "Konut" },
  { value: "LAND", label: "Arsa" },
  { value: "COMMERCIAL", label: "Ticari" },
  { value: "TRANSFER", label: "Devren" },
  { value: "FIELD", label: "Tarla" },
  { value: "GARDEN", label: "Bahçe" },
  { value: "HOBBY_GARDEN", label: "Hobi Bahçesi" },
];

const CATEGORIES_FOR_RENT = [
  { value: "HOUSING", label: "Konut" },
  { value: "COMMERCIAL", label: "Ticari" },
];

// Alt kategoriler
const SUB_PROPERTY_TYPES: Record<string, { value: string; label: string }[]> = {
  HOUSING: [
    { value: "APART", label: "Apart" },
    { value: "DAIRE", label: "Daire" },
    { value: "DUBLEX", label: "Dublex" },
    { value: "TRIPLEX", label: "Triplex" },
    { value: "VILLA", label: "Villa" },
    { value: "MUSTAKIL_EV", label: "Müstakil Ev" },
    { value: "DEVREMULK", label: "Devremülk" },
    { value: "DIGER", label: "Diğer" },
  ],
  LAND: [
    { value: "KONUT_ARSASI", label: "Konut Arsası" },
    { value: "TICARI_ARSA", label: "Ticari Arsa" },
    { value: "KONUT_TICARI_ARSA", label: "Konut+Ticari Arsa" },
    { value: "SANAYI_ARSASI", label: "Sanayi Arsası" },
    { value: "DIGER", label: "Diğer" },
  ],
  COMMERCIAL: [
    { value: "DUKKAN", label: "Dükkan" },
    { value: "OFIS", label: "Ofis" },
    { value: "DEPO", label: "Depo" },
    { value: "FABRIKA", label: "Fabrika" },
    { value: "DIGER", label: "Diğer" },
  ],
  TRANSFER: [
    { value: "DUKKAN", label: "Dükkan" },
    { value: "OFIS", label: "Ofis" },
    { value: "RESTORAN", label: "Restoran" },
    { value: "CAFE", label: "Cafe" },
    { value: "DIGER", label: "Diğer" },
  ],
  FIELD: [
    { value: "SULU", label: "Sulu Tarla" },
    { value: "KIRAC", label: "Kıraç Tarla" },
    { value: "VERIMLI", label: "Verimli Tarla" },
    { value: "DIGER", label: "Diğer" },
  ],
  GARDEN: [
    { value: "ELMA", label: "Elma Bahçesi" },
    { value: "CEVIZ", label: "Ceviz Bahçesi" },
    { value: "ZEYTIN", label: "Zeytin Bahçesi" },
    { value: "UZUM_BAGI", label: "Üzüm Bağı" },
    { value: "KARISIK", label: "Karışık" },
    { value: "DIGER", label: "Diğer" },
  ],
  HOBBY_GARDEN: [],
};

// Zorunlu alanlar kategoriye göre
const REQUIRED_FIELDS: Record<string, string[]> = {
  HOUSING: ["roomCount", "totalFloors", "floorLocation", "buildingAge", "areaGross", "elevator"],
  LAND: ["blockParcel", "landArea", "paymentType"],
  FIELD: ["blockParcel", "fieldArea", "waterStatus"],
  GARDEN: ["gardenType", "blockParcel", "gardenArea", "waterStatus", "treeCount", "treeAge"],
  HOBBY_GARDEN: ["blockParcel", "gardenArea", "waterStatus", "treeCount", "treeAge"],
  COMMERCIAL: ["commercialType", "hasTenant"],
  TRANSFER: ["commercialType"],
};

// Grup sıralaması
const GROUP_ORDER = [
  "Temel Bilgiler",
  "Banyo/Tuvalet",
  "Balkon",
  "Isıtma/Yalıtım",
  "İç Özellikler",
  "Dış Özellikler",
  "Site/Güvenlik",
  "Aktiviteler",
  "Muhit",
  "Ödeme/Durum",
  "İmar Bilgileri",
  "Konum",
  "Altyapı",
  "Bahçe Bilgileri",
  "Özellikler",
  "Durum",
];

interface PropertyRequestFormProps {
  formType: "valuation" | "property"; // Değerleme veya Satış/Kiralama
  requestType?: "SELL" | "RENT_OUT"; // Sadece property için
  onSuccess?: () => void;
}

export default function PropertyRequestForm({ formType, requestType, onSuccess }: PropertyRequestFormProps) {
  // Konum verileri
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [attributeDefinitions, setAttributeDefinitions] = useState<ListingAttributeDefinition[]>([]);

  // Form durumu
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Form verileri
  const [formData, setFormData] = useState({
    // Müşteri bilgileri
    fullName: "",
    phone: "",
    email: "",
    // Konum
    cityId: "",
    districtId: "",
    neighborhoodId: "",
    address: "",
    // Mülk bilgileri
    listingStatus: "FOR_SALE" as "FOR_SALE" | "FOR_RENT",
    category: "",
    subPropertyType: "",
    // Dinamik özellikler
    attributes: {} as Record<string, unknown>,
    // Medya
    images: [] as string[],
    videoUrl: "",
    // Notlar
    notes: "",
  });

  // Dosya yüklemeleri
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Şehirleri yükle
  useEffect(() => {
    fetch(`${API_BASE_URL}/cities`)
      .then((res) => res.json())
      .then(setCities)
      .catch(console.error);
  }, []);

  // İlçeleri yükle
  useEffect(() => {
    if (!formData.cityId) {
      setDistricts([]);
      return;
    }
    fetch(`${API_BASE_URL}/districts?cityId=${formData.cityId}`)
      .then((res) => res.json())
      .then(setDistricts)
      .catch(console.error);
  }, [formData.cityId]);

  // Mahalleleri yükle
  useEffect(() => {
    if (!formData.districtId) {
      setNeighborhoods([]);
      return;
    }
    fetch(`${API_BASE_URL}/neighborhoods?districtId=${formData.districtId}`)
      .then((res) => res.json())
      .then(setNeighborhoods)
      .catch(console.error);
  }, [formData.districtId]);

  // Özellik tanımlarını yükle
  useEffect(() => {
    if (!formData.category) {
      setAttributeDefinitions([]);
      return;
    }
    const params = new URLSearchParams();
    params.set("category", formData.category);
    params.set("status", formData.listingStatus);
    if (formData.subPropertyType) {
      params.set("subPropertyType", formData.subPropertyType);
    }
    fetch(`${API_BASE_URL}/listing-attributes?${params.toString()}`)
      .then((res) => res.json())
      .then(setAttributeDefinitions)
      .catch(() => setAttributeDefinitions([]));
  }, [formData.category, formData.listingStatus, formData.subPropertyType]);

  // Kategoriler
  const categories = formData.listingStatus === "FOR_SALE" ? CATEGORIES_FOR_SALE : CATEGORIES_FOR_RENT;
  const subTypes = SUB_PROPERTY_TYPES[formData.category] || [];

  // Özellikleri grupla
  const groupedAttributes = attributeDefinitions.reduce((acc, attr) => {
    const group = attr.groupName || "Diğer";
    if (!acc[group]) acc[group] = [];
    acc[group].push(attr);
    return acc;
  }, {} as Record<string, ListingAttributeDefinition[]>);

  const sortedGroups = Object.keys(groupedAttributes).sort(
    (a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b)
  );

  const requiredAttributeDefinitions = attributeDefinitions.filter(attr => attr.isRequired);
  const optionalAttributeDefinitions = attributeDefinitions.filter(attr => !attr.isRequired);

  const groupedRequiredAttributes = requiredAttributeDefinitions.reduce((acc, attr) => {
    const group = attr.groupName || "Diğer";
    if (!acc[group]) acc[group] = [];
    acc[group].push(attr);
    return acc;
  }, {} as Record<string, ListingAttributeDefinition[]>);

  const sortedRequiredGroups = Object.keys(groupedRequiredAttributes).sort(
    (a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b)
  );

  const groupedOptionalAttributes = optionalAttributeDefinitions.reduce((acc, attr) => {
    const group = attr.groupName || "Diğer";
    if (!acc[group]) acc[group] = [];
    acc[group].push(attr);
    return acc;
  }, {} as Record<string, ListingAttributeDefinition[]>);

  const sortedOptionalGroups = Object.keys(groupedOptionalAttributes).sort(
    (a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b)
  );

  // Form değişikliği
  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Kategori değişince alt kategori ve özellikleri sıfırla
      if (field === "category" || field === "listingStatus") {
        newData.subPropertyType = "";
        newData.attributes = {};
      }
      // Şehir değişince ilçe ve mahalle sıfırla
      if (field === "cityId") {
        newData.districtId = "";
        newData.neighborhoodId = "";
      }
      // İlçe değişince mahalle sıfırla
      if (field === "districtId") {
        newData.neighborhoodId = "";
      }
      return newData;
    });
  };

  // Özellik değişikliği
  const handleAttributeChange = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [key]: value },
    }));
  };

  // Fotoğraf yükleme
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files].slice(0, 20)); // Max 20 fotoğraf
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Video yükleme
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  // Zorunlu alan kontrolü
  const isFieldRequired = useCallback((key: string) => {
    const requiredForCategory = REQUIRED_FIELDS[formData.category] || [];
    return requiredForCategory.includes(key);
  }, [formData.category]);

  // Form doğrulama
  const validateForm = (): string | null => {
    // Müşteri bilgileri
    if (!formData.fullName.trim()) return "Ad Soyad zorunludur";
    if (!formData.phone.trim()) return "Telefon zorunludur";
    if (!formData.cityId) return "Şehir seçimi zorunludur";
    if (!formData.districtId) return "İlçe seçimi zorunludur";
    if (!formData.neighborhoodId) return "Mahalle seçimi zorunludur";

    // Mülk bilgileri
    if (!formData.category) return "Kategori seçimi zorunludur";

    // Zorunlu özellikler
    const requiredFields = REQUIRED_FIELDS[formData.category] || [];
    for (const field of requiredFields) {
      const value = formData.attributes[field];
      if (value === undefined || value === null || value === "") {
        const attr = attributeDefinitions.find((a) => a.key === field);
        return `${attr?.label || field} zorunludur`;
      }
    }

    return null;
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Önce dosyaları yükle
      let uploadedImages: string[] = [];
      let uploadedVideoUrl = "";

      if (imageFiles.length > 0) {
        setIsUploading(true);
        const imageFormData = new FormData();
        imageFiles.forEach((file) => imageFormData.append("files", file));

        const uploadRes = await fetch(
          `${API_BASE_URL}/${formType === "valuation" ? "valuation-requests" : "property-requests"}/upload`,
          {
            method: "POST",
            body: imageFormData,
          }
        );
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedImages = uploadData.urls;
        }
      }

      if (videoFile) {
        const videoFormData = new FormData();
        videoFormData.append("files", videoFile);
        const videoRes = await fetch(
          `${API_BASE_URL}/${formType === "valuation" ? "valuation-requests" : "property-requests"}/upload`,
          {
            method: "POST",
            body: videoFormData,
          }
        );
        if (videoRes.ok) {
          const videoData = await videoRes.json();
          uploadedVideoUrl = videoData.urls[0];
        }
      }
      setIsUploading(false);

      // Form verilerini gönder
      const endpoint = formType === "valuation" ? "valuation-requests" : "property-requests";
      const payload: Record<string, unknown> = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        cityId: formData.cityId,
        districtId: formData.districtId,
        neighborhoodId: formData.neighborhoodId,
        listingStatus: formData.listingStatus,
        category: formData.category,
        subPropertyType: formData.subPropertyType || undefined,
        attributes: formData.attributes,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        videoUrl: uploadedVideoUrl || undefined,
        notes: formData.notes || undefined,
        address: formData.address || undefined,
      };

      // Property request için requestType ekle
      if (formType === "property" && requestType) {
        payload.requestType = requestType;
      }

      const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Form gönderilemedi");
      }

      setSubmitSuccess(true);
      onSuccess?.();
    } catch (error) {
      setSubmitError("Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Başarılı gönderim ekranı
  if (submitSuccess) {
    return (
      <div className="form-success" style={{ textAlign: "center", padding: 40 }}>
        <i className="fa-solid fa-check-circle" style={{ fontSize: 64, color: "#22c55e", marginBottom: 20 }}></i>
        <h2 style={{ marginBottom: 16 }}>Talebiniz Alındı!</h2>
        <p style={{ color: "#666", marginBottom: 24 }}>
          En kısa sürede sizinle iletişime geçeceğiz.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSubmitSuccess(false);
            setFormData({
              fullName: "",
              phone: "",
              email: "",
              cityId: "",
              districtId: "",
              neighborhoodId: "",
              address: "",
              listingStatus: "FOR_SALE",
              category: "",
              subPropertyType: "",
              attributes: {},
              images: [],
              videoUrl: "",
              notes: "",
            });
            setImageFiles([]);
            setVideoFile(null);
          }}
        >
          Yeni Talep Oluştur
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="property-request-form">
      {/* Uyarı Notu */}
      <div className="form-notice" style={{
        background: "#fef3c7",
        border: "1px solid #f59e0b",
        borderRadius: 8,
        padding: "12px 16px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <i className="fa-solid fa-circle-info" style={{ color: "#f59e0b", fontSize: 20 }}></i>
        <span style={{ color: "#92400e" }}>
          Doğru sonuç için lütfen bildiğiniz tüm özellikleri doldurunuz.
        </span>
      </div>

      {/* Hata Mesajı */}
      {submitError && (
        <div style={{
          background: "#fee2e2",
          border: "1px solid #ef4444",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 24,
          color: "#dc2626",
        }}>
          <i className="fa-solid fa-exclamation-circle" style={{ marginRight: 8 }}></i>
          {submitError}
        </div>
      )}

      {/* BLOK 1: Müşteri Bilgileri */}
      <div className="form-section" style={{
        background: "#f8fafc",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        border: "1px solid #e2e8f0",
      }}>
        <h3 style={{ margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <i className="fa-solid fa-user" style={{ color: "#0a4ea3" }}></i>
          Müşteri Bilgileri
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          <div>
            <label className="form-label">Ad Soyad *</label>
            <input
              type="text"
              className="form-input"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Adınız ve soyadınız"
              required
            />
          </div>
          <div>
            <label className="form-label">Telefon *</label>
            <input
              type="tel"
              className="form-input"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="05XX XXX XX XX"
              required
            />
          </div>
          <div>
            <label className="form-label">E-posta</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="ornek@email.com"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 16 }}>
          <div>
            <label className="form-label">Şehir *</label>
            <select
              className="form-select"
              value={formData.cityId}
              onChange={(e) => handleChange("cityId", e.target.value)}
              required
            >
              <option value="">Şehir Seçin</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">İlçe *</label>
            <select
              className="form-select"
              value={formData.districtId}
              onChange={(e) => handleChange("districtId", e.target.value)}
              required
              disabled={!formData.cityId}
            >
              <option value="">İlçe Seçin</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>{district.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Mahalle *</label>
            <select
              className="form-select"
              value={formData.neighborhoodId}
              onChange={(e) => handleChange("neighborhoodId", e.target.value)}
              required
              disabled={!formData.districtId}
            >
              <option value="">Mahalle Seçin</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="form-label">Açık Adres</label>
          <textarea
            className="form-input"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Sokak, cadde, bina no vb."
            rows={2}
          />
        </div>
      </div>

      {/* BLOK 2: Mülk Bilgileri */}
      <div className="form-section" style={{
        background: "#f8fafc",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        border: "1px solid #e2e8f0",
      }}>
        <h3 style={{ margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <i className="fa-solid fa-building" style={{ color: "#0a4ea3" }}></i>
          Mülk Bilgileri
        </h3>

        {/* Satılık / Kiralık Seçimi */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label">İlan Durumu *</label>
          <div style={{ display: "flex", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="radio"
                name="listingStatus"
                value="FOR_SALE"
                checked={formData.listingStatus === "FOR_SALE"}
                onChange={() => handleChange("listingStatus", "FOR_SALE")}
              />
              <span>Satılık</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="radio"
                name="listingStatus"
                value="FOR_RENT"
                checked={formData.listingStatus === "FOR_RENT"}
                onChange={() => handleChange("listingStatus", "FOR_RENT")}
              />
              <span>Kiralık</span>
            </label>
          </div>
        </div>

        {/* Kategori Seçimi */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div>
            <label className="form-label">Kategori *</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              required
            >
              <option value="">Kategori Seçin</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {subTypes.length > 0 && (
            <div>
              <label className="form-label">Alt Kategori</label>
              <select
                className="form-select"
                value={formData.subPropertyType}
                onChange={(e) => handleChange("subPropertyType", e.target.value)}
              >
                <option value="">Alt Kategori Seçin</option>
                {subTypes.map((sub) => (
                  <option key={sub.value} value={sub.value}>{sub.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Dinamik Özellikler */}
        {/* Zorunlu Bilgiler */}
        {requiredAttributeDefinitions.length > 0 && (
          <div className="form-section" style={{
            background: "#f0fdf4", // Yeşil tonu
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            border: "1px solid #34d399",
          }}>
            <h3 style={{ margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10, color: "#059669" }}>
              <i className="fa-solid fa-asterisk" style={{ color: "#059669" }}></i>
              Zorunlu Bilgiler
            </h3>
            {sortedRequiredGroups.map((groupName) => (
              <div key={groupName} style={{ marginTop: 24 }}>
                <h4 style={{ margin: "0 0 12px", color: "#065f46", fontSize: 14, fontWeight: 600 }}>
                  {groupName}
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  {groupedRequiredAttributes[groupName].map((attr) => {
                    const isRequired = isFieldRequired(attr.key);
                    const value = formData.attributes[attr.key];

                    // BOOLEAN
                    if (attr.type === "BOOLEAN") {
                      return (
                        <label
                          key={attr.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 12px",
                            background: value ? "#dbeafe" : "#fff",
                            border: `1px solid ${value ? "#3b82f6" : "#d1d5db"}`,
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) => handleAttributeChange(attr.key, e.target.checked)}
                          />
                          <span>{attr.label}</span>
                          {isRequired && <span style={{ color: "#ef4444" }}>*</span>}
                        </label>
                      );
                    }

                    // SELECT (Multiple)
                    if (attr.type === "SELECT" && attr.allowsMultiple && attr.options) {
                      const selectedValues = Array.isArray(value) ? value : [];
                      return (
                        <div key={attr.id}>
                          <label className="form-label">
                            {attr.label}
                            {isRequired && <span style={{ color: "#ef4444" }}> *</span>}
                          </label>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {attr.options.map((opt) => (
                              <label
                                key={opt}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  padding: "4px 8px",
                                  background: selectedValues.includes(opt) ? "#dbeafe" : "#f3f4f6",
                                  border: `1px solid ${selectedValues.includes(opt) ? "#3b82f6" : "#e5e7eb"}`,
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedValues.includes(opt)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleAttributeChange(attr.key, [...selectedValues, opt]);
                                    } else {
                                      handleAttributeChange(attr.key, selectedValues.filter((v: string) => v !== opt));
                                    }
                                  }}
                                  style={{ width: 14, height: 14 }}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // SELECT (Single)
                    if (attr.type === "SELECT" && attr.options) {
                      return (
                        <div key={attr.id}>
                          <label className="form-label">
                            {attr.label}
                            {isRequired && <span style={{ color: "#ef4444" }}> *</span>}
                          </label>
                          <select
                            className="form-select"
                            value={String(value || "")}
                            onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                            required={isRequired}
                          >
                            <option value="">Seçin</option>
                            {attr.options.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    // TEXT / NUMBER
                    return (
                      <div key={attr.id}>
                        <label className="form-label">
                            {attr.label}
                            {isRequired && <span style={{ color: "#ef4444" }}> *</span>}
                            {attr.suffix && <span style={{ color: "#9ca3af" }}> ({attr.suffix})</span>}
                        </label>
                        <input
                            type={attr.type === "NUMBER" ? "number" : "text"}
                            className="form-input"
                            value={String(value || "")}
                            onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                            required={isRequired}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Diğer Bilgiler */}
        {optionalAttributeDefinitions.length > 0 && (
          <div className="form-section" style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            border: "1px solid #e2e8f0",
          }}>
            <h3 style={{ margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <i className="fa-solid fa-info-circle" style={{ color: "#0a4ea3" }}></i>
              Diğer Bilgiler
            </h3>
            {sortedOptionalGroups.map((groupName) => (
              <div key={groupName} style={{ marginTop: 24 }}>
                <h4 style={{ margin: "0 0 12px", color: "#374151", fontSize: 14, fontWeight: 600 }}>
                  {groupName}
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  {groupedOptionalAttributes[groupName].map((attr) => {
                    const isRequired = isFieldRequired(attr.key);
                    const value = formData.attributes[attr.key];

                    // BOOLEAN
                    if (attr.type === "BOOLEAN") {
                      return (
                        <label
                          key={attr.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 12px",
                            background: value ? "#dbeafe" : "#fff",
                            border: `1px solid ${value ? "#3b82f6" : "#d1d5db"}`,
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) => handleAttributeChange(attr.key, e.target.checked)}
                          />
                          <span>{attr.label}</span>
                          {isRequired && <span style={{ color: "#ef4444" }}>*</span>}
                        </label>
                      );
                    }

                    // SELECT (Multiple)
                    if (attr.type === "SELECT" && attr.allowsMultiple && attr.options) {
                      const selectedValues = Array.isArray(value) ? value : [];
                      return (
                        <div key={attr.id}>
                          <label className="form-label">
                            {attr.label}
                            {isRequired && <span style={{ color: "#ef4444" }}> *</span>}
                          </label>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {attr.options.map((opt) => (
                              <label
                                key={opt}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  padding: "4px 8px",
                                  background: selectedValues.includes(opt) ? "#dbeafe" : "#f3f4f6",
                                  border: `1px solid ${selectedValues.includes(opt) ? "#3b82f6" : "#e5e7eb"}`,
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedValues.includes(opt)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleAttributeChange(attr.key, [...selectedValues, opt]);
                                    } else {
                                      handleAttributeChange(attr.key, selectedValues.filter((v: string) => v !== opt));
                                    }
                                  }}
                                  style={{ width: 14, height: 14 }}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // SELECT (Single)
                    if (attr.type === "SELECT" && attr.options) {
                      return (
                        <div key={attr.id}>
                          <label className="form-label">
                            {attr.label}
                            {isRequired && <span style={{ color: "#ef4444" }}> *</span>}
                          </label>
                          <select
                            className="form-select"
                            value={String(value || "")}
                            onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                            required={isRequired}
                          >
                            <option value="">Seçin</option>
                            {attr.options.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    // TEXT / NUMBER
                    return (
                      <div key={attr.id}>
                        <label className="form-label">
                            {attr.label}
                            {isRequired && <span style={{ color: "#ef4444" }}> *</span>}
                            {attr.suffix && <span style={{ color: "#9ca3af" }}> ({attr.suffix})</span>}
                        </label>
                        <input
                            type={attr.type === "NUMBER" ? "number" : "text"}
                            className="form-input"
                            value={String(value || "")}
                            onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                            required={isRequired}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        {/* BLOK 3: Medya */}
        <div className="form-section" style={{
          background: "#f8fafc",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          border: "1px solid #e2e8f0",
        }}>
          <h3 style={{ margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <i className="fa-solid fa-camera" style={{ color: "#0a4ea3" }}></i>
            Fotoğraf ve Video
          </h3>

          {/* Fotoğraf Yükleme */}
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Fotoğraflar (Maks. 20 adet)</label>
            <div
              style={{
                border: "2px dashed #d1d5db",
                borderRadius: 8,
                padding: 24,
                textAlign: "center",
                background: "#fff",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <i className="fa-solid fa-cloud-upload-alt" style={{ fontSize: 32, color: "#9ca3af", marginBottom: 8 }}></i>
              <p style={{ margin: 0, color: "#6b7280" }}>Fotoğraf seçmek için tıklayın</p>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: "none" }}
              />
            </div>

            {/* Seçilen Fotoğraflar */}
            {imageFiles.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {imageFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      width: 80,
                      height: 80,
                      borderRadius: 6,
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Yükleme */}
          <div>
            <label className="form-label">Video (Opsiyonel)</label>
            <div
              style={{
                border: "2px dashed #d1d5db",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
                background: "#fff",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("video-upload")?.click()}
            >
              <i className="fa-solid fa-video" style={{ fontSize: 24, color: "#9ca3af", marginBottom: 8 }}></i>
              <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>Video seçmek için tıklayın</p>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                style={{ display: "none" }}
              />
            </div>

            {videoFile && (
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-file-video" style={{ color: "#3b82f6" }}></i>
                <span style={{ fontSize: 14 }}>{videoFile.name}</span>
                <button
                  type="button"
                  onClick={() => setVideoFile(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                  }}
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notlar */}
        <div className="form-section" style={{
          background: "#f8fafc",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          border: "1px solid #e2e8f0",
        }}>
          <h3 style={{ margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <i className="fa-solid fa-comment" style={{ color: "#0a4ea3" }}></i>
            Ek Notlar
          </h3>
          <textarea
            className="form-input"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Eklemek istediğiniz notlar veya özel bilgiler..."
            rows={4}
          />
        </div>

        {/* Gönder Butonu */}
        <div style={{ textAlign: "center" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || isUploading}
            style={{
              padding: "14px 48px",
              fontSize: 16,
              fontWeight: 600,
              opacity: isSubmitting || isUploading ? 0.7 : 1,
            }}
          >
            {isSubmitting || isUploading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }}></i>
                {isUploading ? "Dosyalar Yükleniyor..." : "Gönderiliyor..."}
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i>
                Talebi Gönder
              </>
            )}
          </button>
        </div>
    </form>
  );
}
