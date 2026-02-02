"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import BranchFilter from "../../components/BranchFilter";
import { getListingFeatures } from "../../../lib/listings";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Branch {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  photoUrl?: string;
  mapUrl?: string;
  workingHours?: string;
  cityId?: string;
  districtId?: string;
  city?: { id: string; name: string; slug: string };
  district?: { id: string; name: string; slug: string };
  neighborhoods?: { neighborhood: { id: string; name: string } }[];
}

interface Listing {
  id: string;
  title: string;
  slug: string;
  listingNo?: string | null;
  description: string;
  status: string;
  category: string;
  subPropertyType?: string | null;
  price: number;
  currency: string;
  areaGross?: number;
  areaNet?: number;
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
  isOpportunity?: boolean;
  attributes?: Record<string, unknown> | null;
  images: { id: string; url: string; isPrimary: boolean }[];
  city?: { name: string };
  district?: { name: string };
  neighborhood?: { name: string };
}

export default function BranchDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [totalListings, setTotalListings] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<Record<string, string | string[]>>({});

  // Şube bilgilerini yükle
  useEffect(() => {
    if (!slug) return;

    const loadBranch = async () => {
      try {
        // Yeni Branch API'den şube bilgisini al
        const res = await fetch(`${API_BASE_URL}/branches/by-slug/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBranch(data);
        } else {
          // Fallback: city-buttons'tan dene
          const fallbackRes = await fetch(`${API_BASE_URL}/city-buttons`);
          const buttons = await fallbackRes.json();
          const found = buttons.find((b: any) => b.slug === slug);
          
          if (found) {
            setBranch({
              id: found.id,
              name: found.name,
              slug: found.slug,
              photoUrl: found.imageUrl,
              cityId: found.cityId || found.city?.id,
              city: found.city,
            });
          }
        }
      } catch (error) {
        console.error("Branch load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBranch();
  }, [slug]);

  // İlanları yükle
  const loadListings = useCallback(async (filters: Record<string, string | string[]>) => {
    if (!slug) return;
    
    setListingsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("branchSlug", slug);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (key === "branchSlug") return; // Zaten ekledik
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v));
        } else if (value) {
          queryParams.set(key, value);
        }
      });

      const res = await fetch(`${API_BASE_URL}/listings?${queryParams.toString()}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setListings(data);
        setTotalListings(data.length);
      } else if (data.items) {
        setListings(data.items);
        setTotalListings(data.total || data.items.length);
      } else {
        setListings([]);
        setTotalListings(0);
      }
    } catch (error) {
      console.error("Listings load error:", error);
      setListings([]);
      setTotalListings(0);
    } finally {
      setListingsLoading(false);
    }
  }, [slug]);

  // Filtre değişikliği
  const handleFilterChange = useCallback((filters: Record<string, string | string[]>) => {
    setCurrentFilters(filters);
    loadListings(filters);
  }, [loadListings]);

  // İlk yükleme
  useEffect(() => {
    if (slug) {
      loadListings({});
    }
  }, [slug, loadListings]);

  // Fiyat formatlama
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency || "TRY",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Resim URL'i
  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  if (loading) {
    return (
      <main className="branch-detail-page">
        <div className="container">
          <div className="branch-detail-loading">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>Şube yükleniyor...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!branch) {
    return (
      <main className="branch-detail-page">
        <div className="container">
          <div className="branch-detail-not-found">
            <i className="fa-solid fa-map-marker-alt"></i>
            <h2>Şube Bulunamadı</h2>
            <p>Aradığınız şube mevcut değil veya kaldırılmış olabilir.</p>
            <Link href="/subeler" className="btn btn-primary">
              <i className="fa-solid fa-arrow-left"></i>
              Tüm Şubeler
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="branch-detail-page">
      <div className="container">
        {/* Şube Başlığı */}
        <div className="branch-detail-header">
          <div className="branch-detail-info">
            {branch.photoUrl && (
              <div className="branch-detail-logo">
                <img src={getImageUrl(branch.photoUrl)} alt={branch.name} />
              </div>
            )}
            <div className="branch-detail-text">
              <nav className="branch-detail-breadcrumb">
                <Link href="/">Ana Sayfa</Link>
                <i className="fa-solid fa-chevron-right"></i>
                <Link href="/subeler">Şubeler</Link>
                <i className="fa-solid fa-chevron-right"></i>
                <span>{branch.name}</span>
              </nav>
              <h1>{branch.name} İlanları</h1>
              {branch.city && <p className="branch-detail-city">{branch.city.name}</p>}
              <p className="branch-detail-count">{totalListings} ilan bulundu</p>
            </div>
          </div>
        </div>

        {/* Filtreleme */}
        <BranchFilter 
          branchSlug={slug} 
          branchId={branch?.id}
          cityId={branch?.cityId} 
          districtId={branch?.districtId}
          onFilterChange={handleFilterChange} 
        />

        {/* İlan Listesi */}
        <div className="branch-detail-listings">
          {listingsLoading ? (
            <div className="branch-detail-listings-loading">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <p>İlanlar yükleniyor...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="branch-detail-no-listings">
              <i className="fa-solid fa-search"></i>
              <h3>İlan Bulunamadı</h3>
              <p>Seçtiğiniz kriterlere uygun ilan bulunamadı. Filtreleri değiştirmeyi deneyin.</p>
            </div>
          ) : (
            <div className="listings-grid">
              {listings.map((listing) => {
                const primaryImage = listing.images?.find((img) => img.isPrimary) || listing.images?.[0];
                const imageUrl = primaryImage ? getImageUrl(primaryImage.url) : "/placeholder.jpg";
                const features = getListingFeatures(listing);
                return (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.slug || listing.id}`}
                    className="listing-card"
                  >
                    <div className="listing-image" style={{ backgroundImage: `url('${imageUrl}')` }}>
                      <div className="listing-labels-top">
                        <span className={`listing-status ${listing.status === "FOR_SALE" ? "for-sale" : "for-rent"}`}>
                          {listing.status === "FOR_SALE" ? "Satılık" : "Kiralık"}
                        </span>
                        {listing.isOpportunity && <span className="listing-opportunity">Fırsat</span>}
                      </div>
                      {listing.listingNo && <span className="listing-no">#{listing.listingNo}</span>}
                    </div>
                    <div className="listing-info">
                      <div className="listing-price-tag">
                        {listing.price ? formatPrice(listing.price, listing.currency) : "Fiyat Sorunuz"}
                      </div>
                      <h4 className="listing-title">{listing.title}</h4>
                      <p className="listing-location">
                        <i className="fa-solid fa-location-dot"></i>
                        {[listing.neighborhood?.name, listing.district?.name, listing.city?.name]
                          .filter(Boolean)
                          .join(", ")}
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
      </div>
    </main>
  );
}
