"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  buildListingFeatures,
  formatPrice,
  getStatusLabel,
  resolveImageUrl,
} from "../../lib/listings";
import { useSettings } from "../components/SettingsProvider";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Listing = {
  id: string;
  title: string;
  price?: string | null;
  status?: string | null;
  category?: string | null;
  city?: { name: string } | null;
  district?: { name: string } | null;
  neighborhood?: { name: string } | null;
  attributes?: Record<string, unknown> | null;
  areaNet?: string | null;
  areaGross?: string | null;
  propertyType?: string | null;
  isOpportunity?: boolean;
  images?: { url: string; isCover?: boolean | null }[] | null;
};

type City = {
  id: string;
  name: string;
  slug: string;
};

type District = {
  id: string;
  name: string;
};

type Neighborhood = {
  id: string;
  name: string;
};

type ListingAttribute = {
  id: string;
  category: string;
  key: string;
  label: string;
  type: "TEXT" | "NUMBER" | "SELECT" | "BOOLEAN";
  options?: string[] | null;
  allowsMultiple?: boolean;
};

type CityButton = {
  id: string;
  name: string;
  slug: string;
  city?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  // Branch-specific info
  address?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
  consultantName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`);
  if (!res.ok) throw new Error("Fetch failed");
  return res.json();
}

export default function CityPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const settings = useSettings();
  const citySlug = params.city as string;

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [attributes, setAttributes] = useState<ListingAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [branchInfo, setBranchInfo] = useState<CityButton | null>(null);

  // Filter values from URL
  const activeStatus = searchParams.get("status") || "";
  const activeCategory = searchParams.get("category") || "";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";
  const activeDistrictId = searchParams.get("districtId") || "";
  const activeNeighborhoodId = searchParams.get("neighborhoodId") || "";

  // Parse attribute filters from URL
  const attributeFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith("attr_")) {
        filters[key.replace("attr_", "")] = value;
      }
    });
    return filters;
  }, [searchParams]);

  const selectedCity = cities.find((c) => c.slug === citySlug);
  // Use branch name first, then city name, then formatted slug
  const cityName = branchInfo?.name || selectedCity?.name || citySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const citiesData = await fetchJson<City[]>("/cities");
        setCities(citiesData);

        const city = citiesData.find((c) => c.slug === citySlug);
        if (city) {
          const districtsData = await fetchJson<District[]>(`/districts?cityId=${city.id}`);
          setDistricts(districtsData);
        }

        // Build listings query
        const listingsParams = new URLSearchParams({ citySlug });
        if (activeStatus) listingsParams.set("status", activeStatus);
        if (activeCategory) listingsParams.set("category", activeCategory);
        if (activeMinPrice) listingsParams.set("minPrice", activeMinPrice);
        if (activeMaxPrice) listingsParams.set("maxPrice", activeMaxPrice);
        if (activeDistrictId) listingsParams.set("districtId", activeDistrictId);
        if (activeNeighborhoodId) listingsParams.set("neighborhoodId", activeNeighborhoodId);

        const listingsData = await fetchJson<Listing[]>(`/listings?${listingsParams.toString()}`);
        setListings(listingsData);

        // Load attributes for the selected category
        if (activeCategory) {
          const attrsData = await fetchJson<ListingAttribute[]>(`/listing-attributes?category=${activeCategory}`);
          setAttributes(attrsData);
        } else {
          setAttributes([]);
        }

        // Load branch info
        try {
          const cityButtons = await fetchJson<CityButton[]>("/city-buttons");
          const branch = cityButtons.find(
            (b) => b.slug === citySlug || b.city?.slug === citySlug
          );
          if (branch) {
            setBranchInfo(branch);
          }
        } catch {
          // Branch info is optional
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [citySlug, activeStatus, activeCategory, activeMinPrice, activeMaxPrice, activeDistrictId, activeNeighborhoodId]);

  // Load neighborhoods when district changes
  useEffect(() => {
    if (activeDistrictId) {
      fetchJson<Neighborhood[]>(`/neighborhoods?districtId=${activeDistrictId}`)
        .then(setNeighborhoods)
        .catch(() => setNeighborhoods([]));
    } else {
      setNeighborhoods([]);
    }
  }, [activeDistrictId]);

  // Filter listings by attributes client-side
  const filteredListings = useMemo(() => {
    if (Object.keys(attributeFilters).length === 0) {
      return listings;
    }

    return listings.filter((listing) => {
      const attrs = listing.attributes || {};
      for (const [key, filterValue] of Object.entries(attributeFilters)) {
        if (!filterValue) continue;
        const listingValue = attrs[key];
        if (listingValue === undefined || listingValue === null) return false;

        const listingStr = Array.isArray(listingValue)
          ? listingValue.join(",")
          : String(listingValue);

        if (!listingStr.toLowerCase().includes(filterValue.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [listings, attributeFilters]);

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    }

    const query = newParams.toString();
    return query ? `/${citySlug}?${query}` : `/${citySlug}`;
  };

  const handleAttributeFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newParams.set(`attr_${key}`, value);
    } else {
      newParams.delete(`attr_${key}`);
    }
    router.push(`/${citySlug}?${newParams.toString()}`);
  };

  const clearAttributeFilters = () => {
    const newParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (!key.startsWith("attr_")) {
        newParams.set(key, value);
      }
    });
    router.push(`/${citySlug}?${newParams.toString()}`);
  };

  // Stats
  const totalListings = filteredListings.length;
  const forSaleCount = listings.filter((l) => l.status === "FOR_SALE").length;
  const forRentCount = listings.filter((l) => l.status === "FOR_RENT").length;

  // Branch contact info - use branch-specific or fallback to site settings
  const branchPhone = branchInfo?.phone || settings.phoneNumber || "0543 306 14 99";
  const branchWhatsapp = branchInfo?.whatsappNumber || settings.whatsappNumber;
  const branchEmail = branchInfo?.email || settings.email;
  const branchConsultant = branchInfo?.consultantName || settings.ownerName || "Özcan Aktaş";
  const branchAddress = branchInfo?.address || settings.address || `${cityName}, Türkiye`;
  const branchLat = branchInfo?.latitude;
  const branchLng = branchInfo?.longitude;

  if (loading) {
    return (
      <main className="branch-page">
        <div className="branch-page-container">
          <div className="branch-loading">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>İlanlar yükleniyor...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="branch-page">
      {/* Branch Header */}
      <div className="branch-header">
        <div className="branch-header-content">
          <nav className="branch-breadcrumb">
            <Link href="/">Ana Sayfa</Link>
            <i className="fa-solid fa-chevron-right"></i>
            <Link href="/subeler">Şubeler</Link>
            <i className="fa-solid fa-chevron-right"></i>
            <span>{cityName}</span>
          </nav>
          <h1 className="branch-title">
            <i className="fa-solid fa-building"></i>
            {cityName} Şubesi
          </h1>
          <p className="branch-subtitle">
            {totalListings} ilan bulundu ({forSaleCount} satılık, {forRentCount} kiralık)
          </p>
        </div>
      </div>

      {/* Status Tabs - Centered */}
      <div className="branch-tabs">
        <div className="branch-tabs-inner">
          <Link
            href={buildUrl({ status: "FOR_SALE" })}
            className={`branch-tab ${activeStatus === "FOR_SALE" ? "active sale" : ""}`}
          >
            <i className="fa-solid fa-tag"></i>
            Satılık
            <span className="branch-tab-count">{forSaleCount}</span>
          </Link>
          <Link
            href={buildUrl({ status: "FOR_RENT" })}
            className={`branch-tab ${activeStatus === "FOR_RENT" ? "active rent" : ""}`}
          >
            <i className="fa-solid fa-key"></i>
            Kiralık
            <span className="branch-tab-count">{forRentCount}</span>
          </Link>
          <Link
            href={buildUrl({ status: undefined })}
            className={`branch-tab ${!activeStatus ? "active" : ""}`}
          >
            <i className="fa-solid fa-layer-group"></i>
            Tümü
            <span className="branch-tab-count">{listings.length}</span>
          </Link>
        </div>
      </div>

      <div className="branch-page-container">
        {/* Filter Toggle Button */}
        <div className="branch-filter-toggle-wrapper">
          <button
            className="branch-filter-toggle"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <i className={`fa-solid ${filtersOpen ? "fa-times" : "fa-sliders"}`}></i>
            <span>Filtreler</span>
            <i className={`fa-solid fa-chevron-${filtersOpen ? "up" : "down"}`}></i>
          </button>
        </div>

        {/* Collapsible Filters Panel */}
        <div className={`branch-filters-panel ${filtersOpen ? "open" : ""}`}>
          <div className="branch-filters-inner">
            {/* Price Filter */}
            <div className="branch-filter-group">
              <h4><i className="fa-solid fa-turkish-lira-sign"></i> Fiyat</h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  router.push(buildUrl({
                    minPrice: formData.get("minPrice") as string,
                    maxPrice: formData.get("maxPrice") as string,
                  }));
                }}
              >
                <div className="branch-filter-row">
                  <input
                    className="branch-filter-input"
                    name="minPrice"
                    placeholder="Min ₺"
                    defaultValue={activeMinPrice}
                  />
                  <span>-</span>
                  <input
                    className="branch-filter-input"
                    name="maxPrice"
                    placeholder="Max ₺"
                    defaultValue={activeMaxPrice}
                  />
                  <button className="branch-filter-apply" type="submit">
                    <i className="fa-solid fa-check"></i>
                  </button>
                </div>
              </form>
            </div>

            {/* Location Filter */}
            <div className="branch-filter-group">
              <h4><i className="fa-solid fa-location-dot"></i> Konum</h4>
              <div className="branch-filter-city-badge">
                <i className="fa-solid fa-map-pin"></i>
                {cityName}
              </div>
              <select
                className="branch-filter-select"
                value={activeDistrictId}
                onChange={(e) => {
                  router.push(buildUrl({
                    districtId: e.target.value,
                    neighborhoodId: undefined,
                  }));
                }}
              >
                <option value="">Tüm İlçeler</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
              {activeDistrictId && (
                <select
                  className="branch-filter-select"
                  value={activeNeighborhoodId}
                  onChange={(e) => {
                    router.push(buildUrl({ neighborhoodId: e.target.value }));
                  }}
                >
                  <option value="">Tüm Mahalleler</option>
                  {neighborhoods.map((neighborhood) => (
                    <option key={neighborhood.id} value={neighborhood.id}>
                      {neighborhood.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Category Filter */}
            <div className="branch-filter-group">
              <h4><i className="fa-solid fa-tags"></i> Kategori</h4>
              <div className="branch-filter-categories">
                {[
                  { value: "", label: "Tümü", icon: "fa-solid fa-border-all" },
                  { value: "HOUSING", label: "Konut", icon: "fa-solid fa-home" },
                  { value: "LAND", label: "Arsa", icon: "fa-solid fa-map" },
                  { value: "COMMERCIAL", label: "Ticari", icon: "fa-solid fa-store" },
                  { value: "FIELD", label: "Tarla", icon: "fa-solid fa-tractor" },
                  { value: "GARDEN", label: "Bahçe", icon: "fa-solid fa-tree" },
                ].map((cat) => (
                  <Link
                    key={cat.value}
                    href={buildUrl({ category: cat.value || undefined })}
                    className={`branch-category-chip ${activeCategory === cat.value || (!activeCategory && !cat.value) ? "active" : ""}`}
                  >
                    <i className={cat.icon}></i>
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Dynamic Attribute Filters */}
            {attributes.length > 0 && (
              <div className="branch-filter-group">
                <h4><i className="fa-solid fa-list-check"></i> Özellikler</h4>
                <div className="branch-filter-attrs-grid">
                  {attributes.slice(0, 6).map((attr) => (
                    <div key={attr.id} className="branch-filter-attr">
                      <label>{attr.label}</label>
                      {attr.type === "SELECT" && attr.options ? (
                        <select
                          className="branch-filter-select"
                          value={attributeFilters[attr.key] || ""}
                          onChange={(e) => handleAttributeFilter(attr.key, e.target.value)}
                        >
                          <option value="">Tümü</option>
                          {attr.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : attr.type === "BOOLEAN" ? (
                        <select
                          className="branch-filter-select"
                          value={attributeFilters[attr.key] || ""}
                          onChange={(e) => handleAttributeFilter(attr.key, e.target.value)}
                        >
                          <option value="">Tümü</option>
                          <option value="true">Evet</option>
                          <option value="false">Hayır</option>
                        </select>
                      ) : (
                        <input
                          type={attr.type === "NUMBER" ? "number" : "text"}
                          className="branch-filter-input"
                          placeholder={attr.label}
                          value={attributeFilters[attr.key] || ""}
                          onChange={(e) => handleAttributeFilter(attr.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
                {Object.keys(attributeFilters).length > 0 && (
                  <button className="branch-filter-clear" onClick={clearAttributeFilters}>
                    <i className="fa-solid fa-times"></i>
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        <section className="branch-listings-section">
          {filteredListings.length === 0 ? (
            <div className="branch-no-listings">
              <i className="fa-solid fa-search"></i>
              <h3>İlan Bulunamadı</h3>
              <p>Bu kriterlere uygun ilan bulunmuyor. Filtreleri değiştirmeyi deneyin.</p>
              <Link href={`/${citySlug}`} className="branch-reset-btn">
                Filtreleri Sıfırla
              </Link>
            </div>
          ) : (
            <div className="branch-listings-grid">
              {filteredListings.map((listing) => {
                const coverImageUrl = resolveImageUrl(
                  listing.images?.find((image) => image.isCover)?.url || listing.images?.[0]?.url
                );

                return (
                  <Link key={listing.id} href={`/listings/${listing.id}`} className="branch-listing-card">
                    <div
                      className="branch-listing-image"
                      style={{ backgroundImage: coverImageUrl ? `url('${coverImageUrl}')` : undefined }}
                    >
                      {!coverImageUrl && (
                        <div className="branch-listing-no-image">
                          <i className="fa-solid fa-image"></i>
                        </div>
                      )}
                      <span className={`branch-listing-status ${listing.status === "FOR_SALE" ? "sale" : "rent"}`}>
                        {getStatusLabel(listing.status)}
                      </span>
                      {listing.isOpportunity && (
                        <span className="branch-listing-opportunity">Fırsat</span>
                      )}
                    </div>
                    <div className="branch-listing-content">
                      <div className="branch-listing-price">
                        {formatPrice(listing.price)}
                      </div>
                      <h3 className="branch-listing-title">{listing.title}</h3>
                      <p className="branch-listing-location">
                        <i className="fa-solid fa-location-dot"></i>
                        {[listing.district?.name, listing.neighborhood?.name].filter(Boolean).join(", ") || cityName}
                      </p>
                      <div className="branch-listing-features">
                        {buildListingFeatures(listing).slice(0, 4).map((feature, idx) => (
                          <span key={idx}>{feature}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Branch Info Section */}
        <section className="branch-info-section">
          <div className="branch-info-header">
            <h2>
              <i className="fa-solid fa-building"></i>
              {cityName} Şubesi İletişim
            </h2>
          </div>
          <div className="branch-info-grid">
            {/* Map Card */}
            <div className="branch-info-card branch-map-card">
              <h3>
                <i className="fa-solid fa-map-location-dot"></i>
                Konum
              </h3>
              <div className="branch-map-container">
                {branchLat && branchLng ? (
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${branchLat},${branchLng}&zoom=15`}
                    width="100%"
                    height="250"
                    style={{ border: 0, borderRadius: 12 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${cityName} Şubesi Harita`}
                  ></iframe>
                ) : (
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(branchAddress)}&zoom=14`}
                    width="100%"
                    height="250"
                    style={{ border: 0, borderRadius: 12 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${cityName} Şubesi Harita`}
                  ></iframe>
                )}
              </div>
              <p className="branch-address">
                <i className="fa-solid fa-location-dot"></i>
                {branchAddress}
              </p>
            </div>

            {/* Contact Card */}
            <div className="branch-info-card branch-contact-card">
              <h3>
                <i className="fa-solid fa-address-book"></i>
                İletişim Bilgileri
              </h3>
              <div className="branch-contact-list">
                <a href={`tel:${branchPhone}`} className="branch-contact-item">
                  <div className="branch-contact-icon">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div className="branch-contact-details">
                    <span className="branch-contact-label">Telefon</span>
                    <span className="branch-contact-value">{branchPhone}</span>
                  </div>
                </a>

                {branchWhatsapp && (
                  <a
                    href={`https://wa.me/${branchWhatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="branch-contact-item whatsapp"
                  >
                    <div className="branch-contact-icon">
                      <i className="fa-brands fa-whatsapp"></i>
                    </div>
                    <div className="branch-contact-details">
                      <span className="branch-contact-label">WhatsApp</span>
                      <span className="branch-contact-value">{branchWhatsapp}</span>
                    </div>
                  </a>
                )}

                {branchEmail && (
                  <a href={`mailto:${branchEmail}`} className="branch-contact-item">
                    <div className="branch-contact-icon">
                      <i className="fa-solid fa-envelope"></i>
                    </div>
                    <div className="branch-contact-details">
                      <span className="branch-contact-label">E-posta</span>
                      <span className="branch-contact-value">{branchEmail}</span>
                    </div>
                  </a>
                )}

                <div className="branch-contact-item">
                  <div className="branch-contact-icon">
                    <i className="fa-solid fa-user-tie"></i>
                  </div>
                  <div className="branch-contact-details">
                    <span className="branch-contact-label">Danışman</span>
                    <span className="branch-contact-value">{branchConsultant}</span>
                  </div>
                </div>
              </div>

              <div className="branch-contact-cta">
                <a href={`tel:${branchPhone}`} className="branch-cta-btn call">
                  <i className="fa-solid fa-phone"></i>
                  Hemen Ara
                </a>
                {branchWhatsapp && (
                  <a
                    href={`https://wa.me/${branchWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Merhaba, ${cityName} şubeniz hakkında bilgi almak istiyorum.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="branch-cta-btn whatsapp"
                  >
                    <i className="fa-brands fa-whatsapp"></i>
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
