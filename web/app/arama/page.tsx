"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Listing = {
  id: string;
  title: string;
  price?: number | string | null;
  currency?: string;
  status: "FOR_SALE" | "FOR_RENT";
  category?: string;
  city?: { name: string } | null;
  district?: { name: string } | null;
  neighborhood?: { name: string } | null;
  attributes?: Record<string, unknown>;
  areaNet?: number | string | null;
  areaGross?: number | string | null;
  isOpportunity?: boolean;
  images?: { url: string; isCover?: boolean }[];
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

function AramaPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    status: searchParams.get("status") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const queryStr = params.toString();
    fetch(`${API_BASE_URL}/listings${queryStr ? `?${queryStr}` : ""}`)
      .then((res) => res.json())
      .then((data) => setListings(Array.isArray(data) ? data : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const applyFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    const queryStr = params.toString();
    router.push(`/arama${queryStr ? `?${queryStr}` : ""}`);
  };

  const clearFilters = () => {
    setFilters({ q: "", status: "", category: "", minPrice: "", maxPrice: "" });
    router.push("/arama");
  };

  return (
    <main className="search-page">
      <div className="search-container">
        {/* Header */}
        <div className="search-header">
          <h1>
            <i className="fa-solid fa-search"></i>
            {filters.q ? `"${filters.q}" için arama sonuçları` : "Tüm İlanlar"}
          </h1>
          <p>{listings.length} ilan bulundu</p>
        </div>

        {/* Quick Filters */}
        <div className="search-quick-filters">
          <button
            className={`search-filter-btn ${!filters.status ? "active" : ""}`}
            onClick={() => applyFilters({ status: "" })}
          >
            Tümü
          </button>
          <button
            className={`search-filter-btn ${filters.status === "FOR_SALE" ? "active" : ""}`}
            onClick={() => applyFilters({ status: "FOR_SALE" })}
          >
            Satılık
          </button>
          <button
            className={`search-filter-btn ${filters.status === "FOR_RENT" ? "active" : ""}`}
            onClick={() => applyFilters({ status: "FOR_RENT" })}
          >
            Kiralık
          </button>
          <button
            className="search-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="fa-solid fa-sliders"></i>
            {showFilters ? "Filtreleri Gizle" : "Filtrele"}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="search-filters-panel">
            <div className="search-filters-grid">
              <div className="form-group">
                <label className="form-label">Anahtar Kelime</label>
                <input
                  className="form-input"
                  value={filters.q}
                  onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                  placeholder="İlan ara..."
                  onKeyPress={(e) => e.key === "Enter" && applyFilters({})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  className="form-select"
                  value={filters.category}
                  onChange={(e) => applyFilters({ category: e.target.value })}
                >
                  <option value="">Tüm Kategoriler</option>
                  <option value="HOUSING">Konut</option>
                  <option value="LAND">Arsa</option>
                  <option value="COMMERCIAL">Ticari</option>
                  <option value="FIELD">Tarla</option>
                  <option value="GARDEN">Bahçe</option>
                  <option value="TRANSFER">Devren</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Min Fiyat (₺)</label>
                <input
                  className="form-input"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max Fiyat (₺)</label>
                <input
                  className="form-input"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="∞"
                />
              </div>
            </div>
            <div className="search-filters-actions">
              <button className="btn btn-primary" onClick={() => applyFilters({})}>
                <i className="fa-solid fa-search"></i>
                Ara
              </button>
              <button className="btn btn-secondary" onClick={clearFilters}>
                <i className="fa-solid fa-times"></i>
                Temizle
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="search-loading">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>İlanlar yükleniyor...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="search-empty">
            <i className="fa-solid fa-search"></i>
            <h3>İlan bulunamadı</h3>
            <p>Arama kriterlerinize uygun ilan bulunamadı. Filtreleri temizleyip tekrar deneyin.</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`} className="listing-card">
                <div className="listing-image" style={{ backgroundImage: `url('${getCoverImage(listing)}')` }}>
                  <span className={`listing-status ${listing.status === "FOR_SALE" ? "for-sale" : "for-rent"}`}>
                    {listing.status === "FOR_SALE" ? "Satılık" : "Kiralık"}
                  </span>
                  {listing.isOpportunity && <span className="listing-opportunity">Fırsat</span>}
                </div>
                <div className="listing-info">
                  <div className="listing-price-tag">{formatPrice(listing.price, listing.currency)}</div>
                  <h4 className="listing-title">{listing.title}</h4>
                  <p className="listing-location">
                    <i className="fa-solid fa-location-dot"></i>
                    {getLocationText(listing)}
                  </p>
                  <div className="listing-features">
                    {listing.areaGross && (
                      <div className="listing-feature">
                        <i className="fa-solid fa-ruler-combined"></i>
                        <span>{listing.areaGross} m²</span>
                      </div>
                    )}
                    {listing.attributes?.rooms ? (
                      <div className="listing-feature">
                        <i className="fa-solid fa-bed"></i>
                        <span>{String(listing.attributes.rooms)}</span>
                      </div>
                    ) : null}
                    {listing.attributes?.floor ? (
                      <div className="listing-feature">
                        <i className="fa-solid fa-building"></i>
                        <span>{String(listing.attributes.floor)}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
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
