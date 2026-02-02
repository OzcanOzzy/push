"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSettings } from "../../components/SettingsProvider";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ListingImage = {
  id: string;
  url: string;
  isCover: boolean;
  sortOrder: number;
};

type Listing = {
  id: string;
  listingNo: string;
  title: string;
  slug: string | null;
  description: string | null;
  price: number;
  currency: string;
  status: "FOR_SALE" | "FOR_RENT";
  category: string;
  subPropertyType: string | null;
  areaGross: number | null;
  areaNet: number | null;
  isOpportunity: boolean;
  latitude: number | null;
  longitude: number | null;
  hideLocation: boolean;
  googleMapsUrl: string | null;
  videoUrl: string | null;
  virtualTourUrl: string | null;
  virtualTourType: string | null;
  attributes: Record<string, unknown> | null;
  images: ListingImage[];
  city?: { name: string } | null;
  district?: { name: string } | null;
  neighborhood?: { name: string } | null;
  branch?: { id: string; name: string; phone?: string; whatsappNumber?: string; address?: string } | null;
  consultant?: { id: string; photoUrl?: string; title?: string; whatsappNumber?: string; contactPhone?: string; user?: { name: string } } | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  createdAt: string;
  updatedAt: string;
};

// Fiyat formatlama
function formatPrice(price: number, currency: string = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Görsel URL'sini tam URL'ye çevir
function getImageUrl(url: string): string {
  if (!url) return "/placeholder.jpg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
  return url;
}

// Kategori bazlı gösterilecek özellikler ve ikonları
const categoryFeatureConfig: Record<string, { key: string; icon: string; label: string }[]> = {
  // KONUT: Oda, Kat/Toplam Kat, Bina Yaşı, m², Cephe, Garaj, E.Banyo, Asansör, Site, Eşyalı, Otopark, Takas
  HOUSING: [
    { key: "roomCount", icon: "fa-door-open", label: "Oda" },
    { key: "floorLocation", icon: "fa-building", label: "Kat" },
    { key: "buildingAge", icon: "fa-calendar", label: "Bina Yaşı" },
    { key: "_area", icon: "fa-ruler-combined", label: "m²" },
    { key: "facing", icon: "fa-compass", label: "Cephe" },
    { key: "garage", icon: "fa-warehouse", label: "Garaj" },
    { key: "masterBathroom", icon: "fa-bath", label: "E.Banyo" },
    { key: "elevator", icon: "fa-elevator", label: "Asansör" },
    { key: "inComplex", icon: "fa-building-shield", label: "Site" },
    { key: "furnished", icon: "fa-couch", label: "Eşyalı" },
    { key: "parking", icon: "fa-car", label: "Otopark" },
    { key: "exchange", icon: "fa-right-left", label: "Takas" },
  ],
  // ARSA: Arsa Tipi, m², Kat Karşılığı, KAKS, TAKS, Kat Adeti, İmar Durumu, Nizam, Takas, Hisseli
  LAND: [
    { key: "_subType", icon: "fa-layer-group", label: "Arsa Tipi" },
    { key: "_area", icon: "fa-ruler-combined", label: "m²" },
    { key: "landForBuilding", icon: "fa-building", label: "Kat Karşılığı" },
    { key: "kaks", icon: "fa-percent", label: "KAKS" },
    { key: "taks", icon: "fa-percent", label: "TAKS" },
    { key: "floorCount", icon: "fa-layer-group", label: "Kat Adeti" },
    { key: "zoningStatus", icon: "fa-file-contract", label: "İmar" },
    { key: "buildingOrder", icon: "fa-align-left", label: "Nizam" },
    { key: "exchange", icon: "fa-right-left", label: "Takas" },
    { key: "shareStatus", icon: "fa-chart-pie", label: "Hisseli" },
  ],
  // TİCARİ: Ticari Tipi, m², Bina Yaşı, Kat Sayısı, Kiracılı, Takas, Hisseli
  COMMERCIAL: [
    { key: "_subType", icon: "fa-store", label: "Ticari Tipi" },
    { key: "_area", icon: "fa-ruler-combined", label: "m²" },
    { key: "buildingAge", icon: "fa-calendar", label: "Bina Yaşı" },
    { key: "floorCount", icon: "fa-layer-group", label: "Kat Sayısı" },
    { key: "hasTenant", icon: "fa-user-tie", label: "Kiracılı" },
    { key: "exchange", icon: "fa-right-left", label: "Takas" },
    { key: "shareStatus", icon: "fa-chart-pie", label: "Hisseli" },
  ],
  // DEVREN: Ticari Tipi, m², Bina Yaşı, Kat Sayısı, Takas
  TRANSFER: [
    { key: "_subType", icon: "fa-store", label: "Ticari Tipi" },
    { key: "_area", icon: "fa-ruler-combined", label: "m²" },
    { key: "buildingAge", icon: "fa-calendar", label: "Bina Yaşı" },
    { key: "floorCount", icon: "fa-layer-group", label: "Kat Sayısı" },
    { key: "exchange", icon: "fa-right-left", label: "Takas" },
  ],
  // TARLA: Tarla Tipi, m², Su, Elektrik, Yol, Takas, Hisseli
  FIELD: [
    { key: "_subType", icon: "fa-wheat-awn", label: "Tarla Tipi" },
    { key: "_area", icon: "fa-ruler-combined", label: "m²" },
    { key: "waterStatus", icon: "fa-droplet", label: "Su" },
    { key: "electricityStatus", icon: "fa-bolt", label: "Elektrik" },
    { key: "roadStatus", icon: "fa-road", label: "Yol" },
    { key: "exchange", icon: "fa-right-left", label: "Takas" },
    { key: "shareStatus", icon: "fa-chart-pie", label: "Hisseli" },
  ],
  // BAHÇE: Bahçe Tipi, m², Meyve Cinsi, Ağaç Sayısı, Ağaç Yaşı, Su, Elektrik, Ev, Takas, Hisseli
  GARDEN: [
    { key: "_subType", icon: "fa-tree", label: "Bahçe Tipi" },
    { key: "_area", icon: "fa-ruler-combined", label: "m²" },
    { key: "fruitType", icon: "fa-apple-whole", label: "Meyve Cinsi" },
    { key: "treeCount", icon: "fa-tree", label: "Ağaç Sayısı" },
    { key: "treeAge", icon: "fa-clock", label: "Ağaç Yaşı" },
    { key: "waterStatus", icon: "fa-droplet", label: "Su" },
    { key: "electricityStatus", icon: "fa-bolt", label: "Elektrik" },
    { key: "house", icon: "fa-house", label: "Ev" },
    { key: "exchange", icon: "fa-right-left", label: "Takas" },
    { key: "shareStatus", icon: "fa-chart-pie", label: "Hisseli" },
  ],
  // HOBİ BAHÇESİ: m², Su, Elektrik, Ağaç Sayısı, Yol, Ev, Takas, Hisseli
  HOBBY_GARDEN: [
    { key: "_area", icon: "fa-ruler-combined", label: "m²" },
    { key: "waterStatus", icon: "fa-droplet", label: "Su" },
    { key: "electricityStatus", icon: "fa-bolt", label: "Elektrik" },
    { key: "treeCount", icon: "fa-tree", label: "Ağaç Sayısı" },
    { key: "roadStatus", icon: "fa-road", label: "Yol" },
    { key: "house", icon: "fa-house", label: "Ev" },
    { key: "exchange", icon: "fa-right-left", label: "Takas" },
    { key: "shareStatus", icon: "fa-chart-pie", label: "Hisseli" },
  ],
};

// Alt tip etiketleri
const subTypeLabels: Record<string, string> = {
  DAIRE: "Daire", APART: "Apart", MUSTAKIL_EV: "Müstakil Ev", VILLA: "Villa", RESIDENCE: "Residence", YAZLIK: "Yazlık",
  KONUT_ARSASI: "Konut Arsası", TICARI_ARSA: "Ticari Arsa", SANAYI_ARSASI: "Sanayi Arsası", ZEYTINLIK: "Zeytinlik",
  DUKKAN: "Dükkan", DEPO: "Depo", OFIS: "Ofis", ISYERI: "İşyeri", FABRIKA: "Fabrika",
  TARLA: "Tarla", SERA: "Sera", BAG: "Bağ",
  BAHCE: "Bahçe", MEYVELIK: "Meyvelik",
};

// Özellik değerlerini Türkçeleştir
const valueLabels: Record<string, string> = {
  EVET: "Var",
  HAYIR: "Yok",
  true: "Var",
  false: "Yok",
  DOGALGAZ_KOMBI: "Doğalgaz Kombi",
  DOGALGAZ_MERKEZI: "Merkezi",
  MERKEZI_ISITMA: "Merkezi",
  SOBA: "Soba",
  KLIMA: "Klima",
  YERDEN_ISITMA: "Yerden Isıtma",
  ELEKTRIKLI: "Elektrikli",
  YOK: "Yok",
  BOS: "Boş",
  DOLU: "Dolu",
  KIRALIK: "Kiralık",
  KONUT: "Konut",
  TICARI: "Ticari",
  SANAYI: "Sanayi",
  TARIMSAL: "Tarımsal",
  IMARSIZ: "İmarsız",
  VAR: "Var",
  KAT_IRTIFAKI: "Kat İrtifakı",
  KAT_MULKIYETI: "Kat Mülkiyeti",
  HISSELI_TAPU: "Hisseli",
  MUSTEKEL_PARSEL: "Müstakil",
};

export default function ListingDetailClient({ listing }: { listing: Listing }) {
  const settings = useSettings();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showVirtualTourModal, setShowVirtualTourModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);

  // Client tarafında URL'yi al (hydration uyumu için)
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  // Görselleri sırala
  const sortedImages = [...(listing.images || [])].sort((a, b) => {
    if (a.isCover && !b.isCover) return -1;
    if (!a.isCover && b.isCover) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const coverImage = sortedImages.length > 0 ? getImageUrl(sortedImages[0].url) : "/placeholder.jpg";

  // Konum bilgisi
  const locationText = [
    listing.neighborhood?.name,
    listing.district?.name,
    listing.city?.name,
  ].filter(Boolean).join(" / ");

  // WhatsApp mesajı
  const whatsappPhone = listing.consultant?.whatsappNumber || listing.consultant?.contactPhone || listing.branch?.whatsappNumber || listing.branch?.phone || settings.whatsappNumber;
  const whatsappMessage = `Merhaba, ${listing.listingNo} nolu ilanınız hakkında bilgi almak istiyorum.\n\nİlan: ${listing.title}\nLink: ${currentUrl}`;
  const whatsappLink = whatsappPhone
    ? `https://wa.me/${whatsappPhone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`
    : "#";

  // Telefon numarası
  const phoneNumber = listing.consultant?.contactPhone || listing.branch?.phone || settings.phoneNumber;

  // Harita yükleme
  useEffect(() => {
    if (!listing.latitude || !listing.longitude || listing.hideLocation) return;
    if (!mapRef.current) return;

    // Leaflet CSS
    const linkId = "leaflet-css-detail";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Leaflet JS
    const scriptId = "leaflet-js-detail";
    const initMap = () => {
      const L = (window as unknown as { L: typeof import("leaflet") }).L;
      if (!L || !mapRef.current || mapRef.current.dataset.initialized) return;
      
      mapRef.current.dataset.initialized = "true";
      const lat = Number(listing.latitude);
      const lng = Number(listing.longitude);
      
      const map = L.map(mapRef.current).setView([lat, lng], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(map);
      
      L.marker([lat, lng]).addTo(map);
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.body.appendChild(script);
    } else if ((window as unknown as { L?: unknown }).L) {
      initMap();
    }
  }, [listing.latitude, listing.longitude, listing.hideLocation]);

  // Özellik listesi oluştur (kategori bazlı)
  const getFeatures = () => {
    const features: { icon: string; label: string; value: string }[] = [];
    const attrs = (listing.attributes || {}) as Record<string, unknown>;
    const category = listing.category || "HOUSING";
    
    // Kategori için tanımlı özellikleri al
    const configList = categoryFeatureConfig[category] || categoryFeatureConfig.HOUSING;
    
    for (const config of configList) {
      let value: unknown = null;
      
      // Özel key'ler
      if (config.key === "_area") {
        // m² - brüt veya net alan göster
        if (listing.areaGross) {
          value = `${listing.areaGross}`;
          if (listing.areaNet) {
            value = `${listing.areaGross} / ${listing.areaNet}`;
          }
        } else if (listing.areaNet) {
          value = `${listing.areaNet}`;
        }
      } else if (config.key === "_subType") {
        // Alt tip
        if (listing.subPropertyType) {
          value = subTypeLabels[listing.subPropertyType] || listing.subPropertyType;
        }
      } else if (config.key === "floorLocation") {
        // Kat gösterimi: Kat/Toplam Kat
        const floor = attrs.floorLocation;
        const total = attrs.totalFloors;
        if (floor) {
          value = total ? `${floor}/${total}` : floor;
        }
      } else {
        // Normal attribute key
        value = attrs[config.key];
      }
      
      // Değer yoksa atla
      if (value === null || value === undefined || value === "" || value === false || value === "Yok" || value === "Hayır") {
        continue;
      }
      
      // Boolean değerleri "Var" olarak göster
      if (value === true || value === "Evet" || value === "Var") {
        value = "Var";
      }
      
      // Array ise birleştir
      if (Array.isArray(value)) {
        value = value.join(", ");
      }
      
      // Değeri string'e çevir
      let displayValue = String(value);
      
      // Özel format: valueLabels'tan bak
      if (valueLabels[displayValue]) {
        displayValue = valueLabels[displayValue];
      }
      
      features.push({ 
        icon: config.icon, 
        label: config.label, 
        value: displayValue 
      });
    }
    
    return features;
  };

  const features = getFeatures();

  // Paylaşım fonksiyonları
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(listing.title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${listing.title}\n${currentUrl}`)}`,
  };

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="listing-detail-page">
      {/* Breadcrumb */}
      <div className="container" style={{ paddingTop: 20 }}>
        <nav className="breadcrumb" style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 16 }}>
          <Link href="/" style={{ color: "var(--color-primary)" }}>Ana Sayfa</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/arama" style={{ color: "var(--color-primary)" }}>İlanlar</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span>{listing.title}</span>
        </nav>
      </div>

      <div className="container">
        {/* Hero Gallery */}
        <div className="listing-hero-gallery">
          <div
            className="listing-main-image"
            style={{
              backgroundImage: `url('${getImageUrl(sortedImages[activeImageIndex]?.url) || coverImage}')`,
            }}
            onClick={() => setShowGallery(true)}
          >
            {/* Status Badges */}
            <div className="listing-badges">
              <span className={`badge ${listing.status === "FOR_SALE" ? "badge-sale" : "badge-rent"}`}>
                {listing.status === "FOR_SALE" ? "Satılık" : "Kiralık"}
              </span>
              {listing.isOpportunity && (
                <span className="badge badge-opportunity">Fırsat</span>
              )}
            </div>

            {/* Fullscreen Button */}
            <button className="fullscreen-btn" onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}>
              <i className="fa-solid fa-expand"></i>
            </button>

            {/* Listing Number Badge */}
            <div className="listing-no-badge">
              İlan No: <strong>{listing.listingNo}</strong>
            </div>

            {/* Image Counter */}
            {sortedImages.length > 1 && (
              <div className="image-counter">
                <i className="fa-solid fa-images"></i>
                {activeImageIndex + 1} / {sortedImages.length}
              </div>
            )}

            {/* Navigation Arrows */}
            {sortedImages.length > 1 && (
              <>
                <button
                  className="nav-arrow nav-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
                  }}
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button
                  className="nav-arrow nav-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
                  }}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {sortedImages.length > 1 && (
            <div className="thumbnail-strip">
              {sortedImages.map((img, idx) => (
                <div
                  key={img.id}
                  className={`thumbnail ${idx === activeImageIndex ? "active" : ""}`}
                  style={{ backgroundImage: `url('${getImageUrl(img.url)}')` }}
                  onClick={() => setActiveImageIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Title & Info Section */}
        <div className="listing-info-section">
          <div className="listing-info-header">
            <div className="listing-info-left">
              <h1 className="listing-title">{listing.title}</h1>
              {locationText && (
                <p className="listing-location">
                  <i className="fa-solid fa-location-dot"></i>
                  {locationText}
                </p>
              )}
              {listing.branch && (
                <p className="listing-branch">
                  <i className="fa-solid fa-building"></i>
                  {listing.branch.name}
                </p>
              )}
            </div>
            <div className="listing-info-right">
              <div className="listing-price">
                {formatPrice(listing.price, listing.currency)}
              </div>
              {listing.areaGross && (
                <div className="listing-price-per-m2">
                  {formatPrice(Math.round(listing.price / Number(listing.areaGross)), listing.currency)} / m²
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="listing-actions">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="action-btn action-whatsapp">
              <i className="fa-brands fa-whatsapp"></i>
              WhatsApp
            </a>
            <a href={`tel:${phoneNumber}`} className="action-btn action-call">
              <i className="fa-solid fa-phone"></i>
              Hemen Ara
            </a>
            <div className="action-btn-wrapper">
              <button className="action-btn action-share" onClick={() => setShowShareMenu(!showShareMenu)}>
                <i className="fa-solid fa-share-nodes"></i>
                Paylaş
              </button>
              {showShareMenu && (
                <div className="share-dropdown">
                  <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-facebook"></i> Facebook
                  </a>
                  <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-twitter"></i> Twitter
                  </a>
                  <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-whatsapp"></i> WhatsApp
                  </a>
                  <button onClick={copyLink}>
                    <i className="fa-solid fa-link"></i> {copied ? "Kopyalandı!" : "Link Kopyala"}
                  </button>
                </div>
              )}
            </div>
            <button className="action-btn action-print" onClick={() => window.print()}>
              <i className="fa-solid fa-print"></i>
              Yazdır
            </button>
          </div>

          {/* Media Buttons (Video & Virtual Tour) */}
          {(listing.videoUrl || listing.virtualTourUrl) && (
            <div className="listing-media-buttons">
              {listing.videoUrl && (
                <button className="media-btn media-video" onClick={() => setShowVideoModal(true)}>
                  <i className="fa-solid fa-play-circle"></i>
                  Video İzle
                </button>
              )}
              {listing.virtualTourUrl && (
                <button className="media-btn media-tour" onClick={() => setShowVirtualTourModal(true)}>
                  <i className="fa-solid fa-vr-cardboard"></i>
                  Daireyi Canlı Gez
                </button>
              )}
            </div>
          )}
        </div>

        {/* Features Grid */}
        {features.length > 0 && (
          <div className="listing-features-section">
            <h2 className="section-title">
              <i className="fa-solid fa-list-check"></i>
              Özellikler
            </h2>
            <div className="features-grid">
              {features.map((feat, idx) => (
                <div key={idx} className="feature-item">
                  <i className={`fa-solid ${feat.icon}`}></i>
                  <div className="feature-content">
                    <span className="feature-label">{feat.label}</span>
                    <span className="feature-value">{feat.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {listing.description && (
          <div className="listing-description-section">
            <h2 className="section-title">
              <i className="fa-solid fa-align-left"></i>
              Açıklama
            </h2>
            <div className="description-content">
              {listing.description}
            </div>
          </div>
        )}

        {/* Map Section - Konum varsa göster */}
        {listing.latitude && listing.longitude && !listing.hideLocation && (
          <div className="listing-map-section">
            <h2 className="section-title">
              <i className="fa-solid fa-map-location-dot"></i>
              Konum
            </h2>
            <div ref={mapRef} className="listing-map"></div>
            {listing.googleMapsUrl && (
              <a href={listing.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="google-maps-link">
                <i className="fa-solid fa-external-link-alt"></i>
                Google Maps&apos;te Aç
              </a>
            )}
          </div>
        )}

        {/* Contact Section */}
        <div className="listing-contact-section">
          <h2 className="section-title">
            <i className="fa-solid fa-address-card"></i>
            İletişim
          </h2>
          <div className="contact-grid">
            {listing.consultant && (
              <div className="contact-card">
                <div className="contact-avatar">
                  {listing.consultant.photoUrl ? (
                    <img src={getImageUrl(listing.consultant.photoUrl)} alt={listing.consultant.user?.name || "Danışman"} />
                  ) : (
                    <i className="fa-solid fa-user"></i>
                  )}
                </div>
                <div className="contact-info">
                  <h3>{listing.consultant.user?.name}</h3>
                  <p>{listing.consultant.title || "Gayrimenkul Danışmanı"}</p>
                  {listing.consultant.contactPhone && (
                    <a href={`tel:${listing.consultant.contactPhone}`}>
                      <i className="fa-solid fa-phone"></i>
                      {listing.consultant.contactPhone}
                    </a>
                  )}
                </div>
              </div>
            )}
            {listing.branch && (
              <div className="contact-card">
                <div className="contact-avatar branch-avatar">
                  <i className="fa-solid fa-building"></i>
                </div>
                <div className="contact-info">
                  <h3>{listing.branch.name}</h3>
                  {listing.branch.address && <p>{listing.branch.address}</p>}
                  {listing.branch.phone && (
                    <a href={`tel:${listing.branch.phone}`}>
                      <i className="fa-solid fa-phone"></i>
                      {listing.branch.phone}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="contact-form-btn" onClick={() => setShowContactForm(true)}>
            <i className="fa-solid fa-envelope"></i>
            Bilgi İste
          </button>
        </div>
      </div>

      {/* Fullscreen Gallery Modal */}
      {showGallery && (
        <div className="modal-overlay" onClick={() => setShowGallery(false)}>
          <button className="modal-close" onClick={() => setShowGallery(false)}>
            <i className="fa-solid fa-times"></i>
          </button>
          <img
            src={getImageUrl(sortedImages[activeImageIndex]?.url) || coverImage}
            alt={listing.title}
            className="modal-image"
            onClick={(e) => e.stopPropagation()}
          />
          {sortedImages.length > 1 && (
            <>
              <button
                className="modal-nav modal-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
                }}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                className="modal-nav modal-next"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
                }}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
              <div className="modal-counter">
                {activeImageIndex + 1} / {sortedImages.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && listing.videoUrl && (
        <div className="modal-overlay" onClick={() => setShowVideoModal(false)}>
          <button className="modal-close" onClick={() => setShowVideoModal(false)}>
            <i className="fa-solid fa-times"></i>
          </button>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <video src={listing.videoUrl} controls autoPlay className="video-player" />
          </div>
        </div>
      )}

      {/* Virtual Tour Modal */}
      {showVirtualTourModal && listing.virtualTourUrl && (
        <div className="modal-overlay" onClick={() => setShowVirtualTourModal(false)}>
          <button className="modal-close" onClick={() => setShowVirtualTourModal(false)}>
            <i className="fa-solid fa-times"></i>
          </button>
          <div className="tour-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Kendi sunucumuzdan yüklenen dosyalar */}
            {listing.virtualTourUrl.startsWith("/uploads/") ? (
              <>
                {listing.virtualTourType === "VIDEO_360" || listing.virtualTourUrl.match(/\.(mp4|webm|mov)$/i) ? (
                  // 360 Video Player
                  <video 
                    src={`${API_BASE_URL}${listing.virtualTourUrl}`} 
                    controls 
                    autoPlay 
                    className="tour-video-player"
                  />
                ) : (
                  // 360 Panorama - basit görüntüleme (tam 360 viewer için ek kütüphane gerekir)
                  <div className="panorama-viewer">
                    <img 
                      src={`${API_BASE_URL}${listing.virtualTourUrl}`} 
                      alt="360° Panorama" 
                      className="panorama-image"
                    />
                    <div className="panorama-hint">
                      <i className="fa-solid fa-hand-pointer"></i>
                      360° panoramayı görüntülemek için resmi sürükleyin
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Harici URL - iframe ile göster
              <iframe
                src={listing.virtualTourUrl}
                title="Sanal Tur"
                frameBorder="0"
                allowFullScreen
                className="tour-iframe"
              />
            )}
            {!listing.virtualTourUrl.startsWith("/uploads/") && (
              <a href={listing.virtualTourUrl} target="_blank" rel="noopener noreferrer" className="tour-external-link">
                <i className="fa-solid fa-external-link-alt"></i>
                Yeni Sekmede Aç
              </a>
            )}
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="modal-overlay modal-form-overlay" onClick={() => setShowContactForm(false)}>
          <div className="contact-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Bilgi İste</h3>
              <button onClick={() => setShowContactForm(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Talebiniz alındı! En kısa sürede size dönüş yapılacaktır.");
                setShowContactForm(false);
              }}
            >
              <input className="form-input" placeholder="Adınız Soyadınız" required />
              <input className="form-input" type="tel" placeholder="Telefon Numaranız" required />
              <input className="form-input" type="email" placeholder="E-posta Adresiniz" />
              <textarea
                className="form-input"
                placeholder="Mesajınız..."
                rows={4}
                defaultValue={`Merhaba, "${listing.title}" (İlan No: ${listing.listingNo}) hakkında bilgi almak istiyorum.`}
              />
              <button type="submit" className="btn">
                <i className="fa-solid fa-paper-plane"></i>
                Gönder
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .listing-detail-page {
          padding-bottom: 60px;
        }

        /* Hero Gallery */
        .listing-hero-gallery {
          margin-bottom: 24px;
        }

        .listing-main-image {
          width: 100%;
          height: 500px;
          background-size: cover;
          background-position: center;
          border-radius: 16px;
          position: relative;
          cursor: pointer;
        }

        .listing-badges {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .badge {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .badge-sale { background: #dc2626; color: #fff; }
        .badge-rent { background: #f59e0b; color: #000; }
        .badge-opportunity { background: #10b981; color: #fff; }

        .fullscreen-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: rgba(255,255,255,0.9);
          border: none;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .fullscreen-btn:hover { background: #fff; transform: scale(1.05); }

        .listing-no-badge {
          position: absolute;
          bottom: 16px;
          right: 16px;
          padding: 10px 18px;
          background: rgba(0,0,0,0.8);
          color: #fff;
          border-radius: 8px;
          font-size: 14px;
          backdrop-filter: blur(4px);
        }

        .listing-no-badge strong {
          font-weight: 700;
          margin-left: 4px;
        }

        .image-counter {
          position: absolute;
          bottom: 16px;
          left: 16px;
          padding: 8px 16px;
          background: rgba(0,0,0,0.7);
          color: #fff;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: none;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .nav-arrow:hover { background: #fff; transform: translateY(-50%) scale(1.1); }
        .nav-prev { left: 16px; }
        .nav-next { right: 16px; }

        .thumbnail-strip {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .thumbnail {
          width: 80px;
          height: 60px;
          border-radius: 8px;
          background-size: cover;
          background-position: center;
          cursor: pointer;
          border: 3px solid transparent;
          opacity: 0.7;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .thumbnail.active, .thumbnail:hover {
          border-color: var(--color-primary);
          opacity: 1;
        }

        /* Info Section */
        .listing-info-section {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          margin-bottom: 24px;
        }

        .listing-info-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .listing-no {
          font-size: 13px;
          color: var(--color-muted);
          margin-bottom: 8px;
        }

        .listing-no strong {
          color: var(--color-primary);
          font-size: 15px;
        }

        .listing-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-text);
          margin: 0 0 12px 0;
          line-height: 1.3;
        }

        .listing-location, .listing-branch {
          font-size: 14px;
          color: var(--color-muted);
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 4px 0;
        }

        .listing-location i, .listing-branch i {
          color: var(--color-primary);
        }

        .listing-price {
          font-size: 36px;
          font-weight: 800;
          color: var(--color-primary);
          text-align: right;
        }

        .listing-price-per-m2 {
          font-size: 14px;
          color: var(--color-muted);
          text-align: right;
          margin-top: 4px;
        }

        /* Action Buttons */
        .listing-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          padding-top: 20px;
          border-top: 1px solid var(--color-border);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }

        .action-whatsapp {
          background: #25D366;
          color: #fff;
        }
        .action-whatsapp:hover { background: #1da851; }

        .action-call {
          background: var(--color-primary);
          color: #fff;
        }
        .action-call:hover { opacity: 0.9; }

        .action-share, .action-print {
          background: #f3f4f6;
          color: var(--color-text);
        }
        .action-share:hover, .action-print:hover { background: #e5e7eb; }

        .action-btn-wrapper {
          position: relative;
        }

        .share-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 8px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          z-index: 100;
          min-width: 160px;
          overflow: hidden;
        }

        .share-dropdown a, .share-dropdown button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          width: 100%;
          border: none;
          background: none;
          text-align: left;
          font-size: 14px;
          color: var(--color-text);
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s;
        }

        .share-dropdown a:hover, .share-dropdown button:hover {
          background: #f3f4f6;
        }

        /* Media Buttons */
        .listing-media-buttons {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .media-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          border: 2px solid;
          cursor: pointer;
          transition: all 0.2s;
        }

        .media-video {
          background: #fff;
          border-color: #dc2626;
          color: #dc2626;
        }
        .media-video:hover { background: #dc2626; color: #fff; }

        .media-tour {
          background: #fff;
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
        .media-tour:hover { background: var(--color-primary); color: #fff; }

        /* Features Section */
        .listing-features-section, .listing-description-section, .listing-map-section, .listing-contact-section {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--color-text);
        }

        .section-title i {
          color: var(--color-primary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: #f8fafc;
          border-radius: 10px;
        }

        .feature-item i {
          font-size: 20px;
          color: var(--color-primary);
          width: 24px;
          text-align: center;
        }

        .feature-content {
          display: flex;
          flex-direction: column;
        }

        .feature-label {
          font-size: 12px;
          color: var(--color-muted);
        }

        .feature-value {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text);
        }

        /* Description */
        .description-content {
          font-size: 15px;
          line-height: 1.8;
          color: #4b5563;
          white-space: pre-wrap;
        }

        /* Map */
        .listing-map {
          height: 350px;
          border-radius: 12px;
          overflow: hidden;
        }

        .google-maps-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          font-size: 14px;
          color: var(--color-primary);
          text-decoration: none;
        }

        .google-maps-link:hover { text-decoration: underline; }

        /* Contact Section */
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .contact-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .contact-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .contact-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .contact-avatar i {
          font-size: 24px;
          color: #9ca3af;
        }

        .branch-avatar {
          background: var(--color-primary);
        }

        .branch-avatar i {
          color: #fff;
        }

        .contact-info h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .contact-info p {
          font-size: 13px;
          color: var(--color-muted);
          margin: 0 0 8px 0;
        }

        .contact-info a {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--color-primary);
          text-decoration: none;
        }

        .contact-form-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px 24px;
          background: var(--color-primary);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .contact-form-btn:hover { opacity: 0.9; }

        /* Modals */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.95);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-form-overlay {
          background: rgba(0,0,0,0.5);
          padding: 20px;
        }

        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 20px;
          z-index: 10;
        }

        .modal-image {
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
        }

        .modal-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 24px;
        }

        .modal-prev { left: 20px; }
        .modal-next { right: 20px; }

        .modal-counter {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 10px 20px;
          background: rgba(0,0,0,0.7);
          color: #fff;
          border-radius: 8px;
          font-size: 16px;
        }

        /* Video Modal */
        .video-modal-content {
          width: 90vw;
          max-width: 900px;
        }

        .video-player {
          width: 100%;
          border-radius: 12px;
        }

        /* Tour Modal */
        .tour-modal-content {
          width: 90vw;
          height: 80vh;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tour-iframe {
          width: 100%;
          flex: 1;
          border-radius: 12px;
        }

        .tour-video-player {
          width: 100%;
          max-height: 80vh;
          border-radius: 12px;
        }

        .panorama-viewer {
          position: relative;
          width: 100%;
          flex: 1;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
        }

        .panorama-image {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
          cursor: grab;
        }

        .panorama-image:active {
          cursor: grabbing;
        }

        .panorama-hint {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 10px 20px;
          background: rgba(0,0,0,0.7);
          color: #fff;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tour-external-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
        }

        /* Contact Form Modal */
        .contact-form-modal {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 480px;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--color-border);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .modal-header button {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: var(--color-muted);
        }

        .contact-form-modal form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-input {
          padding: 14px 16px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 15px;
          width: 100%;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .listing-main-image {
            height: 300px;
            border-radius: 0;
          }

          .listing-info-header {
            flex-direction: column;
          }

          .listing-price {
            text-align: left;
            font-size: 28px;
          }

          .listing-title {
            font-size: 22px;
          }

          .listing-actions {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
            justify-content: center;
          }

          .listing-media-buttons {
            flex-direction: column;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media print {
          .listing-actions, .listing-media-buttons, .contact-form-btn, .nav-arrow, .fullscreen-btn {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
