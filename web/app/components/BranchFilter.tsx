"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdvancedFilter from "./AdvancedFilter";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Filtre tipleri
type ListingStatus = "FOR_SALE" | "FOR_RENT";
type Category = "HOUSING" | "LAND" | "COMMERCIAL" | "FIELD" | "GARDEN";

interface FilterState {
  status: ListingStatus | null;
  category: Category | null;
  subPropertyType: string | null;
  roomCount: string[];
  buildingAge: string | null;
  floor: string | null;
  totalFloors: string | null;
  landType: string | null;
  paymentType: string | null;
  gardenType: string | null;
  waterType: string | null;
  fieldType: string | null;
  districtId: string | null;
  neighborhoods: string[];
  includeNeighbors: boolean;
  neighborDistance: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface District {
  id: string;
  name: string;
  slug: string;
}

interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  districtId: string;
  district?: { id: string; name: string };
}

interface BranchFilterProps {
  branchSlug: string;
  branchId?: string;
  cityId?: string;
  districtId?: string; // Şube ilçe bazlıysa
  onFilterChange: (filters: Record<string, string | string[]>) => void;
  settings?: {
    buttonBgColor?: string;
    buttonTextColor?: string;
    buttonBorderRadius?: number;
    activeButtonBgColor?: string;
  };
}

// Sabit veriler
const SALE_CATEGORIES = [
  { key: "HOUSING", label: "Konut", icon: "fa-house" },
  { key: "LAND", label: "Arsa", icon: "fa-mountain-sun" },
  { key: "COMMERCIAL", label: "Ticari", icon: "fa-store" },
  { key: "FIELD", label: "Tarla", icon: "fa-wheat-awn" },
  { key: "GARDEN", label: "Bahçe", icon: "fa-tree" },
];

const RENT_CATEGORIES = [
  { key: "HOUSING", label: "Konut", icon: "fa-house" },
  { key: "COMMERCIAL", label: "Ticari", icon: "fa-store" },
];

const ROOM_COUNTS = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "6+"];

const BUILDING_AGES = [
  { key: "0-5", label: "0-5 Yıl" },
  { key: "5-10", label: "5-10 Yıl" },
  { key: "10-20", label: "10-20 Yıl" },
  { key: "20+", label: "20+ Yıl" },
];

const COMMERCIAL_TYPES = [
  { key: "DUKKAN", label: "Dükkan" },
  { key: "OFIS", label: "Ofis" },
  { key: "DEPO", label: "Depo" },
  { key: "SANAYI_DUKKANI", label: "Sanayi Dükkanı" },
  { key: "OTEL", label: "Otel" },
  { key: "FABRIKA", label: "Fabrika" },
  { key: "DIGER", label: "Diğer" },
];

const LAND_TYPES = [
  { key: "KONUT_ARSASI", label: "Konut Arsası" },
  { key: "TICARI_ARSA", label: "Ticari Arsa" },
  { key: "TICARI_KONUT_ARSASI", label: "Ticari-Konut" },
  { key: "SANAYI_ARSASI", label: "Sanayi Arsası" },
  { key: "TURIZM_ARSASI", label: "Turizm Arsası" },
  { key: "AVM_ARSASI", label: "AVM Arsası" },
];

const GARDEN_TYPES = [
  { key: "ELMA", label: "Elma Bahçesi" },
  { key: "CEVIZ", label: "Ceviz Bahçesi" },
  { key: "ZEYTIN", label: "Zeytin Bahçesi" },
  { key: "BADEM", label: "Badem Bahçesi" },
  { key: "ERIK", label: "Erik Bahçesi" },
  { key: "KIRAZ", label: "Kiraz Bahçesi" },
  { key: "UZUM", label: "Üzüm Bağı" },
  { key: "KARISIK", label: "Meyve Bahçesi (Karışık)" },
  { key: "DIGER", label: "Diğer" },
];

const FIELD_TYPES = [
  { key: "SULU", label: "Sulu" },
  { key: "KIRAC", label: "Kıraç" },
  { key: "VERIMLI", label: "Verimli" },
  { key: "TASLIK", label: "Taşlık" },
  { key: "MARJINAL", label: "Marjinal" },
];

const SORT_OPTIONS = [
  { key: "createdAt-desc", label: "En Yeni" },
  { key: "createdAt-asc", label: "En Eski" },
  { key: "price-asc", label: "Fiyat (Artan)" },
  { key: "price-desc", label: "Fiyat (Azalan)" },
  { key: "areaGross-desc", label: "m² (Büyükten Küçüğe)" },
  { key: "areaGross-asc", label: "m² (Küçükten Büyüğe)" },
];

const NEIGHBOR_DISTANCES = [
  { value: 3, label: "3 km" },
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 15, label: "15 km" },
];

// Alt filtreleri temizle
const clearSubFilters = (): Partial<FilterState> => ({
  subPropertyType: null,
  roomCount: [],
  buildingAge: null,
  floor: null,
  totalFloors: null,
  landType: null,
  paymentType: null,
  gardenType: null,
  waterType: null,
  fieldType: null,
});

export default function BranchFilter({
  branchSlug,
  branchId,
  cityId,
  districtId: branchDistrictId,
  onFilterChange,
  settings,
}: BranchFilterProps) {
  const router = useRouter();
  
  const [filters, setFilters] = useState<FilterState>({
    status: null,
    category: null,
    subPropertyType: null,
    roomCount: [],
    buildingAge: null,
    floor: null,
    totalFloors: null,
    landType: null,
    paymentType: null,
    gardenType: null,
    waterType: null,
    fieldType: null,
    districtId: branchDistrictId || null,
    neighborhoods: [],
    includeNeighbors: false,
    neighborDistance: 3,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState("");
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  // Stil değişkenleri
  const btnStyle = {
    backgroundColor: settings?.buttonBgColor || "#f1f5f9",
    color: settings?.buttonTextColor || "#334155",
    borderRadius: settings?.buttonBorderRadius || 8,
  };

  const activeBtnStyle = {
    ...btnStyle,
    backgroundColor: settings?.activeButtonBgColor || "#0a4ea3",
    color: "#ffffff",
  };

  // İlçeleri yükle (şube şehir bazlıysa)
  useEffect(() => {
    if (cityId && !branchDistrictId) {
      fetch(`${API_BASE_URL}/districts?cityId=${cityId}`)
        .then((res) => res.json())
        .then((data) => setDistricts(Array.isArray(data) ? data : []))
        .catch(() => setDistricts([]));
    }
  }, [cityId, branchDistrictId]);

  // Mahalleleri yükle
  const loadNeighborhoods = useCallback(async () => {
    if (!branchId && !cityId) return;

    setLoadingNeighborhoods(true);
    try {
      // Önce şubenin mahallelerini dene
      if (branchId) {
        const res = await fetch(`${API_BASE_URL}/branches/${branchId}/neighborhoods`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setNeighborhoods(data);
          setLoadingNeighborhoods(false);
          return;
        }
      }

      // Yoksa şehir/ilçe bazlı yükle
      const districtToUse = filters.districtId || branchDistrictId;
      const url = districtToUse
        ? `${API_BASE_URL}/neighborhoods?districtId=${districtToUse}`
        : cityId
        ? `${API_BASE_URL}/neighborhoods?cityId=${cityId}`
        : "";

      if (url) {
        const res = await fetch(url);
        const data = await res.json();
        setNeighborhoods(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Neighborhoods load error:", error);
      setNeighborhoods([]);
    } finally {
      setLoadingNeighborhoods(false);
    }
  }, [branchId, cityId, branchDistrictId, filters.districtId]);

  useEffect(() => {
    loadNeighborhoods();
  }, [loadNeighborhoods]);

  // Filtre değişikliğini üst komponente bildir
  useEffect(() => {
    const apiFilters: Record<string, string | string[]> = {
      branchSlug,
    };

    if (filters.status) apiFilters.status = filters.status;
    if (filters.category) apiFilters.category = filters.category;
    if (filters.subPropertyType) apiFilters.subPropertyType = filters.subPropertyType;
    if (filters.roomCount.length > 0) apiFilters.roomCount = filters.roomCount;
    if (filters.buildingAge) apiFilters.buildingAge = filters.buildingAge;
    if (filters.landType) apiFilters.landType = filters.landType;
    if (filters.gardenType) apiFilters.gardenType = filters.gardenType;
    if (filters.fieldType) apiFilters.fieldType = filters.fieldType;
    if (filters.paymentType) apiFilters.paymentType = filters.paymentType;
    if (filters.waterType) apiFilters.waterType = filters.waterType;
    if (filters.districtId) apiFilters.districtId = filters.districtId;
    if (filters.neighborhoods.length > 0) {
      apiFilters.neighborhoodIds = filters.neighborhoods;
      if (filters.includeNeighbors) {
        apiFilters.includeNeighbors = "true";
        apiFilters.maxNeighborDistance = filters.neighborDistance.toString();
      }
    }

    apiFilters.sort = filters.sortBy;
    apiFilters.order = filters.sortOrder;

    onFilterChange(apiFilters);
  }, [filters, branchSlug, onFilterChange]);

  // Arama işlemi
  const handleSearch = useCallback(async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setIsSearching(true);
    try {
      // İlan no formatı kontrolü (5 haneli numara)
      if (/^\d{5}$/.test(trimmed)) {
        // İlan no ile arama - direkt API'den sonuç al
        const res = await fetch(`${API_BASE_URL}/listings/search?branchSlug=${branchSlug}&q=${trimmed}`);
        const data = await res.json();

        if (data.isListingNoSearch && data.items?.length > 0) {
          const listing = data.items[0];
          // Farklı şubedeyse yönlendir
          if (data.branchSlug !== branchSlug) {
            router.push(`/subeler/${data.branchSlug}?listingNo=${trimmed}`);
          } else {
            // Aynı şubede, ilana git
            router.push(`/ilan/${listing.slug || listing.id}`);
          }
          return;
        }
      }

      // Normal arama - filtrelere ekle
      onFilterChange({
        branchSlug,
        q: trimmed,
        sort: filters.sortBy,
        order: filters.sortOrder,
      });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, branchSlug, filters.sortBy, filters.sortOrder, onFilterChange, router]);

  // Seçimleri sıfırla
  const resetFilters = () => {
    setFilters({
      status: null,
      category: null,
      subPropertyType: null,
      roomCount: [],
      buildingAge: null,
      floor: null,
      totalFloors: null,
      landType: null,
      paymentType: null,
      gardenType: null,
      waterType: null,
      fieldType: null,
      districtId: branchDistrictId || null,
      neighborhoods: [],
      includeNeighbors: false,
      neighborDistance: 3,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setSearchQuery("");
  };

  // Status değiştir (alt filtreleri temizle)
  const handleStatusChange = (status: ListingStatus) => {
    setFilters((prev) => ({
      ...prev,
      ...clearSubFilters(),
      status,
      category: null,
    }));
  };

  // Kategori değiştir (alt filtreleri temizle)
  const handleCategoryChange = (category: Category) => {
    setFilters((prev) => ({
      ...prev,
      ...clearSubFilters(),
      category,
    }));
  };

  // Oda sayısı toggle
  const toggleRoomCount = (room: string) => {
    setFilters((prev) => ({
      ...prev,
      roomCount: prev.roomCount.includes(room)
        ? prev.roomCount.filter((r) => r !== room)
        : [...prev.roomCount, room],
    }));
  };

  // Mahalle toggle
  const toggleNeighborhood = (id: string) => {
    setFilters((prev) => ({
      ...prev,
      neighborhoods: prev.neighborhoods.includes(id)
        ? prev.neighborhoods.filter((n) => n !== id)
        : [...prev.neighborhoods, id],
    }));
  };

  // Tüm mahalleleri seç/kaldır
  const toggleAllNeighborhoods = () => {
    const filteredNeighborhoods = neighborhoods.filter((n) =>
      n.name.toLowerCase().includes(neighborhoodSearch.toLowerCase())
    );

    const allSelected = filteredNeighborhoods.every((n) => filters.neighborhoods.includes(n.id));

    if (allSelected) {
      setFilters((prev) => ({
        ...prev,
        neighborhoods: prev.neighborhoods.filter(
          (id) => !filteredNeighborhoods.some((n) => n.id === id)
        ),
      }));
    } else {
      const newIds = filteredNeighborhoods.map((n) => n.id);
      setFilters((prev) => ({
        ...prev,
        neighborhoods: [...new Set([...prev.neighborhoods, ...newIds])],
      }));
    }
  };

  // Aktif filtreleri göster
  const getActiveFilters = useMemo(() => {
    const active: { key: string; label: string }[] = [];

    if (filters.status) {
      active.push({ key: "status", label: filters.status === "FOR_SALE" ? "Satılık" : "Kiralık" });
    }
    if (filters.category) {
      const cat = [...SALE_CATEGORIES, ...RENT_CATEGORIES].find((c) => c.key === filters.category);
      if (cat) active.push({ key: "category", label: cat.label });
    }
    if (filters.subPropertyType) {
      const com = COMMERCIAL_TYPES.find((c) => c.key === filters.subPropertyType);
      active.push({ key: "subPropertyType", label: com?.label || filters.subPropertyType });
    }
    if (filters.roomCount.length > 0) {
      active.push({ key: "roomCount", label: `Oda: ${filters.roomCount.join(", ")}` });
    }
    if (filters.buildingAge) {
      const age = BUILDING_AGES.find((a) => a.key === filters.buildingAge);
      if (age) active.push({ key: "buildingAge", label: `Bina Yaşı: ${age.label}` });
    }
    if (filters.landType) {
      const land = LAND_TYPES.find((l) => l.key === filters.landType);
      if (land) active.push({ key: "landType", label: land.label });
    }
    if (filters.gardenType) {
      const garden = GARDEN_TYPES.find((g) => g.key === filters.gardenType);
      if (garden) active.push({ key: "gardenType", label: garden.label });
    }
    if (filters.fieldType) {
      const field = FIELD_TYPES.find((f) => f.key === filters.fieldType);
      if (field) active.push({ key: "fieldType", label: field.label });
    }
    if (filters.paymentType) {
      active.push({ key: "paymentType", label: filters.paymentType === "KAT_KARSILIGI" ? "Kat Karşılığı" : "Nakit" });
    }
    if (filters.waterType) {
      active.push({ key: "waterType", label: filters.waterType === "SULU" ? "Sulu" : "Susuz" });
    }
    if (filters.districtId && !branchDistrictId) {
      const district = districts.find((d) => d.id === filters.districtId);
      if (district) active.push({ key: "districtId", label: `İlçe: ${district.name}` });
    }
    if (filters.neighborhoods.length > 0) {
      const selectedNames = neighborhoods
        .filter((n) => filters.neighborhoods.includes(n.id))
        .map((n) => n.name)
        .slice(0, 3);
      const more = filters.neighborhoods.length > 3 ? ` +${filters.neighborhoods.length - 3}` : "";
      active.push({ key: "neighborhoods", label: `Mahalle: ${selectedNames.join(", ")}${more}` });
    }
    if (filters.includeNeighbors && filters.neighborhoods.length > 0) {
      active.push({ key: "includeNeighbors", label: `+${filters.neighborDistance}km komşu` });
    }

    return active;
  }, [filters, districts, neighborhoods, branchDistrictId]);

  const removeFilter = (key: string) => {
    if (key === "status") {
      setFilters((prev) => ({ ...prev, ...clearSubFilters(), status: null, category: null }));
    } else if (key === "category") {
      setFilters((prev) => ({ ...prev, ...clearSubFilters(), category: null }));
    } else if (key === "roomCount") {
      setFilters((prev) => ({ ...prev, roomCount: [] }));
    } else if (key === "neighborhoods") {
      setFilters((prev) => ({ ...prev, neighborhoods: [], includeNeighbors: false }));
    } else if (key === "includeNeighbors") {
      setFilters((prev) => ({ ...prev, includeNeighbors: false }));
    } else if (key === "districtId") {
      setFilters((prev) => ({ ...prev, districtId: null }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: null }));
    }
  };

  const categories = filters.status === "FOR_RENT" ? RENT_CATEGORIES : SALE_CATEGORIES;

  // Filtrelenen mahalleler
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

  return (
    <div className="branch-filter">
      {/* Üst Bar: Arama + Tüm İlanlar + Sıralama */}
      <div className="branch-filter-topbar">
        <button className="branch-filter-all-btn" onClick={resetFilters}>
          <i className="fa-solid fa-list"></i>
          Tüm İlanları Göster
        </button>

        {/* Şube İçi Arama */}
        <div className="branch-filter-search">
          <i className="fa-solid fa-search"></i>
          <input
            type="text"
            placeholder="İlan no veya kelime ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {searchQuery && (
            <button className="branch-filter-search-clear" onClick={() => setSearchQuery("")}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
          <button
            className="branch-filter-search-btn"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? <i className="fa-solid fa-spinner fa-spin"></i> : "Ara"}
          </button>
        </div>

        <div className="branch-filter-sort">
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-");
              setFilters((prev) => ({ ...prev, sortBy, sortOrder: sortOrder as "asc" | "desc" }));
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button className="branch-filter-advanced-btn" onClick={() => setShowAdvanced(true)}>
          <i className="fa-solid fa-sliders"></i>
          Şube İçi Arama
        </button>
      </div>

      {/* Seviye 1: Satılık / Kiralık */}
      <div className="branch-filter-level">
        <button
          className={`branch-filter-btn ${filters.status === "FOR_SALE" ? "active" : ""}`}
          style={filters.status === "FOR_SALE" ? activeBtnStyle : btnStyle}
          onClick={() => handleStatusChange("FOR_SALE")}
        >
          <i className="fa-solid fa-tag"></i>
          Satılık
        </button>
        <button
          className={`branch-filter-btn ${filters.status === "FOR_RENT" ? "active" : ""}`}
          style={filters.status === "FOR_RENT" ? activeBtnStyle : btnStyle}
          onClick={() => handleStatusChange("FOR_RENT")}
        >
          <i className="fa-solid fa-key"></i>
          Kiralık
        </button>
      </div>

      {/* Seviye 2: Kategoriler */}
      {filters.status && (
        <div className="branch-filter-level">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`branch-filter-btn ${filters.category === cat.key ? "active" : ""}`}
              style={filters.category === cat.key ? activeBtnStyle : btnStyle}
              onClick={() => handleCategoryChange(cat.key as Category)}
            >
              <i className={`fa-solid ${cat.icon}`}></i>
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Seviye 3: Alt Filtreler - Konut */}
      {filters.category === "HOUSING" && (
        <div className="branch-filter-subfilters">
          <div className="branch-filter-group">
            <label>Oda Sayısı</label>
            <div className="branch-filter-chips">
              {ROOM_COUNTS.map((room) => (
                <button
                  key={room}
                  className={`branch-filter-chip ${filters.roomCount.includes(room) ? "active" : ""}`}
                  onClick={() => toggleRoomCount(room)}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>

          <div className="branch-filter-group">
            <label>Bina Yaşı</label>
            <div className="branch-filter-chips">
              {BUILDING_AGES.map((age) => (
                <button
                  key={age.key}
                  className={`branch-filter-chip ${filters.buildingAge === age.key ? "active" : ""}`}
                  onClick={() => setFilters((prev) => ({ ...prev, buildingAge: prev.buildingAge === age.key ? null : age.key }))}
                >
                  {age.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Seviye 3: Alt Filtreler - Arsa */}
      {filters.category === "LAND" && (
        <div className="branch-filter-subfilters">
          <div className="branch-filter-group">
            <label>Arsa Tipi</label>
            <div className="branch-filter-chips">
              {LAND_TYPES.map((land) => (
                <button
                  key={land.key}
                  className={`branch-filter-chip ${filters.landType === land.key ? "active" : ""}`}
                  onClick={() => setFilters((prev) => ({ ...prev, landType: prev.landType === land.key ? null : land.key }))}
                >
                  {land.label}
                </button>
              ))}
            </div>
          </div>

          <div className="branch-filter-group">
            <label>Ödeme Tipi</label>
            <div className="branch-filter-chips">
              <button
                className={`branch-filter-chip ${filters.paymentType === "KAT_KARSILIGI" ? "active" : ""}`}
                onClick={() => setFilters((prev) => ({ ...prev, paymentType: prev.paymentType === "KAT_KARSILIGI" ? null : "KAT_KARSILIGI" }))}
              >
                Kat Karşılığı
              </button>
              <button
                className={`branch-filter-chip ${filters.paymentType === "NAKIT" ? "active" : ""}`}
                onClick={() => setFilters((prev) => ({ ...prev, paymentType: prev.paymentType === "NAKIT" ? null : "NAKIT" }))}
              >
                Nakit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seviye 3: Alt Filtreler - Ticari */}
      {filters.category === "COMMERCIAL" && (
        <div className="branch-filter-subfilters">
          <div className="branch-filter-group">
            <label>İşyeri Tipi</label>
            <div className="branch-filter-chips">
              {COMMERCIAL_TYPES.map((com) => (
                <button
                  key={com.key}
                  className={`branch-filter-chip ${filters.subPropertyType === com.key ? "active" : ""}`}
                  onClick={() => setFilters((prev) => ({ ...prev, subPropertyType: prev.subPropertyType === com.key ? null : com.key }))}
                >
                  {com.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Seviye 3: Alt Filtreler - Bahçe */}
      {filters.category === "GARDEN" && (
        <div className="branch-filter-subfilters">
          <div className="branch-filter-group">
            <label>Bahçe Tipi</label>
            <div className="branch-filter-chips">
              {GARDEN_TYPES.map((garden) => (
                <button
                  key={garden.key}
                  className={`branch-filter-chip ${filters.gardenType === garden.key ? "active" : ""}`}
                  onClick={() => setFilters((prev) => ({ ...prev, gardenType: prev.gardenType === garden.key ? null : garden.key }))}
                >
                  {garden.label}
                </button>
              ))}
            </div>
          </div>

          <div className="branch-filter-group">
            <label>Sulama</label>
            <div className="branch-filter-chips">
              <button
                className={`branch-filter-chip ${filters.waterType === "SULU" ? "active" : ""}`}
                onClick={() => setFilters((prev) => ({ ...prev, waterType: prev.waterType === "SULU" ? null : "SULU" }))}
              >
                Sulu
              </button>
              <button
                className={`branch-filter-chip ${filters.waterType === "SUSUZ" ? "active" : ""}`}
                onClick={() => setFilters((prev) => ({ ...prev, waterType: prev.waterType === "SUSUZ" ? null : "SUSUZ" }))}
              >
                Susuz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seviye 3: Alt Filtreler - Tarla */}
      {filters.category === "FIELD" && (
        <div className="branch-filter-subfilters">
          <div className="branch-filter-group">
            <label>Tarla Tipi</label>
            <div className="branch-filter-chips">
              {FIELD_TYPES.map((field) => (
                <button
                  key={field.key}
                  className={`branch-filter-chip ${filters.fieldType === field.key ? "active" : ""}`}
                  onClick={() => setFilters((prev) => ({ ...prev, fieldType: prev.fieldType === field.key ? null : field.key }))}
                >
                  {field.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* İlçe ve Mahalle Seçimi */}
      {filters.category && (
        <div className="branch-filter-location">
          {/* İlçe seçimi (şube şehir bazlıysa) */}
          {!branchDistrictId && districts.length > 0 && (
            <button
              className="branch-filter-location-btn"
              onClick={() => setShowDistricts(true)}
            >
              <i className="fa-solid fa-map-pin"></i>
              İlçe Seç
              {filters.districtId && (
                <span className="branch-filter-location-count">1</span>
              )}
            </button>
          )}

          {/* Mahalle seçimi */}
          {neighborhoods.length > 0 && (
            <button
              className="branch-filter-location-btn branch-filter-neighborhood-btn"
              onClick={() => setShowNeighborhoods(true)}
            >
              <i className="fa-solid fa-map-marker-alt"></i>
              Mahalle Seç
              {filters.neighborhoods.length > 0 && (
                <span className="branch-filter-location-count">{filters.neighborhoods.length}</span>
              )}
            </button>
          )}
        </div>
      )}

      {/* Seçili Filtreler */}
      {getActiveFilters.length > 0 && (
        <div className="branch-filter-active">
          <span className="branch-filter-active-label">Seçili:</span>
          {getActiveFilters.map((filter) => (
            <span key={filter.key} className="branch-filter-active-chip">
              {filter.label}
              <button onClick={() => removeFilter(filter.key)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </span>
          ))}
          <button className="branch-filter-clear-btn" onClick={resetFilters}>
            Temizle
          </button>
        </div>
      )}

      {/* İlçe Seçim Modalı */}
      {showDistricts && (
        <div className="branch-filter-modal-overlay" onClick={() => setShowDistricts(false)}>
          <div className="branch-filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="branch-filter-modal-header">
              <h3>
                <i className="fa-solid fa-map-pin"></i>
                İlçe Seç
              </h3>
              <button onClick={() => setShowDistricts(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="branch-filter-modal-body">
              <div className="branch-filter-chips" style={{ flexWrap: "wrap" }}>
                <button
                  className={`branch-filter-chip ${!filters.districtId ? "active" : ""}`}
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, districtId: null }));
                    setShowDistricts(false);
                  }}
                >
                  Tüm İlçeler
                </button>
                {districts.map((d) => (
                  <button
                    key={d.id}
                    className={`branch-filter-chip ${filters.districtId === d.id ? "active" : ""}`}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, districtId: d.id, neighborhoods: [] }));
                      setShowDistricts(false);
                    }}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mahalle Seçim Modalı */}
      {showNeighborhoods && (
        <div className="branch-filter-modal-overlay" onClick={() => setShowNeighborhoods(false)}>
          <div className="branch-filter-modal branch-filter-neighborhood-modal" onClick={(e) => e.stopPropagation()}>
            <div className="branch-filter-modal-header">
              <h3>
                <i className="fa-solid fa-map-marker-alt"></i>
                Mahalle Seç
                {filters.neighborhoods.length > 0 && (
                  <span style={{ fontSize: 14, fontWeight: 400, color: "#64748b", marginLeft: 8 }}>
                    ({filters.neighborhoods.length} seçili)
                  </span>
                )}
              </h3>
              <button onClick={() => setShowNeighborhoods(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="branch-filter-modal-search">
              <i className="fa-solid fa-search"></i>
              <input
                type="text"
                placeholder="Mahalle ara..."
                value={neighborhoodSearch}
                onChange={(e) => setNeighborhoodSearch(e.target.value)}
              />
              {neighborhoodSearch && (
                <button onClick={() => setNeighborhoodSearch("")}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            <div className="branch-filter-modal-actions">
              <button onClick={toggleAllNeighborhoods}>
                {filteredNeighborhoods.every((n) => filters.neighborhoods.includes(n.id))
                  ? "Tümünü Kaldır"
                  : "Tümünü Seç"}
              </button>
              <button onClick={() => setFilters((prev) => ({ ...prev, neighborhoods: [] }))}>
                Seçimi Temizle
              </button>
            </div>

            {/* Komşu Mahalle Seçeneği */}
            {filters.neighborhoods.length > 0 && (
              <div className="branch-filter-neighbor-option">
                <label>
                  <input
                    type="checkbox"
                    checked={filters.includeNeighbors}
                    onChange={(e) => setFilters((prev) => ({ ...prev, includeNeighbors: e.target.checked }))}
                  />
                  Komşu mahallelerdeki ilanları da göster
                </label>
                {filters.includeNeighbors && (
                  <select
                    value={filters.neighborDistance}
                    onChange={(e) => setFilters((prev) => ({ ...prev, neighborDistance: Number(e.target.value) }))}
                  >
                    {NEIGHBOR_DISTANCES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label} çapında
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="branch-filter-modal-body branch-filter-neighborhood-list">
              {loadingNeighborhoods ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24 }}></i>
                </div>
              ) : Object.keys(groupedNeighborhoods).length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
                  {neighborhoodSearch ? "Arama sonucu bulunamadı" : "Mahalle bulunamadı"}
                </div>
              ) : (
                Object.entries(groupedNeighborhoods).map(([districtName, neighs]) => (
                  <div key={districtName} style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 12, color: "#64748b", marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid #e5e7eb" }}>
                      {districtName} ({neighs.length})
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6 }}>
                      {neighs.map((n) => (
                        <label key={n.id} className="branch-filter-neighborhood-item">
                          <input
                            type="checkbox"
                            checked={filters.neighborhoods.includes(n.id)}
                            onChange={() => toggleNeighborhood(n.id)}
                          />
                          <span>{n.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="branch-filter-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowNeighborhoods(false)}>
                Kapat
              </button>
              <button className="btn btn-primary" onClick={() => setShowNeighborhoods(false)}>
                Uygula ({filters.neighborhoods.length} mahalle)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detaylı Arama Modal */}
      <AdvancedFilter
        isOpen={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        onApply={(advancedFilters) => {
          // AdvancedFilter'dan gelen filtreleri uygula
          const newFilters: Partial<FilterState> = {
            status: advancedFilters.status as ListingStatus || null,
            category: advancedFilters.category as Category || null,
            subPropertyType: advancedFilters.subPropertyType as string || null,
            roomCount: Array.isArray(advancedFilters.roomCount) ? advancedFilters.roomCount as string[] : [],
            buildingAge: advancedFilters.buildingAge as string || null,
            landType: advancedFilters.landType as string || null,
            gardenType: advancedFilters.gardenType as string || null,
            fieldType: advancedFilters.fieldType as string || null,
            paymentType: advancedFilters.paymentType as string || null,
            waterType: advancedFilters.waterType as string || null,
            districtId: advancedFilters.districtId as string || null,
            neighborhoods: Array.isArray(advancedFilters.neighborhoodIds) ? advancedFilters.neighborhoodIds as string[] : [],
            sortBy: advancedFilters.sort as string || "createdAt",
            sortOrder: advancedFilters.order as "asc" | "desc" || "desc",
          };
          setFilters((prev) => ({ ...prev, ...newFilters }));
        }}
        showCityFilter={false} // Şube sayfasında şehir seçimi yok
        branchSlug={branchSlug}
        branchCityId={cityId}
        branchDistrictId={branchDistrictId}
        initialFilters={{
          status: filters.status,
          category: filters.category,
          subPropertyType: filters.subPropertyType,
          roomCount: filters.roomCount,
          buildingAge: filters.buildingAge,
          landType: filters.landType,
          gardenType: filters.gardenType,
          fieldType: filters.fieldType,
          paymentType: filters.paymentType,
          waterType: filters.waterType,
          districtId: filters.districtId,
          neighborhoodIds: filters.neighborhoods,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        }}
      />
    </div>
  );
}
