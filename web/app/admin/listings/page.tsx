"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { API_BASE_URL, fetchJson } from "../../../lib/api";
import { formatPrice, getStatusClass, getStatusLabel } from "../../../lib/listings";

type City = {
  id: string;
  name: string;
  slug: string;
};

type District = {
  id: string;
  name: string;
  cityId: string;
};

type Neighborhood = {
  id: string;
  name: string;
  districtId: string;
};

type Branch = {
  id: string;
  name: string;
  cityId: string;
  city?: { name: string } | null;
};

type Listing = {
  id: string;
  title: string;
  status?: string | null;
  price?: string | null;
  city?: { name: string } | null;
  branch?: { name: string } | null;
};

type ListingImage = {
  id: string;
  url: string;
  isCover?: boolean | null;
  sortOrder?: number | null;
};

type ListingAttributeDefinition = {
  id: string;
  category: string;
  key: string;
  label: string;
  type: "TEXT" | "NUMBER" | "SELECT" | "BOOLEAN";
  options?: string[] | null;
  allowsMultiple?: boolean | null;
  isRequired?: boolean | null;
  sortOrder?: number | null;
};

type ListingDetail = Listing & {
  description: string;
  category?: string | null;
  propertyType?: string | null;
  isOpportunity?: boolean | null;
  areaGross?: string | null;
  areaNet?: string | null;
  cityId?: string | null;
  districtId?: string | null;
  neighborhoodId?: string | null;
  branchId?: string | null;
  attributes?: Record<string, unknown> | null;
  images?: ListingImage[] | null;
};

const statusOptions = [
  { value: "FOR_SALE", label: "Satılık" },
  { value: "FOR_RENT", label: "Kiralık" },
];

const categoryOptions = [
  { value: "HOUSING", label: "Konut" },
  { value: "LAND", label: "Arsa" },
  { value: "COMMERCIAL", label: "Ticari" },
  { value: "TRANSFER", label: "Devren" },
  { value: "FIELD", label: "Tarla" },
  { value: "GARDEN", label: "Bahçe" },
  { value: "HOBBY_GARDEN", label: "Hobi Bahçesi" },
];

export default function AdminListingsPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [editDistricts, setEditDistricts] = useState<District[]>([]);
  const [editNeighborhoods, setEditNeighborhoods] = useState<Neighborhood[]>([]);
  const [attributeDefinitions, setAttributeDefinitions] = useState<
    ListingAttributeDefinition[]
  >([]);
  const [editAttributeDefinitions, setEditAttributeDefinitions] = useState<
    ListingAttributeDefinition[]
  >([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "saving">("idle");
  const [editId, setEditId] = useState<string | null>(null);
  const [editImages, setEditImages] = useState<ListingImage[]>([]);
  const [editState, setEditState] = useState({
    title: "",
    description: "",
    status: "FOR_SALE",
    category: "HOUSING",
    price: "",
    propertyType: "",
    areaGross: "",
    areaNet: "",
    isOpportunity: false,
    cityId: "",
    districtId: "",
    neighborhoodId: "",
    branchId: "",
    attributes: {} as Record<string, string | boolean | string[]>,
  });
  const [editError, setEditError] = useState("");
  const [editStatus, setEditStatus] = useState<"idle" | "loading" | "saving">(
    "idle",
  );
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageStatus, setImageStatus] = useState<"idle" | "saving">("idle");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [setFirstAsCover, setSetFirstAsCover] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    status: "FOR_SALE",
    category: "HOUSING",
    price: "",
    propertyType: "",
    areaGross: "",
    areaNet: "",
    isOpportunity: false,
    cityId: "",
    districtId: "",
    neighborhoodId: "",
    branchId: "",
    attributes: {} as Record<string, string | boolean | string[]>,
  });

  const availableBranches = useMemo(() => {
    if (!formState.cityId) {
      return branches;
    }
    return branches.filter((branch) => branch.cityId === formState.cityId);
  }, [branches, formState.cityId]);

  const availableEditBranches = useMemo(() => {
    if (!editState.cityId) {
      return branches;
    }
    return branches.filter((branch) => branch.cityId === editState.cityId);
  }, [branches, editState.cityId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cityData, branchData, listingData] = await Promise.all([
        fetchJson<City[]>("/cities", { cache: "no-store" }),
        fetchJson<Branch[]>("/branches", { cache: "no-store" }),
        fetchJson<Listing[]>("/listings", { cache: "no-store" }),
      ]);
      setCities(cityData);
      setBranches(branchData);
      setListings(listingData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
    loadData();
  }, []);

  const renderAttributeField = (
    def: ListingAttributeDefinition,
    value: string | boolean | string[] | undefined,
    onChange: (next: string | boolean | string[]) => void,
  ) => {
    const normalizedValue =
      value === undefined || value === null ? "" : String(value);

    if (def.type === "BOOLEAN") {
      return (
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
          />
          {def.label}
        </label>
      );
    }

    if (def.type === "SELECT" && def.allowsMultiple) {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 600 }}>{def.label}</div>
          {(def.options ?? []).map((option) => (
            <label key={option} style={{ display: "flex", gap: 8 }}>
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={(event) => {
                  if (event.target.checked) {
                    onChange([...selected, option]);
                  } else {
                    onChange(selected.filter((item) => item !== option));
                  }
                }}
              />
              {option}
            </label>
          ))}
        </div>
      );
    }

    if (def.type === "SELECT") {
      return (
        <select
          className="search-input"
          value={normalizedValue}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{def.label}</option>
          {(def.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        className="search-input"
        type={def.type === "NUMBER" ? "number" : "text"}
        placeholder={def.label}
        value={normalizedValue}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  };

  useEffect(() => {
    if (!formState.cityId) {
      setDistricts([]);
      setNeighborhoods([]);
      return;
    }
    fetchJson<District[]>(`/districts?cityId=${formState.cityId}`, {
      cache: "no-store",
    })
      .then((data) => setDistricts(data))
      .catch(() => setDistricts([]));
  }, [formState.cityId]);

  useEffect(() => {
    if (!formState.districtId) {
      setNeighborhoods([]);
      return;
    }
    fetchJson<Neighborhood[]>(`/neighborhoods?districtId=${formState.districtId}`, {
      cache: "no-store",
    })
      .then((data) => setNeighborhoods(data))
      .catch(() => setNeighborhoods([]));
  }, [formState.districtId]);

  useEffect(() => {
    if (!formState.category) {
      setAttributeDefinitions([]);
      setFormState((prev) => ({ ...prev, attributes: {} }));
      return;
    }
    fetchJson<ListingAttributeDefinition[]>(
      `/listing-attributes?category=${formState.category}`,
      { cache: "no-store" },
    )
      .then((data) => setAttributeDefinitions(data))
      .catch(() => setAttributeDefinitions([]));
  }, [formState.category]);

  useEffect(() => {
    if (!editState.cityId) {
      setEditDistricts([]);
      setEditNeighborhoods([]);
      return;
    }
    fetchJson<District[]>(`/districts?cityId=${editState.cityId}`, {
      cache: "no-store",
    })
      .then((data) => setEditDistricts(data))
      .catch(() => setEditDistricts([]));
  }, [editState.cityId]);

  useEffect(() => {
    if (!editState.districtId) {
      setEditNeighborhoods([]);
      return;
    }
    fetchJson<Neighborhood[]>(
      `/neighborhoods?districtId=${editState.districtId}`,
      { cache: "no-store" },
    )
      .then((data) => setEditNeighborhoods(data))
      .catch(() => setEditNeighborhoods([]));
  }, [editState.districtId]);

  useEffect(() => {
    if (!editState.category) {
      setEditAttributeDefinitions([]);
      setEditState((prev) => ({ ...prev, attributes: {} }));
      return;
    }
    fetchJson<ListingAttributeDefinition[]>(
      `/listing-attributes?category=${editState.category}`,
      { cache: "no-store" },
    )
      .then((data) => setEditAttributeDefinitions(data))
      .catch(() => setEditAttributeDefinitions([]));
  }, [editState.category]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "cityId"
        ? { districtId: "", neighborhoodId: "" }
        : field === "districtId"
          ? { neighborhoodId: "" }
          : {}),
    }));
  };

  const handleEditChange = (field: string, value: string | boolean) => {
    setEditState((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "cityId"
        ? { districtId: "", neighborhoodId: "" }
        : field === "districtId"
          ? { neighborhoodId: "" }
          : {}),
    }));
  };

  const handleAttributeChange = (
    key: string,
    value: string | boolean | string[],
  ) => {
    setFormState((prev) => ({
      ...prev,
      attributes: {
        ...(prev.attributes ?? {}),
        [key]: value,
      },
    }));
  };

  const handleEditAttributeChange = (
    key: string,
    value: string | boolean | string[],
  ) => {
    setEditState((prev) => ({
      ...prev,
      attributes: {
        ...(prev.attributes ?? {}),
        [key]: value,
      },
    }));
  };

  const loadListingForEdit = async (id: string) => {
    setEditError("");
    setImageError("");
    setEditStatus("loading");
    try {
      const listing = await fetchJson<ListingDetail>(`/listings/${id}`, {
        cache: "no-store",
      });
      setEditId(id);
      setEditImages(listing.images ?? []);
      setSetFirstAsCover(false);
      setImageFiles([]);
      setFileInputKey((prev) => prev + 1);
      setEditState({
        title: listing.title ?? "",
        description: listing.description ?? "",
        status: listing.status ?? "FOR_SALE",
        category: listing.category ?? "HOUSING",
        price: listing.price ? String(listing.price) : "",
        propertyType: listing.propertyType ?? "",
        areaGross: listing.areaGross ? String(listing.areaGross) : "",
        areaNet: listing.areaNet ? String(listing.areaNet) : "",
        isOpportunity: Boolean(listing.isOpportunity),
        cityId: listing.cityId ?? "",
        districtId: listing.districtId ?? "",
        neighborhoodId: listing.neighborhoodId ?? "",
        branchId: listing.branchId ?? "",
        attributes: (listing.attributes ?? {}) as Record<string, string | boolean>,
      });
    } catch (error) {
      setEditError("İlan bilgileri alınamadı.");
    } finally {
      setEditStatus("idle");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setFormError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    if (!formState.cityId || !formState.branchId) {
      setFormError("Şehir ve şube seçimi zorunludur.");
      return;
    }

    setSubmitState("saving");
    try {
      const payload = {
        title: formState.title,
        description: formState.description,
        status: formState.status,
        category: formState.category,
        propertyType: formState.propertyType || undefined,
        price: formState.price ? Number(formState.price) : undefined,
        areaGross: formState.areaGross ? Number(formState.areaGross) : undefined,
        areaNet: formState.areaNet ? Number(formState.areaNet) : undefined,
        currency: "TRY",
        isOpportunity: formState.isOpportunity,
        cityId: formState.cityId,
        districtId: formState.districtId || undefined,
        neighborhoodId: formState.neighborhoodId || undefined,
        branchId: formState.branchId,
        attributes: formState.attributes ?? {},
      };

      const response = await fetch(`${API_BASE_URL}/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Listeleme kaydedilemedi.");
      }

      setFormState({
        title: "",
        description: "",
        status: "FOR_SALE",
        category: "HOUSING",
        price: "",
        propertyType: "",
        areaGross: "",
        areaNet: "",
        isOpportunity: false,
        cityId: "",
        districtId: "",
        neighborhoodId: "",
        branchId: "",
        attributes: {},
      });
      await loadData();
    } catch (error) {
      setFormError("İlan kaydı başarısız. Bilgileri kontrol edin.");
    } finally {
      setSubmitState("idle");
    }
  };

  const resetEditState = () => {
    setEditId(null);
    setEditError("");
    setEditStatus("idle");
    setEditImages([]);
    setImageError("");
    setImageStatus("idle");
    setImageUrl("");
    setImageFiles([]);
    setSetFirstAsCover(false);
    setFileInputKey((prev) => prev + 1);
    setEditState({
      title: "",
      description: "",
      status: "FOR_SALE",
      category: "HOUSING",
      price: "",
      propertyType: "",
        areaGross: "",
        areaNet: "",
      isOpportunity: false,
      cityId: "",
      districtId: "",
      neighborhoodId: "",
      branchId: "",
        attributes: {},
    });
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError("");

    const token = localStorage.getItem("auth_token");
    if (!token || !editId) {
      setEditError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    if (!editState.cityId || !editState.branchId) {
      setEditError("Şehir ve şube seçimi zorunludur.");
      return;
    }

    setEditStatus("saving");
    try {
      const payload = {
        title: editState.title,
        description: editState.description,
        status: editState.status,
        category: editState.category,
        propertyType: editState.propertyType || undefined,
        price: editState.price ? Number(editState.price) : undefined,
        areaGross: editState.areaGross ? Number(editState.areaGross) : undefined,
        areaNet: editState.areaNet ? Number(editState.areaNet) : undefined,
        currency: "TRY",
        isOpportunity: editState.isOpportunity,
        cityId: editState.cityId,
        districtId: editState.districtId || undefined,
        neighborhoodId: editState.neighborhoodId || undefined,
        branchId: editState.branchId,
        attributes: editState.attributes ?? {},
      };

      const response = await fetch(`${API_BASE_URL}/listings/${editId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("İlan güncellenemedi.");
      }

      resetEditState();
      await loadData();
    } catch (error) {
      setEditError("İlan güncelleme başarısız.");
    } finally {
      setEditStatus("idle");
    }
  };

  const handleAddImage = async () => {
    setImageError("");

    const token = localStorage.getItem("auth_token");
    if (!token || !editId) {
      setImageError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    if (!imageUrl.trim()) {
      setImageError("Görsel URL zorunludur.");
      return;
    }

    setImageStatus("saving");
    try {
      const response = await fetch(`${API_BASE_URL}/listings/${editId}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Görsel eklenemedi.");
      }

      setImageUrl("");
      await loadListingForEdit(editId);
    } catch (error) {
      setImageError("Görsel ekleme başarısız.");
    } finally {
      setImageStatus("idle");
    }
  };

  const handleSetCover = async (imageId: string) => {
    setImageError("");

    const token = localStorage.getItem("auth_token");
    if (!token || !editId) {
      setImageError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/listings/${editId}/images/${imageId}/cover`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Kapak görseli güncellenemedi.");
      }

      await loadListingForEdit(editId);
    } catch (error) {
      setImageError("Kapak görseli güncellenemedi.");
    }
  };

  const handleUploadFile = async () => {
    setImageError("");

    const token = localStorage.getItem("auth_token");
    if (!token || !editId) {
      setImageError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    if (imageFiles.length === 0) {
      setImageError("En az bir dosya seçmelisiniz.");
      return;
    }

    setImageStatus("saving");
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("setFirstAsCover", String(setFirstAsCover));

      const response = await fetch(`${API_BASE_URL}/listings/${editId}/images/upload-many`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Görsel yüklenemedi.");
      }

      setImageFiles([]);
      setSetFirstAsCover(false);
      setFileInputKey((prev) => prev + 1);
      await loadListingForEdit(editId);
    } catch (error) {
      setImageError("Görsel yükleme başarısız.");
    } finally {
      setImageStatus("idle");
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    setImageError("");

    const token = localStorage.getItem("auth_token");
    if (!token || !editId) {
      setImageError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/listings/${editId}/images/${imageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Görsel silinemedi.");
      }

      await loadListingForEdit(editId);
    } catch (error) {
      setImageError("Görsel silme başarısız.");
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setFormError("Bu işlem için giriş yapmanız gerekiyor.");
      return;
    }

    const shouldDelete = window.confirm("Bu ilanı silmek istediğinize emin misiniz?");
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("İlan silinemedi.");
      }

      if (editId === id) {
        resetEditState();
      }
      await loadData();
    } catch (error) {
      setFormError("İlan silme başarısız.");
    }
  };

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">İlan Yönetimi</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Link className="btn btn-outline" href="/admin">
            Yönetim Paneli
          </Link>
          <button className="btn btn-outline" onClick={loadData}>
            Yenile
          </button>
        </div>

        {!isReady ? (
          <div className="card">
            <div className="card-body">Kontrol ediliyor...</div>
          </div>
        ) : null}
        {isReady && !isAuthed ? (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">
              Bu sayfayı kullanmak için giriş yapın.{" "}
              <Link href="/admin/login" className="btn btn-outline">
                Giriş Yap
              </Link>
            </div>
          </div>
        ) : null}

        <div className="layout-grid">
          <aside className="sidebar">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Yeni İlan</div>
            <form style={{ display: "grid", gap: 10 }} onSubmit={handleSubmit}>
              <fieldset
                disabled={!isAuthed}
                style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 10 }}
              >
                <input
                  className="search-input"
                  placeholder="Başlık"
                  value={formState.title}
                  onChange={(event) => handleChange("title", event.target.value)}
                  minLength={3}
                  required
                />
                <textarea
                  className="search-input"
                  placeholder="Açıklama"
                  value={formState.description}
                  onChange={(event) =>
                    handleChange("description", event.target.value)
                  }
                  minLength={10}
                  rows={4}
                  required
                />
                <select
                  className="search-input"
                  value={formState.status}
                  onChange={(event) => handleChange("status", event.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                  placeholder="Fiyat (TL)"
                  type="number"
                  value={formState.price}
                  onChange={(event) => handleChange("price", event.target.value)}
                />
                <input
                  className="search-input"
                  placeholder="Brüt m²"
                  type="number"
                  value={formState.areaGross}
                  onChange={(event) => handleChange("areaGross", event.target.value)}
                />
                <input
                  className="search-input"
                  placeholder="Net m²"
                  type="number"
                  value={formState.areaNet}
                  onChange={(event) => handleChange("areaNet", event.target.value)}
                />
                <input
                  className="search-input"
                  placeholder="Emlak Tipi (Daire, Dükkan...)"
                  value={formState.propertyType}
                  onChange={(event) =>
                    handleChange("propertyType", event.target.value)
                  }
                />
                {attributeDefinitions.length > 0 ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ fontWeight: 600 }}>Özellikler</div>
                    {attributeDefinitions.map((def) => (
                      <div key={def.id}>
                        {renderAttributeField(
                          def,
                          formState.attributes?.[def.key],
                          (next) => handleAttributeChange(def.key, next),
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
                <select
                  className="search-input"
                  value={formState.cityId}
                  onChange={(event) => handleChange("cityId", event.target.value)}
                  required
                >
                  <option value="">Şehir seçin</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <select
                  className="search-input"
                  value={formState.districtId}
                  onChange={(event) => handleChange("districtId", event.target.value)}
                  disabled={!formState.cityId}
                >
                  <option value="">İlçe seçin</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                <select
                  className="search-input"
                  value={formState.neighborhoodId}
                  onChange={(event) =>
                    handleChange("neighborhoodId", event.target.value)
                  }
                  disabled={!formState.districtId}
                >
                  <option value="">Mahalle seçin</option>
                  {neighborhoods.map((neighborhood) => (
                    <option key={neighborhood.id} value={neighborhood.id}>
                      {neighborhood.name}
                    </option>
                  ))}
                </select>
                <select
                  className="search-input"
                  value={formState.branchId}
                  onChange={(event) =>
                    handleChange("branchId", event.target.value)
                  }
                  required
                >
                  <option value="">Şube seçin</option>
                  {availableBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={formState.isOpportunity}
                    onChange={(event) =>
                      handleChange("isOpportunity", event.target.checked)
                    }
                  />
                  Fırsat ilanı
                </label>
              </fieldset>
              {formError ? (
                <div style={{ color: "var(--color-accent)", fontSize: 12 }}>
                  {formError}
                </div>
              ) : null}
              <button className="btn" disabled={submitState === "saving" || !isAuthed}>
                {submitState === "saving" ? "Kaydediliyor..." : "İlan Kaydet"}
              </button>
            </form>

            {editId ? (
              <>
                <div
                  style={{ fontWeight: 700, margin: "20px 0 12px" }}
                >
                  İlan Düzenle
                </div>
                <form style={{ display: "grid", gap: 10 }} onSubmit={handleUpdate}>
                  <fieldset
                    disabled={!isAuthed || editStatus === "loading"}
                    style={{
                      border: 0,
                      padding: 0,
                      margin: 0,
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <input
                      className="search-input"
                      placeholder="Başlık"
                      value={editState.title}
                      onChange={(event) => handleEditChange("title", event.target.value)}
                      minLength={3}
                      required
                    />
                    <textarea
                      className="search-input"
                      placeholder="Açıklama"
                      value={editState.description}
                      onChange={(event) =>
                        handleEditChange("description", event.target.value)
                      }
                      minLength={10}
                      rows={4}
                      required
                    />
                    <select
                      className="search-input"
                      value={editState.status}
                      onChange={(event) => handleEditChange("status", event.target.value)}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <select
                      className="search-input"
                      value={editState.category}
                      onChange={(event) => handleEditChange("category", event.target.value)}
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className="search-input"
                      placeholder="Fiyat (TL)"
                      type="number"
                      value={editState.price}
                      onChange={(event) => handleEditChange("price", event.target.value)}
                    />
                    <input
                      className="search-input"
                      placeholder="Brüt m²"
                      type="number"
                      value={editState.areaGross}
                      onChange={(event) =>
                        handleEditChange("areaGross", event.target.value)
                      }
                    />
                    <input
                      className="search-input"
                      placeholder="Net m²"
                      type="number"
                      value={editState.areaNet}
                      onChange={(event) =>
                        handleEditChange("areaNet", event.target.value)
                      }
                    />
                    <input
                      className="search-input"
                      placeholder="Emlak Tipi (Daire, Dükkan...)"
                      value={editState.propertyType}
                      onChange={(event) =>
                        handleEditChange("propertyType", event.target.value)
                      }
                    />
                    {editAttributeDefinitions.length > 0 ? (
                      <div style={{ display: "grid", gap: 10 }}>
                        <div style={{ fontWeight: 600 }}>Özellikler</div>
                        {editAttributeDefinitions.map((def) => (
                          <div key={def.id}>
                            {renderAttributeField(
                              def,
                              editState.attributes?.[def.key],
                              (next) => handleEditAttributeChange(def.key, next),
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <select
                      className="search-input"
                      value={editState.cityId}
                      onChange={(event) => handleEditChange("cityId", event.target.value)}
                      required
                    >
                      <option value="">Şehir seçin</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="search-input"
                      value={editState.districtId}
                      onChange={(event) =>
                        handleEditChange("districtId", event.target.value)
                      }
                      disabled={!editState.cityId}
                    >
                      <option value="">İlçe seçin</option>
                      {editDistricts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="search-input"
                      value={editState.neighborhoodId}
                      onChange={(event) =>
                        handleEditChange("neighborhoodId", event.target.value)
                      }
                      disabled={!editState.districtId}
                    >
                      <option value="">Mahalle seçin</option>
                      {editNeighborhoods.map((neighborhood) => (
                        <option key={neighborhood.id} value={neighborhood.id}>
                          {neighborhood.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="search-input"
                      value={editState.branchId}
                      onChange={(event) =>
                        handleEditChange("branchId", event.target.value)
                      }
                      required
                    >
                      <option value="">Şube seçin</option>
                      {availableEditBranches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={editState.isOpportunity}
                        onChange={(event) =>
                          handleEditChange("isOpportunity", event.target.checked)
                        }
                      />
                      Fırsat ilanı
                    </label>
                  </fieldset>
                  {editError ? (
                    <div style={{ color: "var(--color-accent)", fontSize: 12 }}>
                      {editError}
                    </div>
                  ) : null}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn"
                      disabled={editStatus !== "idle" || !isAuthed}
                    >
                      {editStatus === "saving" ? "Güncelleniyor..." : "Güncelle"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={resetEditState}
                    >
                      Vazgeç
                    </button>
                  </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>
                    İlan Görselleri
                  </div>
                  {editImages.length === 0 ? (
                    <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                      Henüz görsel yok.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                      {editImages.map((image) => (
                        <div
                          key={image.id}
                          style={{
                            border: "1px solid var(--color-border)",
                            borderRadius: 8,
                            padding: 8,
                            display: "grid",
                            gap: 6,
                          }}
                        >
                          <div style={{ fontSize: 12, wordBreak: "break-all" }}>
                            {image.url}
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {image.isCover ? (
                              <span className="badge sale">Kapak</span>
                            ) : null}
                            <button
                              type="button"
                              className="btn btn-outline"
                              disabled={!isAuthed || Boolean(image.isCover)}
                              onClick={() => handleSetCover(image.id)}
                            >
                              Kapak Yap
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline"
                              disabled={!isAuthed}
                              onClick={() => handleRemoveImage(image.id)}
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                    <input
                      className="search-input"
                      placeholder="Yeni görsel URL"
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                      disabled={!isAuthed}
                    />
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleAddImage}
                      disabled={!isAuthed || imageStatus === "saving"}
                    >
                      {imageStatus === "saving" ? "Ekleniyor..." : "Görsel Ekle"}
                    </button>
                    <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 8 }} />
                    <input
                      key={fileInputKey}
                      className="search-input"
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={!isAuthed}
                      onChange={(event) => {
                        const files = event.target.files
                          ? Array.from(event.target.files)
                          : [];
                        setImageFiles(files);
                      }}
                    />
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={setFirstAsCover}
                        onChange={(event) => setSetFirstAsCover(event.target.checked)}
                        disabled={!isAuthed}
                      />
                      İlk dosyayı kapak yap
                    </label>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleUploadFile}
                      disabled={!isAuthed || imageStatus === "saving"}
                    >
                      {imageStatus === "saving" ? "Yükleniyor..." : "Dosya Yükle"}
                    </button>
                    {imageError ? (
                      <div style={{ color: "var(--color-accent)", fontSize: 12 }}>
                        {imageError}
                      </div>
                    ) : null}
                  </div>
                </div>
                </form>
              </>
            ) : null}
          </aside>

          <section>
            <div className="card">
              <div className="card-body">
                <div style={{ fontWeight: 700, marginBottom: 12 }}>
                  Mevcut İlanlar
                </div>
                {isLoading ? <div>Yükleniyor...</div> : null}
                {!isLoading && listings.length === 0 ? (
                  <div>Henüz ilan yok.</div>
                ) : null}
                <div style={{ display: "grid", gap: 12 }}>
                  {listings.map((listing) => (
                    <div key={listing.id} className="card">
                      <div className="card-body">
                        <span className={`badge ${getStatusClass(listing.status)}`}>
                          {getStatusLabel(listing.status)}
                        </span>
                        <div style={{ fontWeight: 700, marginTop: 6 }}>
                          {listing.title}
                        </div>
                        <div style={{ color: "var(--color-muted)", marginTop: 4 }}>
                          {listing.city?.name ?? "Türkiye"} ·{" "}
                          {formatPrice(listing.price)}
                        </div>
                        <div style={{ color: "var(--color-muted)", marginTop: 2 }}>
                          {listing.branch?.name ?? "Şube belirtilmedi"}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <Link
                            className="btn btn-outline"
                            href={`/listings/${listing.id}`}
                          >
                            Görüntüle
                          </Link>
                          <button
                            className="btn btn-outline"
                            onClick={() => loadListingForEdit(listing.id)}
                            disabled={!isAuthed}
                          >
                            Düzenle
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleDelete(listing.id)}
                            disabled={!isAuthed}
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
