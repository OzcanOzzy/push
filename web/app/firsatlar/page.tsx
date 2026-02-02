"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getListingFeatures } from "../../lib/listings";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Listing = {
  id: string;
  title: string;
  slug?: string;
  listingNo?: string | null;
  price?: number | string | null;
  currency?: string;
  status?: string | null;
  category?: string | null;
  subPropertyType?: string | null;
  roomCount?: string | number | null;
  floor?: string | number | null;
  totalFloors?: string | number | null;
  buildingAge?: string | number | null;
  facade?: string | null;
  hasGarage?: boolean | string | null;
  hasParentBathroom?: boolean | string | null;
  hasElevator?: boolean | string | null;
  isSiteInside?: boolean | string | null;
  furnished?: string | null;
  parkingType?: string | null;
  isSwapEligible?: boolean | string | null;
  shareStatus?: string | null;
  waterType?: string | null;
  hasElectricity?: boolean | string | null;
  hasRoadAccess?: boolean | string | null;
  hasHouse?: boolean | string | null;
  city?: { name: string } | null;
  district?: { name: string } | null;
  neighborhood?: { name: string } | null;
  attributes?: Record<string, unknown> | null;
  areaNet?: number | string | null;
  areaGross?: number | string | null;
  propertyType?: string | null;
  createdAt?: string;
  images?: { url: string; isCover?: boolean | null }[] | null;
};

const SORT_OPTIONS = [
  { key: "createdAt-desc", label: "En Yeni" },
  { key: "createdAt-asc", label: "En Eski" },
  { key: "price-asc", label: "Fiyat (Artan)" },
  { key: "price-desc", label: "Fiyat (Azalan)" },
  { key: "areaGross-desc", label: "m² (Büyükten Küçüğe)" },
  { key: "areaGross-asc", label: "m² (Küçükten Büyüğe)" },
];

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

const getStatusLabel = (status?: string | null) => {
  if (status === "FOR_SALE") return "Satılık";
  if (status === "FOR_RENT") return "Kiralık";
  return "";
};

const getStatusClass = (status?: string | null) => {
  if (status === "FOR_SALE") return "for-sale";
  if (status === "FOR_RENT") return "for-rent";
  return "";
};

export default function OpportunitiesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/listings?isOpportunity=true`)
      .then((res) => res.json())
      .then((data) => {
        setListings(Array.isArray(data) ? data : []);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  // Filtreleme ve sıralama
  const filteredListings = listings
    .filter((listing) => {
      if (!statusFilter) return true;
      return listing.status === statusFilter;
    })
    .sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;

      if (sortBy === "price") {
        const priceA = typeof a.price === "string" ? parseFloat(a.price) : (a.price || 0);
        const priceB = typeof b.price === "string" ? parseFloat(b.price) : (b.price || 0);
        return (priceA - priceB) * order;
      }
      if (sortBy === "areaGross") {
        const areaA = typeof a.areaGross === "string" ? parseFloat(a.areaGross) : (a.areaGross || 0);
        const areaB = typeof b.areaGross === "string" ? parseFloat(b.areaGross) : (b.areaGross || 0);
        return (areaA - areaB) * order;
      }
      // createdAt
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (dateA - dateB) * order;
    });

  return (
    <main className="opportunities-page">
      <div className="container">
        {/* Başlık */}
        <div className="opportunities-header">
          <h1>
            <i className="fa-solid fa-tag"></i>
            Fırsat İlanları
          </h1>
          <p>{filteredListings.length} fırsat ilanı bulundu</p>
        </div>

        {/* Filtreler */}
        <div className="opportunities-filters">
          <div className="opportunities-status-filters">
            <button
              className={`opp-filter-btn ${!statusFilter ? "active" : ""}`}
              onClick={() => setStatusFilter("")}
            >
              Tümü
            </button>
            <button
              className={`opp-filter-btn ${statusFilter === "FOR_SALE" ? "active" : ""}`}
              onClick={() => setStatusFilter("FOR_SALE")}
            >
              Satılık
            </button>
            <button
              className={`opp-filter-btn ${statusFilter === "FOR_RENT" ? "active" : ""}`}
              onClick={() => setStatusFilter("FOR_RENT")}
            >
              Kiralık
            </button>
          </div>

          <select
            className="opportunities-sort"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortBy(field);
              setSortOrder(order as "asc" | "desc");
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* İlan Listesi */}
        {loading ? (
          <div className="opportunities-loading">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>İlanlar yükleniyor...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="opportunities-empty">
            <i className="fa-solid fa-tag"></i>
            <h3>Fırsat İlanı Bulunamadı</h3>
            <p>Şu anda fırsat ilanı bulunmuyor. Daha sonra tekrar kontrol edin.</p>
          </div>
        ) : (
          <div className="listings-grid">
            {filteredListings.map((listing) => {
              const coverImage = listing.images?.find((img) => img.isCover);
              const imageUrl = resolveImageUrl(coverImage?.url || listing.images?.[0]?.url);
              const location = [
                listing.neighborhood?.name,
                listing.district?.name,
                listing.city?.name,
              ].filter(Boolean).join(", ");
              const features = getListingFeatures(listing);

              return (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.slug || listing.id}`}
                  className="listing-card"
                >
                  <div
                    className="listing-image"
                    style={{ backgroundImage: `url('${imageUrl || "/placeholder.jpg"}')` }}
                  >
                    <div className="listing-labels-top">
                      <span className={`listing-status ${listing.status === "FOR_SALE" ? "for-sale" : "for-rent"}`}>
                        {getStatusLabel(listing.status)}
                      </span>
                      <span className="listing-opportunity">
                        <i className="fa-solid fa-star"></i>
                        Fırsat
                      </span>
                    </div>
                    {listing.listingNo && (
                      <span className="listing-no">#{listing.listingNo}</span>
                    )}
                  </div>
                  <div className="listing-info">
                    <div className="listing-price-tag">
                      {formatPrice(listing.price, listing.currency)}
                    </div>
                    <h3 className="listing-title">{listing.title}</h3>
                    <p className="listing-location">
                      <i className="fa-solid fa-location-dot"></i>
                      {location || "Konum belirtilmemiş"}
                    </p>
                    <div className="listing-features">
                      {features.map((feat, idx) => (
                        <div key={idx} className="listing-feature" title={feat.title}>
                          <i className={`fa-solid ${feat.icon}`}></i>
                          <span>{feat.value}</span>
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
    </main>
  );
}
