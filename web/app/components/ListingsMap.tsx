"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getListingFeatures } from "../../lib/listings";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

type Listing = {
  id: string;
  title: string;
  listingNo?: string | null;
  status: "FOR_SALE" | "FOR_RENT";
  category?: string | null;
  subPropertyType?: string | null;
  price?: number | string | null;
  currency?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  areaGross?: number | string | null;
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
  city?: { name: string } | null;
  district?: { name: string } | null;
  neighborhood?: { name: string } | null;
  images?: { url: string; isCover?: boolean }[];
};

interface ListingsMapProps {
  listings: Listing[];
}

export default function ListingsMap({ listings }: ListingsMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Import Leaflet CSS and library on client side
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
    // Import Leaflet CSS
    // @ts-ignore - CSS import
    import("leaflet/dist/leaflet.css");
  }, []);

  if (!isMounted || !L) {
    return (
      <div className="map-placeholder">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Harita yükleniyor...</p>
      </div>
    );
  }

  // Filter listings with valid coordinates
  const validListings = listings.filter(
    (l) => l.latitude && l.longitude && Number(l.latitude) !== 0 && Number(l.longitude) !== 0
  );

  if (validListings.length === 0) {
    return (
      <div className="map-placeholder">
        <i className="fa-solid fa-map-location-dot"></i>
        <p>Henüz konumu işaretlenmiş ilan bulunmuyor</p>
      </div>
    );
  }

  // Calculate center point
  const centerLat =
    validListings.reduce((sum, l) => sum + Number(l.latitude), 0) / validListings.length;
  const centerLng =
    validListings.reduce((sum, l) => sum + Number(l.longitude), 0) / validListings.length;

  // Kategori ve duruma göre ikon rengi belirle
  const getMarkerColor = (listing: Listing): string => {
    const { status, category } = listing;
    
    // Kiralık ilanlar - sarı
    if (status === "FOR_RENT") {
      return "yellow";
    }
    
    // Satılık ilanlar - kategoriye göre
    switch (category) {
      case "HOUSING":
        return "red"; // Satılık evler - kırmızı
      case "LAND":
        return "purple"; // Satılık arsalar - mor
      case "FIELD":
      case "GARDEN":
      case "HOBBY_GARDEN":
        return "green"; // Satılık tarla/bahçe - yeşil
      case "COMMERCIAL":
      case "TRANSFER":
        return "orange"; // Satılık ticari/devren - turuncu
      default:
        return "red";
    }
  };

  // Kategori bazlı ikon belirle
  const getCategoryIcon = (category: string | null | undefined): string => {
    switch (category) {
      case "HOUSING":
        return "fa-house"; // Konut - ev ikonu
      case "COMMERCIAL":
      case "TRANSFER":
        return "fa-store"; // Ticari/Devren - dükkan ikonu
      case "LAND":
        return "fa-vector-square"; // Arsa - arsa ikonu
      case "FIELD":
        return "fa-wheat-awn"; // Tarla - tarla ikonu
      case "GARDEN":
      case "HOBBY_GARDEN":
        return "fa-tree"; // Bahçe - ağaç ikonu
      default:
        return "fa-location-dot";
    }
  };

  // Create custom icon
  const createIcon = (listing: Listing) => {
    const color = getMarkerColor(listing);
    const icon = getCategoryIcon(listing.category);
    return L.divIcon({
      className: `map-marker marker-${color}`,
      html: `<div class="marker-pin marker-${color}"><i class="fa-solid ${icon}"></i></div>`,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
    });
  };

  const formatPrice = (price: number | string | null | undefined, currency = "TRY") => {
    if (!price) return "Fiyat Sorunuz";
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getCoverImage = (listing: Listing) => {
    if (!listing.images || listing.images.length === 0) return "/placeholder-house.jpg";
    const cover = listing.images.find((img) => img.isCover) || listing.images[0];
    return cover.url;
  };

  // Konum metni oluştur
  const getLocationText = (listing: Listing) => {
    return [listing.neighborhood?.name, listing.district?.name, listing.city?.name]
      .filter(Boolean)
      .join(", ") || "Türkiye";
  };

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={10}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validListings.map((listing) => {
        const features = getListingFeatures(listing);
        return (
          <Marker
            key={listing.id}
            position={[Number(listing.latitude), Number(listing.longitude)]}
            icon={createIcon(listing)}
          >
            <Popup>
              <div className="map-popup-card">
                <div className="map-popup-image" style={{ backgroundImage: `url('${getCoverImage(listing)}')` }}>
                  <div className="map-popup-labels">
                    <span className={`map-popup-status ${listing.status === "FOR_SALE" ? "for-sale" : "for-rent"}`}>
                      {listing.status === "FOR_SALE" ? "Satılık" : "Kiralık"}
                    </span>
                    {listing.isOpportunity && <span className="map-popup-opportunity">Fırsat</span>}
                  </div>
                  {listing.listingNo && <span className="map-popup-no">#{listing.listingNo}</span>}
                </div>
                <div className="map-popup-content">
                  <div className="map-popup-price">
                    {formatPrice(listing.price, listing.currency)}
                  </div>
                  <h4 className="map-popup-title">{listing.title}</h4>
                  <p className="map-popup-location">
                    <i className="fa-solid fa-location-dot"></i>
                    {getLocationText(listing)}
                  </p>
                  {features.length > 0 && (
                    <div className="map-popup-features">
                      {features.map((feat, idx) => (
                        <span key={idx} title={feat.title}>
                          <i className={`fa-solid ${feat.icon}`}></i>
                          {feat.value}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link href={`/listings/${listing.id}`} className="map-popup-link">
                    İlanı Gör
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
