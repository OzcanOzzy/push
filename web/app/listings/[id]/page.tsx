"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
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
  title: string;
  description: string | null;
  price: number;
  status: "FOR_SALE" | "FOR_RENT";
  propertyType: string;
  isOpportunity: boolean;
  rooms: number | null;
  bathrooms: number | null;
  area: number | null;
  floor: number | null;
  totalFloors: number | null;
  buildingAge: number | null;
  heatingType: string | null;
  furnished: boolean;
  balcony: boolean;
  elevator: boolean;
  parking: boolean;
  garden: boolean;
  pool: boolean;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  images: ListingImage[];
  city?: { name: string } | null;
  district?: { name: string } | null;
  neighborhood?: { name: string } | null;
  branch?: { name: string; phone?: string; whatsappNumber?: string } | null;
  consultant?: { name: string; phone?: string; email?: string; imageUrl?: string } | null;
  createdAt: string;
  updatedAt: string;
};

type ListingLabel = {
  id: string;
  name: string;
  slug: string;
  textColor: string;
  bgColor: string;
  borderRadius: number;
  isRounded: boolean;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ListingDetailPage() {
  const params = useParams();
  const settings = useSettings();
  const [listing, setListing] = useState<Listing | null>(null);
  const [labels, setLabels] = useState<ListingLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadListing(params.id as string);
      loadLabels();
    }
  }, [params.id]);

  const loadListing = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/listings/${id}`);
      if (res.ok) {
        const data = await res.json();
        setListing(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadLabels = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/listing-labels`);
      if (res.ok) {
        const data = await res.json();
        setLabels(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <main className="section">
        <div className="container">
          <div className="card">
            <div className="card-body" style={{ textAlign: "center", padding: 60 }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, marginBottom: 16 }}></i>
              <p>İlan yükleniyor...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="section">
        <div className="container">
          <div className="card">
            <div className="card-body" style={{ textAlign: "center", padding: 60 }}>
              <i className="fa-solid fa-exclamation-triangle" style={{ fontSize: 48, color: "#f59e0b", marginBottom: 16 }}></i>
              <h2 style={{ marginBottom: 12 }}>İlan Bulunamadı</h2>
              <p style={{ color: "var(--color-muted)", marginBottom: 20 }}>
                Aradığınız ilan mevcut değil veya kaldırılmış olabilir.
              </p>
              <Link href="/arama" className="btn">
                <i className="fa-solid fa-search" style={{ marginRight: 8 }}></i>
                Tüm İlanlara Git
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const sortedImages = [...(listing.images || [])].sort((a, b) => {
    if (a.isCover && !b.isCover) return -1;
    if (!a.isCover && b.isCover) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const coverImage = sortedImages.length > 0 ? sortedImages[0].url : "/placeholder.jpg";

  const whatsappLink = listing.consultant?.phone || listing.branch?.whatsappNumber || settings.whatsappNumber
    ? `https://wa.me/${(listing.consultant?.phone || listing.branch?.whatsappNumber || settings.whatsappNumber || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Merhaba, "${listing.title}" ilanı hakkında bilgi almak istiyorum.`)}`
    : "#";

  const locationText = [
    listing.neighborhood?.name,
    listing.district?.name,
    listing.city?.name,
  ].filter(Boolean).join(", ");

  // Property features
  const features = [
    listing.rooms && { icon: "fa-solid fa-door-open", label: "Oda", value: `${listing.rooms}+1` },
    listing.bathrooms && { icon: "fa-solid fa-bath", label: "Banyo", value: listing.bathrooms },
    listing.area && { icon: "fa-solid fa-ruler-combined", label: "Alan", value: `${listing.area} m²` },
    listing.floor !== null && { icon: "fa-solid fa-building", label: "Kat", value: listing.totalFloors ? `${listing.floor}/${listing.totalFloors}` : listing.floor },
    listing.buildingAge && { icon: "fa-solid fa-calendar", label: "Bina Yaşı", value: listing.buildingAge },
    listing.heatingType && { icon: "fa-solid fa-fire", label: "Isıtma", value: listing.heatingType },
  ].filter(Boolean);

  // Amenities
  const amenities = [
    { key: "furnished", label: "Eşyalı", icon: "fa-solid fa-couch" },
    { key: "balcony", label: "Balkon", icon: "fa-solid fa-window-maximize" },
    { key: "elevator", label: "Asansör", icon: "fa-solid fa-elevator" },
    { key: "parking", label: "Otopark", icon: "fa-solid fa-car" },
    { key: "garden", label: "Bahçe", icon: "fa-solid fa-tree" },
    { key: "pool", label: "Havuz", icon: "fa-solid fa-swimming-pool" },
  ];

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
        <div className="listing-detail-grid">
          {/* Left Column - Images & Details */}
          <div className="listing-detail-main">
            {/* Image Gallery */}
            <div className="listing-gallery-wrapper">
              <div
                className="listing-main-image"
                style={{
                  backgroundImage: `url('${sortedImages[activeImageIndex]?.url || coverImage}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: 450,
                  borderRadius: 12,
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={() => setShowGallery(true)}
              >
                {/* Status Badge */}
                <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      padding: "6px 14px",
                      backgroundColor: listing.status === "FOR_SALE" ? "#dc2626" : "#f59e0b",
                      color: listing.status === "FOR_SALE" ? "#fff" : "#000",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {listing.status === "FOR_SALE" ? "Satılık" : "Kiralık"}
                  </span>
                  {listing.isOpportunity && (
                    <span
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "#10b981",
                        color: "#fff",
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Fırsat
                    </span>
                  )}
                  {labels.map((label) => (
                    <span
                      key={label.id}
                      style={{
                        padding: "6px 14px",
                        backgroundColor: label.bgColor,
                        color: label.textColor,
                        borderRadius: label.isRounded ? 999 : label.borderRadius,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>

                {/* Image count badge */}
                {sortedImages.length > 1 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 16,
                      right: 16,
                      padding: "8px 14px",
                      backgroundColor: "rgba(0,0,0,0.7)",
                      color: "#fff",
                      borderRadius: 8,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <i className="fa-solid fa-images"></i>
                    {activeImageIndex + 1} / {sortedImages.length}
                  </div>
                )}

                {/* Navigation arrows */}
                {sortedImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
                      }}
                      style={{
                        position: "absolute",
                        left: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.9)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
                      }}
                      style={{
                        position: "absolute",
                        right: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.9)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {sortedImages.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    overflowX: "auto",
                    paddingBottom: 8,
                  }}
                >
                  {sortedImages.map((img, idx) => (
                    <div
                      key={img.id}
                      onClick={() => setActiveImageIndex(idx)}
                      style={{
                        width: 80,
                        height: 60,
                        borderRadius: 8,
                        backgroundImage: `url('${img.url}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        cursor: "pointer",
                        border: idx === activeImageIndex ? "3px solid var(--color-primary)" : "3px solid transparent",
                        opacity: idx === activeImageIndex ? 1 : 0.7,
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Title & Location */}
            <div style={{ marginTop: 24 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: "var(--color-primary)" }}>
                {listing.title}
              </h1>
              {locationText && (
                <p style={{ color: "var(--color-muted)", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-location-dot"></i>
                  {locationText}
                </p>
              )}
            </div>

            {/* Features Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 16,
                marginTop: 24,
                padding: 20,
                backgroundColor: "#f8fafc",
                borderRadius: 12,
              }}
            >
              {features.map((feature: any, idx) => (
                <div key={idx} style={{ textAlign: "center" }}>
                  <i className={feature.icon} style={{ fontSize: 24, color: "var(--color-primary)", marginBottom: 8, display: "block" }}></i>
                  <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{feature.label}</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{feature.value}</div>
                </div>
              ))}
            </div>

            {/* Amenities */}
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Özellikler</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {amenities.map((amenity) => {
                  const hasAmenity = listing[amenity.key as keyof Listing];
                  return (
                    <div
                      key={amenity.key}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 8,
                        backgroundColor: hasAmenity ? "#dcfce7" : "#f3f4f6",
                        color: hasAmenity ? "#166534" : "#9ca3af",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 14,
                      }}
                    >
                      <i className={amenity.icon}></i>
                      {amenity.label}
                      {hasAmenity && <i className="fa-solid fa-check" style={{ marginLeft: 4 }}></i>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Açıklama</h3>
                <div
                  style={{
                    lineHeight: 1.8,
                    color: "#4b5563",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {listing.description}
                </div>
              </div>
            )}

            {/* Map */}
            {(listing.googleMapsUrl || (listing.latitude && listing.longitude)) && (
              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Konum</h3>
                {listing.address && (
                  <p style={{ color: "var(--color-muted)", marginBottom: 12 }}>
                    <i className="fa-solid fa-location-dot" style={{ marginRight: 8 }}></i>
                    {listing.address}
                  </p>
                )}
                {listing.googleMapsUrl && (
                  <a
                    href={listing.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ marginTop: 8 }}
                  >
                    <i className="fa-solid fa-map" style={{ marginRight: 8 }}></i>
                    Google Maps'te Aç
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Price & Contact */}
          <div className="listing-detail-sidebar">
            {/* Price Card */}
            <div
              className="card"
              style={{
                position: "sticky",
                top: 20,
              }}
            >
              <div className="card-body">
                {/* Price */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>Fiyat</div>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      color: "var(--color-primary)",
                      background: "linear-gradient(135deg, #0a4ea3, #1e40af)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {formatPrice(listing.price)}
                  </div>
                  {listing.area && (
                    <div style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 4 }}>
                      {formatPrice(Math.round(listing.price / listing.area))} / m²
                    </div>
                  )}
                </div>

                {/* Contact Buttons */}
                <div style={{ display: "grid", gap: 12 }}>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      backgroundColor: "#25D366",
                      borderColor: "#25D366",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "14px 20px",
                    }}
                  >
                    <i className="fa-brands fa-whatsapp" style={{ fontSize: 20 }}></i>
                    WhatsApp ile İletişim
                  </a>

                  <a
                    href={`tel:${listing.consultant?.phone || listing.branch?.phone || settings.phoneNumber}`}
                    className="btn btn-outline"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "14px 20px",
                    }}
                  >
                    <i className="fa-solid fa-phone"></i>
                    Hemen Ara
                  </a>

                  <button
                    onClick={() => setShowContactForm(true)}
                    className="btn btn-outline"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "14px 20px",
                    }}
                  >
                    <i className="fa-solid fa-envelope"></i>
                    Bilgi İste
                  </button>
                </div>

                {/* Consultant Info */}
                {listing.consultant && (
                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 20,
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: "50%",
                          backgroundColor: "#e5e7eb",
                          backgroundImage: listing.consultant.imageUrl ? `url('${listing.consultant.imageUrl}')` : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {!listing.consultant.imageUrl && (
                          <i className="fa-solid fa-user" style={{ color: "#9ca3af" }}></i>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{listing.consultant.name}</div>
                        <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Gayrimenkul Danışmanı</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Branch Info */}
                {listing.branch && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: 12,
                      backgroundColor: "#f8fafc",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-muted)" }}>
                      <i className="fa-solid fa-building"></i>
                      {listing.branch.name}
                    </div>
                  </div>
                )}

                {/* Share */}
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: "1px solid var(--color-border)",
                    display: "flex",
                    justifyContent: "center",
                    gap: 12,
                  }}
                >
                  <button
                    onClick={() => navigator.share?.({ title: listing.title, url: window.location.href })}
                    className="btn btn-outline"
                    style={{ padding: "8px 16px", fontSize: 13 }}
                  >
                    <i className="fa-solid fa-share-nodes" style={{ marginRight: 6 }}></i>
                    Paylaş
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="btn btn-outline"
                    style={{ padding: "8px 16px", fontSize: 13 }}
                  >
                    <i className="fa-solid fa-print" style={{ marginRight: 6 }}></i>
                    Yazdır
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Gallery Modal */}
      {showGallery && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.95)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowGallery(false)}
        >
          <button
            onClick={() => setShowGallery(false)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.2)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: 20,
            }}
          >
            <i className="fa-solid fa-times"></i>
          </button>
          <img
            src={sortedImages[activeImageIndex]?.url || coverImage}
            alt={listing.title}
            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
            onClick={(e) => e.stopPropagation()}
          />
          {sortedImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
                }}
                style={{
                  position: "absolute",
                  left: 20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 24,
                }}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
                }}
                style={{
                  position: "absolute",
                  right: 20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 24,
                }}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </>
          )}
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowContactForm(false)}
        >
          <div
            className="card"
            style={{ width: "100%", maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontWeight: 700 }}>Bilgi İste</h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}
                >
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
                <div style={{ display: "grid", gap: 12 }}>
                  <input className="search-input" placeholder="Adınız Soyadınız" required />
                  <input className="search-input" type="tel" placeholder="Telefon Numaranız" required />
                  <input className="search-input" type="email" placeholder="E-posta Adresiniz" />
                  <textarea
                    className="search-input"
                    placeholder="Mesajınız..."
                    rows={4}
                    defaultValue={`Merhaba, "${listing.title}" ilanı hakkında bilgi almak istiyorum.`}
                  />
                  <button type="submit" className="btn" style={{ padding: "14px 20px" }}>
                    <i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i>
                    Gönder
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .listing-detail-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
          margin-top: 20px;
          padding-bottom: 60px;
        }

        @media (max-width: 1024px) {
          .listing-detail-grid {
            grid-template-columns: 1fr;
          }
          .listing-detail-sidebar {
            order: -1;
          }
        }
      `}</style>
    </main>
  );
}
