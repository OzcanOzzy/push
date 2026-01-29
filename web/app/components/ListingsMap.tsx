"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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
  status: "FOR_SALE" | "FOR_RENT";
  price?: number | string | null;
  currency?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  city?: { name: string } | null;
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

  // Create custom icon
  const createIcon = (status: "FOR_SALE" | "FOR_RENT") => {
    return L.divIcon({
      className: `map-marker ${status === "FOR_SALE" ? "for-sale" : "for-rent"}`,
      html: `<div class="marker-pin"><i class="fa-solid fa-home"></i></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
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
      {validListings.map((listing) => (
        <Marker
          key={listing.id}
          position={[Number(listing.latitude), Number(listing.longitude)]}
          icon={createIcon(listing.status)}
        >
          <Popup>
            <div className="map-popup">
              <img
                src={getCoverImage(listing)}
                alt={listing.title}
                className="map-popup-img"
              />
              <div className="map-popup-content">
                <span
                  className={`map-popup-status ${
                    listing.status === "FOR_SALE" ? "for-sale" : "for-rent"
                  }`}
                >
                  {listing.status === "FOR_SALE" ? "Satılık" : "Kiralık"}
                </span>
                <h4>{listing.title}</h4>
                <p className="map-popup-location">
                  <i className="fa-solid fa-location-dot"></i>
                  {listing.city?.name || "Türkiye"}
                </p>
                <p className="map-popup-price">
                  {formatPrice(listing.price, listing.currency)}
                </p>
                <a href={`/listings/${listing.id}`} className="map-popup-link">
                  İlanı Gör
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
