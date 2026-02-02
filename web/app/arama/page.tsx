"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";
import AdvancedFilter from "../components/AdvancedFilter";
import { getListingFeatures, type ListingForFeatures } from "../../lib/listings";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Fiyat formatlama: 1000000 -> 1.000.000
function formatPriceDisplay(value: string | number): string {
  const num = typeof value === "string" ? value : String(value);
  const numbers = num.replace(/\D/g, "");
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

type Listing = {
  id: string;
  listingNo?: string;
  slug?: string;
  title: string;
  price?: number | string | null;
  currency?: string;
  status: "FOR_SALE" | "FOR_RENT";
  category?: string;
  subPropertyType?: string;
  city?: { name: string } | null;
  district?: { name: string } | null;
  neighborhood?: { name: string } | null;
  branch?: { name: string; slug: string } | null;
  attributes?: Record<string, unknown>;
  areaNet?: number | string | null;
  areaGross?: number | string | null;
  roomCount?: string;
  floor?: string;
  totalFloors?: string;
  buildingAge?: string;
  facade?: string;
  hasGarage?: boolean;
  hasParentBathroom?: boolean;
  hasElevator?: boolean;
  isSiteInside?: boolean;
  furnished?: boolean;
  parkingType?: string;
  isSwapEligible?: boolean;
  shareStatus?: string;
  hasElectricity?: boolean;
  hasRoadAccess?: boolean;
  hasHouse?: boolean;
  waterType?: string;
  isOpportunity?: boolean;
  images?: { url: string; isCover?: boolean }[];
};

type City = {
  id: string;
  name: string;
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
  district?: { name: string };
};

const resolveImageUrl = (url?: string | null) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
};

const formatPrice = (price?: number | string | null, currency?: string) => {
  if (!price) return "Fiyat belirtilmemiş";
  const priceNum = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency || "TRY",
    minimumFractionDigits: 0,
  }).format(priceNum);
};

const getCoverImage = (listing: Listing) => {
  const cover = listing.images?.find((img) => img.isCover);
  return resolveImageUrl(cover?.url || listing.images?.[0]?.url);
};

const getLocationText = (listing: Listing) => {
  const parts = [listing.neighborhood?.name, listing.district?.name, listing.city?.name].filter(Boolean);
  return parts.join(", ") || "Konum belirtilmemiş";
};

// Kategori seçenekleri
const CATEGORIES_SALE = [
  { key: "HOUSING", label: "Konut" },
  { key: "LAND", label: "Arsa" },
  { key: "COMMERCIAL", label: "Ticari" },
  { key: "FIELD", label: "Tarla" },
  { key: "GARDEN", label: "Bahçe" },
];

const CATEGORIES_RENT = [
  { key: "HOUSING", label: "Konut" },
  { key: "COMMERCIAL", label: "Ticari" },
];

const ROOM_COUNTS = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "6+"];

const BUILDING_AGES = [
  { key: "0", label: "Sıfır" },
  { key: "0-5", label: "1-5 Yıl" },
  { key: "5-10", label: "5-10 Yıl" },
  { key: "10-20", label: "10-20 Yıl" },
  { key: "20+", label: "20+ Yıl" },
];

const HEATING_TYPES = [
  { key: "DOGALGAZ_KOMBI", label: "Doğalgaz (Kombi)" },
  { key: "DOGALGAZ_MERKEZI", label: "Doğalgaz (Merkezi)" },
  { key: "SOBA", label: "Soba" },
  { key: "KLIMA", label: "Klima" },
  { key: "YERDEN_ISITMA", label: "Yerden Isıtma" },
  { key: "YOK", label: "Yok" },
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
  { key: "SANAYI_ARSASI", label: "Sanayi Arsası" },
  { key: "TURIZM_ARSASI", label: "Turizm Arsası" },
];

const GARDEN_TYPES = [
  { key: "ELMA", label: "Elma" },
  { key: "CEVIZ", label: "Ceviz" },
  { key: "ZEYTIN", label: "Zeytin" },
  { key: "BADEM", label: "Badem" },
  { key: "KARISIK", label: "Karışık" },
];

const FIELD_TYPES = [
  { key: "SULU", label: "Sulu" },
  { key: "KIRAC", label: "Kıraç" },
  { key: "VERIMLI", label: "Verimli" },
];

const SORT_OPTIONS = [
  { key: "createdAt-desc", label: "En Yeni" },
  { key: "createdAt-asc", label: "En Eski" },
  { key: "price-asc", label: "Fiyat (Artan)" },
  { key: "price-desc", label: "Fiyat (Azalan)" },
  { key: "areaGross-desc", label: "m² (Büyük → Küçük)" },
  { key: "areaGross-asc", label: "m² (Küçük → Büyük)" },
];

function AramaPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // URL'de showFilters=true varsa detaylı arama otomatik açılsın
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(
    searchParams.get("showFilters") === "true"
  );

  // Şehir/İlçe/Mahalle verileri
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

  // URL'den filtreleri al
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    status: searchParams.get("status") || "",
    category: searchParams.get("category") || "",
    subPropertyType: searchParams.get("subPropertyType") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    roomCount: searchParams.get("roomCount")?.split(",") || [],
    buildingAge: searchParams.get("buildingAge") || "",
    floor: searchParams.get("floor") || "",
    heatingType: searchParams.get("heatingType") || "",
    furnished: searchParams.get("furnished") || "",
    landType: searchParams.get("landType") || "",
    gardenType: searchParams.get("gardenType") || "",
    fieldType: searchParams.get("fieldType") || "",
    waterType: searchParams.get("waterType") || "",
    cityId: searchParams.get("cityId") || "",
    districtId: searchParams.get("districtId") || "",
    neighborhoodIds: searchParams.get("neighborhoodIds")?.split(",") || [],
    sort: searchParams.get("sort") || "createdAt",
    order: (searchParams.get("order") as "asc" | "desc") || "desc",
  });

  // Şehirleri yükle
  useEffect(() => {
    fetch(`${API_BASE_URL}/cities`)
      .then((res) => res.json())
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => setCities([]));
  }, []);

  // İlçeleri yükle
  useEffect(() => {
    if (filters.cityId) {
      fetch(`${API_BASE_URL}/districts?cityId=${filters.cityId}`)
        .then((res) => res.json())
        .then((data) => setDistricts(Array.isArray(data) ? data : []))
        .catch(() => setDistricts([]));
    } else {
      setDistricts([]);
    }
  }, [filters.cityId]);

  // Mahalleleri yükle
  useEffect(() => {
    if (filters.districtId) {
      fetch(`${API_BASE_URL}/neighborhoods?districtId=${filters.districtId}`)
        .then((res) => res.json())
        .then((data) => setNeighborhoods(Array.isArray(data) ? data : []))
        .catch(() => setNeighborhoods([]));
    } else {
      setNeighborhoods([]);
    }
  }, [filters.districtId]);

  // İlanları yükle
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.q) params.set("q", filters.q);
    if (filters.status) params.set("status", filters.status);
    if (filters.category) params.set("category", filters.category);
    if (filters.subPropertyType) params.set("subPropertyType", filters.subPropertyType);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.minArea) params.set("minArea", filters.minArea);
    if (filters.maxArea) params.set("maxArea", filters.maxArea);
    if (filters.roomCount.length > 0) params.set("roomCount", filters.roomCount.join(","));
    if (filters.buildingAge) params.set("buildingAge", filters.buildingAge);
    if (filters.floor) params.set("floor", filters.floor);
    if (filters.heatingType) params.set("heatingType", filters.heatingType);
    if (filters.furnished) params.set("furnished", filters.furnished);
    if (filters.landType) params.set("landType", filters.landType);
    if (filters.gardenType) params.set("gardenType", filters.gardenType);
    if (filters.fieldType) params.set("fieldType", filters.fieldType);
    if (filters.waterType) params.set("waterType", filters.waterType);
    if (filters.cityId) params.set("cityId", filters.cityId);
    if (filters.districtId) params.set("districtId", filters.districtId);
    if (filters.neighborhoodIds.length > 0) params.set("neighborhoodId", filters.neighborhoodIds[0]);

    setLoading(true);
    const queryStr = params.toString();
    fetch(`${API_BASE_URL}/listings${queryStr ? `?${queryStr}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setListings(items);
        setTotalCount(items.length);
      })
      .catch(() => {
        setListings([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  // URL'i güncelle
  const updateUrl = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && (typeof value === "string" ? value : value.length > 0)) {
        if (Array.isArray(value)) {
          if (value.length > 0) params.set(key, value.join(","));
        } else {
          params.set(key, value);
        }
      }
    });

    const queryStr = params.toString();
    router.push(`/arama${queryStr ? `?${queryStr}` : ""}`, { scroll: false });
  }, [router]);

  const applyFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    updateUrl(updated);
  };

  const clearAllFilters = () => {
    const cleared = {
      q: "",
      status: "",
      category: "",
      subPropertyType: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      roomCount: [],
      buildingAge: "",
      floor: "",
      heatingType: "",
      furnished: "",
      landType: "",
      gardenType: "",
      fieldType: "",
      waterType: "",
      cityId: "",
      districtId: "",
      neighborhoodIds: [],
      sort: "createdAt",
      order: "desc" as const,
    };
    setFilters(cleared);
    router.push("/arama");
  };

  const toggleRoomCount = (room: string) => {
    const newRooms = filters.roomCount.includes(room)
      ? filters.roomCount.filter((r) => r !== room)
      : [...filters.roomCount, room];
    applyFilters({ roomCount: newRooms });
  };

  // Aktif filtre sayısı
  const activeFilterCount = [
    filters.category,
    filters.subPropertyType,
    filters.minPrice,
    filters.maxPrice,
    filters.minArea,
    filters.maxArea,
    filters.roomCount.length > 0,
    filters.buildingAge,
    filters.floor,
    filters.heatingType,
    filters.furnished,
    filters.landType,
    filters.gardenType,
    filters.fieldType,
    filters.waterType,
    filters.cityId,
    filters.districtId,
    filters.neighborhoodIds.length > 0,
  ].filter(Boolean).length;

  // Mevcut kategoriler
  const categories = filters.status === "FOR_RENT" ? CATEGORIES_RENT : CATEGORIES_SALE;

  // İlanları sırala
  const sortedListings = [...listings].sort((a, b) => {
    const field = filters.sort;
    const order = filters.order === "asc" ? 1 : -1;
    
    if (field === "price") {
      const priceA = typeof a.price === "string" ? parseFloat(a.price) : (a.price || 0);
      const priceB = typeof b.price === "string" ? parseFloat(b.price) : (b.price || 0);
      return (priceA - priceB) * order;
    }
    if (field === "areaGross") {
      const areaA = typeof a.areaGross === "string" ? parseFloat(a.areaGross) : (a.areaGross || 0);
      const areaB = typeof b.areaGross === "string" ? parseFloat(b.areaGross) : (b.areaGross || 0);
      return (areaA - areaB) * order;
    }
    return 0; // createdAt için API'de sıralama yapılıyor
  });

  return (
    <main className="search-page">
      <div className="search-container">
        {/* Header */}
        <div className="search-header">
          <h1>
            <i className="fa-solid fa-search"></i>
            {filters.q ? `"${filters.q}" için arama sonuçları` : "Tüm İlanlar"}
          </h1>
          <p>{totalCount} ilan bulundu</p>
        </div>

        {/* Hızlı Filtreler - Tüm İlanları Göster butonu eklendi */}
        <div className="search-quick-filters">
          {/* Tüm İlanları Göster butonu - arama varsa göster */}
          {(filters.q || activeFilterCount > 0) && (
            <button
              className="search-filter-btn search-show-all-btn"
              onClick={clearAllFilters}
            >
              <i className="fa-solid fa-list"></i>
              Tüm İlanları Göster
            </button>
          )}
          
          <button
            className={`search-filter-btn ${!filters.status ? "active" : ""}`}
            onClick={() => applyFilters({ status: "", category: "", subPropertyType: "" })}
          >
            Tümü
          </button>
          <button
            className={`search-filter-btn ${filters.status === "FOR_SALE" ? "active" : ""}`}
            onClick={() => applyFilters({ status: "FOR_SALE", category: "", subPropertyType: "" })}
          >
            Satılık
          </button>
          <button
            className={`search-filter-btn ${filters.status === "FOR_RENT" ? "active" : ""}`}
            onClick={() => applyFilters({ status: "FOR_RENT", category: "", subPropertyType: "" })}
          >
            Kiralık
          </button>

          {/* Sıralama */}
          <select
            className="search-sort-select"
            value={`${filters.sort}-${filters.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split("-");
              applyFilters({ sort, order: order as "asc" | "desc" });
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>

          {/* Detaylı Arama butonu */}
          <button
            className="search-filter-toggle"
            onClick={() => setShowAdvancedFilter(true)}
          >
            <i className="fa-solid fa-sliders"></i>
            Detaylı Arama
            {activeFilterCount > 0 && (
              <span className="search-filter-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Kategori Seçimi */}
        {filters.status && (
          <div className="search-category-bar">
            {categories.map((cat) => (
              <button
                key={cat.key}
                className={`search-category-btn ${filters.category === cat.key ? "active" : ""}`}
                onClick={() => applyFilters({ category: filters.category === cat.key ? "" : cat.key, subPropertyType: "" })}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Alt Kategori / Konut Özellikleri */}
        {filters.category === "HOUSING" && (
          <div className="search-subfilters">
            <div className="search-subfilter-group">
              <span className="search-subfilter-label">Oda Sayısı:</span>
              <div className="search-subfilter-chips">
                {ROOM_COUNTS.map((room) => (
                  <button
                    key={room}
                    className={`search-chip ${filters.roomCount.includes(room) ? "active" : ""}`}
                    onClick={() => toggleRoomCount(room)}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>
            <div className="search-subfilter-group">
              <span className="search-subfilter-label">Bina Yaşı:</span>
              <div className="search-subfilter-chips">
                {BUILDING_AGES.map((age) => (
                  <button
                    key={age.key}
                    className={`search-chip ${filters.buildingAge === age.key ? "active" : ""}`}
                    onClick={() => applyFilters({ buildingAge: filters.buildingAge === age.key ? "" : age.key })}
                  >
                    {age.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ticari Alt Tipi */}
        {filters.category === "COMMERCIAL" && (
          <div className="search-subfilters">
            <div className="search-subfilter-group">
              <span className="search-subfilter-label">İşyeri Tipi:</span>
              <div className="search-subfilter-chips">
                {COMMERCIAL_TYPES.map((type) => (
                  <button
                    key={type.key}
                    className={`search-chip ${filters.subPropertyType === type.key ? "active" : ""}`}
                    onClick={() => applyFilters({ subPropertyType: filters.subPropertyType === type.key ? "" : type.key })}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Arsa Alt Tipi */}
        {filters.category === "LAND" && (
          <div className="search-subfilters">
            <div className="search-subfilter-group">
              <span className="search-subfilter-label">Arsa Tipi:</span>
              <div className="search-subfilter-chips">
                {LAND_TYPES.map((type) => (
                  <button
                    key={type.key}
                    className={`search-chip ${filters.landType === type.key ? "active" : ""}`}
                    onClick={() => applyFilters({ landType: filters.landType === type.key ? "" : type.key })}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bahçe Alt Tipi */}
        {filters.category === "GARDEN" && (
          <div className="search-subfilters">
            <div className="search-subfilter-group">
              <span className="search-subfilter-label">Bahçe Tipi:</span>
              <div className="search-subfilter-chips">
                {GARDEN_TYPES.map((type) => (
                  <button
                    key={type.key}
                    className={`search-chip ${filters.gardenType === type.key ? "active" : ""}`}
                    onClick={() => applyFilters({ gardenType: filters.gardenType === type.key ? "" : type.key })}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tarla Alt Tipi */}
        {filters.category === "FIELD" && (
          <div className="search-subfilters">
            <div className="search-subfilter-group">
              <span className="search-subfilter-label">Tarla Tipi:</span>
              <div className="search-subfilter-chips">
                {FIELD_TYPES.map((type) => (
                  <button
                    key={type.key}
                    className={`search-chip ${filters.fieldType === type.key ? "active" : ""}`}
                    onClick={() => applyFilters({ fieldType: filters.fieldType === type.key ? "" : type.key })}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Aktif Filtreler */}
        {activeFilterCount > 0 && (
          <div className="search-active-filters">
            <span className="search-active-label">Aktif Filtreler:</span>
            {filters.category && (
              <span className="search-active-chip">
                {categories.find((c) => c.key === filters.category)?.label}
                <button onClick={() => applyFilters({ category: "", subPropertyType: "" })}>×</button>
              </span>
            )}
            {filters.roomCount.map((room) => (
              <span key={room} className="search-active-chip">
                {room}
                <button onClick={() => toggleRoomCount(room)}>×</button>
              </span>
            ))}
            {filters.buildingAge && (
              <span className="search-active-chip">
                {BUILDING_AGES.find((a) => a.key === filters.buildingAge)?.label}
                <button onClick={() => applyFilters({ buildingAge: "" })}>×</button>
              </span>
            )}
            {filters.cityId && (
              <span className="search-active-chip">
                {cities.find((c) => c.id === filters.cityId)?.name}
                <button onClick={() => applyFilters({ cityId: "", districtId: "", neighborhoodIds: [] })}>×</button>
              </span>
            )}
            {filters.minPrice && (
              <span className="search-active-chip">
                Min: {formatPriceDisplay(filters.minPrice)}₺
                <button onClick={() => applyFilters({ minPrice: "" })}>×</button>
              </span>
            )}
            {filters.maxPrice && (
              <span className="search-active-chip">
                Max: {formatPriceDisplay(filters.maxPrice)}₺
                <button onClick={() => applyFilters({ maxPrice: "" })}>×</button>
              </span>
            )}
            <button className="search-clear-all" onClick={clearAllFilters}>
              Tümünü Temizle
            </button>
          </div>
        )}

        {/* Sonuçlar */}
        {loading ? (
          <div className="search-loading">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>İlanlar yükleniyor...</p>
          </div>
        ) : sortedListings.length === 0 ? (
          <div className="search-empty">
            <i className="fa-solid fa-search"></i>
            <h3>İlan bulunamadı</h3>
            <p>Arama kriterlerinize uygun ilan bulunamadı. Filtreleri temizleyip tekrar deneyin.</p>
            <button className="btn btn-primary" onClick={clearAllFilters}>
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="listings-grid">
            {sortedListings.map((listing) => {
              const features = getListingFeatures(listing);
              return (
                <Link key={listing.id} href={`/listings/${listing.slug || listing.id}`} className="listing-card">
                  <div className="listing-image" style={{ backgroundImage: `url('${getCoverImage(listing) || "/placeholder.jpg"}')` }}>
                    <div className="listing-labels-top">
                      <span className={`listing-status ${listing.status === "FOR_SALE" ? "for-sale" : "for-rent"}`}>
                        {listing.status === "FOR_SALE" ? "Satılık" : "Kiralık"}
                      </span>
                      {listing.isOpportunity && <span className="listing-opportunity">Fırsat</span>}
                    </div>
                    {listing.listingNo && <span className="listing-no">#{listing.listingNo}</span>}
                  </div>
                  <div className="listing-info">
                    <div className="listing-price-tag">{formatPrice(listing.price, listing.currency)}</div>
                    <h4 className="listing-title">{listing.title}</h4>
                    <p className="listing-location">
                      <i className="fa-solid fa-location-dot"></i>
                      {getLocationText(listing)}
                    </p>
                    <div className="listing-features">
                      {features.map((feature, idx) => (
                        <div key={idx} className="listing-feature" title={feature.title}>
                          <i className={`fa-solid ${feature.icon}`}></i>
                          <span>{feature.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Detaylı Arama Modal */}
      <AdvancedFilter
        isOpen={showAdvancedFilter}
        onClose={() => setShowAdvancedFilter(false)}
        onApply={(advancedFilters) => {
          const newFilters: Partial<typeof filters> = {
            status: advancedFilters.status as string || "",
            category: advancedFilters.category as string || "",
            subPropertyType: advancedFilters.subPropertyType as string || "",
            minPrice: advancedFilters.minPrice as string || "",
            maxPrice: advancedFilters.maxPrice as string || "",
            minArea: advancedFilters.minArea as string || "",
            maxArea: advancedFilters.maxArea as string || "",
            roomCount: Array.isArray(advancedFilters.roomCount) ? advancedFilters.roomCount as string[] : [],
            buildingAge: advancedFilters.buildingAge as string || "",
            floor: advancedFilters.floor as string || "",
            heatingType: advancedFilters.heatingType as string || "",
            furnished: advancedFilters.furnished !== null ? String(advancedFilters.furnished) : "",
            landType: advancedFilters.landType as string || "",
            gardenType: advancedFilters.gardenType as string || "",
            fieldType: advancedFilters.fieldType as string || "",
            waterType: advancedFilters.waterType as string || "",
            cityId: advancedFilters.cityId as string || "",
            districtId: advancedFilters.districtId as string || "",
            neighborhoodIds: Array.isArray(advancedFilters.neighborhoodIds) ? advancedFilters.neighborhoodIds as string[] : [],
            sort: advancedFilters.sort as string || "createdAt",
            order: advancedFilters.order as "asc" | "desc" || "desc",
          };
          applyFilters(newFilters);
        }}
        showCityFilter={true}
        initialFilters={{
          status: filters.status as "FOR_SALE" | "FOR_RENT" | null,
          category: filters.category as "HOUSING" | "LAND" | "COMMERCIAL" | "FIELD" | "GARDEN" | null,
          subPropertyType: filters.subPropertyType || null,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minArea: filters.minArea,
          maxArea: filters.maxArea,
          roomCount: filters.roomCount,
          buildingAge: filters.buildingAge || null,
          floor: filters.floor || null,
          heatingType: filters.heatingType || null,
          furnished: filters.furnished === "true" ? true : filters.furnished === "false" ? false : null,
          landType: filters.landType || null,
          gardenType: filters.gardenType || null,
          fieldType: filters.fieldType || null,
          waterType: filters.waterType || null,
          cityId: filters.cityId || null,
          districtId: filters.districtId || null,
          neighborhoodIds: filters.neighborhoodIds,
          sortBy: filters.sort,
          sortOrder: filters.order,
        }}
      />
    </main>
  );
}

export default function AramaPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Yükleniyor...</div>}>
      <AramaPageContent />
    </Suspense>
  );
}
