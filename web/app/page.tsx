"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSettings } from "./components/SettingsProvider";
import { getListingFeatures } from "../lib/listings";

// Dynamic import for map to avoid SSR issues
const ListingsMap = dynamic(() => import("./components/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="map-placeholder">
      <i className="fa-solid fa-spinner fa-spin"></i>
      <p>Harita yükleniyor...</p>
    </div>
  ),
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/** Production'da localhost URL'lerini API base URL ile değiştirir; relative path'leri tam URL yapar */
function fullImageUrl(url: string | null | undefined): string {
  if (!url || !url.trim()) return "";
  const base = API_BASE_URL.replace(/\/$/, "");
  if (/^https?:\/\//i.test(url)) {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url))
      return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?/i, base + "/");
    return url;
  }
  return url.startsWith("/") ? base + url : base + "/" + url;
}

type CityButton = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  icon?: string | null;
  iconColor?: string | null;
  bgColor?: string | null;
  borderColor?: string | null;
  city?: { name: string; slug: string } | null;
};

type Banner = {
  id: string;
  title?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  position: string;
};

type ActionButton = {
  id: string;
  name: string;
  linkUrl: string;
  imageUrl?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  icon?: string | null;
  order?: number;
};

type Listing = {
  id: string;
  title: string;
  listingNo?: string | null;
  status: "FOR_SALE" | "FOR_RENT";
  category: string;
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
  price?: number | string | null;
  currency?: string;
  areaGross?: number | string | null;
  isOpportunity?: boolean;
  attributes?: Record<string, unknown>;
  city?: { name: string } | null;
  district?: { name: string } | null;
  neighborhood?: { name: string } | null;
  images?: { url: string; isCover?: boolean }[];
  latitude?: number | string | null;
  longitude?: number | string | null;
};

export default function Home() {
  const settings = useSettings();
  const [cityButtons, setCityButtons] = useState<CityButton[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Mobil algılama
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Load all data in parallel
    Promise.all([
      fetch(`${API_BASE_URL}/city-buttons`).then(res => res.json()).catch(() => []),
      fetch(`${API_BASE_URL}/banners?position=home-top`).then(res => res.json()).catch(() => []),
      fetch(`${API_BASE_URL}/action-buttons`).then(res => res.json()).catch(() => []),
      fetch(`${API_BASE_URL}/listings?limit=9&sort=createdAt&order=desc`).then(res => res.json()).catch(() => [])
    ]).then(([cityData, bannerData, actionData, listingData]) => {
      setCityButtons(Array.isArray(cityData) ? cityData : []);
      setBanners(Array.isArray(bannerData) ? bannerData : []);
      setActionButtons(Array.isArray(actionData) ? actionData : []);
      setRecentListings(Array.isArray(listingData) ? listingData : listingData.items || []);
    }).catch(() => {});
  }, []);

  const heroImageRaw = settings.heroBackgroundUrl || banners[0]?.imageUrl || "";

  // Action buttons - API'den gelenler kullanılır, yoksa varsayılanlar gösterilir
  const defaultActions: ActionButton[] = [
    { id: "default-1", name: "SATMAK İSTİYORUM", linkUrl: "/satilik-kiralik-talep?type=SELL", bgColor: "#f97316", icon: "fa-solid fa-house" },
    { id: "default-2", name: "EVİM NE KADAR EDER?", linkUrl: "/evim-ne-kadar-eder", bgColor: "#0a4ea3", icon: "fa-solid fa-calculator" },
    { id: "default-3", name: "DEĞER ARTIŞ VERGİSİ", linkUrl: "https://ivd.gib.gov.tr/", bgColor: "#2f9e44", icon: "fa-solid fa-receipt" },
  ];

  // API'den buton varsa sadece onları göster, yoksa varsayılanları göster
  const actions = actionButtons.length > 0 ? actionButtons : defaultActions;

  // Get cover image for a listing (production'da API URL ile)
  const getCoverImage = (listing: Listing) => {
    if (!listing.images || listing.images.length === 0) return "/placeholder-house.jpg";
    const cover = listing.images.find((img) => img.isCover) || listing.images[0];
    return fullImageUrl(cover.url) || "/placeholder-house.jpg";
  };

  // Format price
  const formatPrice = (price: number | string | null | undefined, currency = "TRY") => {
    if (!price) return "Fiyat Sorunuz";
    const num = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 0 }).format(num);
  };

  // Get listing location text
  const getLocationText = (listing: Listing) => {
    const parts = [listing.city?.name, listing.district?.name, listing.neighborhood?.name].filter(Boolean);
    return parts.join(" / ") || "Türkiye";
  };


  // Resolve image URL (handle relative paths)
  const resolveImageUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    // For paths starting with /uploads/, prepend API_BASE_URL
    if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
    if (url.startsWith("/")) return url;
    return `${API_BASE_URL}/${url}`;
  };

  // Hero image resolved
  const heroImage = resolveImageUrl(heroImageRaw) || "";
  
  // Profil resmi URL
  const profileImageUrl = resolveImageUrl(settings.profileImageUrl);
  
  // Debug log - detaylı
  if (typeof window !== "undefined") {
    console.log("=== ANA SAYFA DEBUG ===");
    console.log("Hero BG URL:", settings.heroBackgroundUrl);
    console.log("Profile Image URL:", settings.profileImageUrl);
    console.log("Banners count:", banners.length);
    console.log("Resolved hero:", heroImage);
    console.log("Resolved profile:", profileImageUrl);
    console.log("City buttons:", cityButtons.length);
    console.log("======================");
  }

  // Build main background style with opacity
  const mainBgStyle: React.CSSProperties = {};
  const mainOpacity = settings.mainBgOpacity ?? 1;
  const mainBgUrl = resolveImageUrl(settings.mainBgImage);
  
  if (mainBgUrl) {
    mainBgStyle.backgroundImage = `url('${mainBgUrl}')`;
    mainBgStyle.backgroundSize = "cover";
    mainBgStyle.backgroundPosition = "center";
    mainBgStyle.backgroundAttachment = "fixed";
    mainBgStyle.backgroundRepeat = "no-repeat";
  }
  if (settings.mainBgColor) {
    mainBgStyle.backgroundColor = settings.mainBgColor;
  }

  // Build banner style with opacity (görsel yoksa varsayılan gradient)
  const bannerOpacity = settings.bannerOpacity ?? 1;
  const bannerStyle: React.CSSProperties = {
    ["--banner-image" as string]: heroImage ? `url('${heroImage}')` : "none",
    ...(!heroImage ? { background: "linear-gradient(135deg, #0a4ea3 0%, #1a436e 100%)" } : {}),
  };
  if (settings.bannerWidth) {
    bannerStyle.maxWidth = `${settings.bannerWidth}px`;
    bannerStyle.margin = "0 auto";
  }
  if (settings.bannerHeight) {
    bannerStyle.height = `${settings.bannerHeight}px`;
  }
  if (bannerOpacity < 1) {
    bannerStyle.opacity = bannerOpacity;
  }
  
  // Profile image style with opacity and positioning
  const profileStyle: React.CSSProperties = {};
  const profileOpacity = settings.profileOpacity ?? 1;
  if (settings.profileImageWidth) {
    profileStyle.width = `${settings.profileImageWidth}px`;
  }
  if (settings.profileImageHeight) {
    profileStyle.height = `${settings.profileImageHeight}px`;
  }
  if (settings.profilePositionX) {
    profileStyle.marginLeft = `${settings.profilePositionX}px`;
  }
  if (settings.profilePositionY) {
    profileStyle.marginTop = `${settings.profilePositionY}px`;
  }
  if (profileOpacity < 1) {
    profileStyle.opacity = profileOpacity;
  }

  return (
    <div className="page home-page" style={mainBgStyle}>
      <section className="hero">
        {/* Banner with content */}
        <div className="banner" style={bannerStyle}>
          {/* Banner sadece arka plan resmi gösterir - içerik yok */}
        </div>
      </section>

      {/* Section Title - Centered below banner */}
      <h2
        className="home-section-title"
        style={{
          color: settings.sectionTitleColor || undefined,
          fontFamily: settings.sectionTitleFont || undefined,
          fontSize: settings.sectionTitleSize ? `${settings.sectionTitleSize}px` : undefined,
        }}
      >
        {settings.branchSectionTitle || "Şube İlanları"}
      </h2>

      <main id="subeler" className="section">
        <div
          className="branches"
          style={isMobile ? undefined : {
            gap: settings.homeCityBtnGap ? `${settings.homeCityBtnGap}px` : undefined,
            justifyContent: settings.homeCityBtnAlign === "left" ? "flex-start" : settings.homeCityBtnAlign === "right" ? "flex-end" : "center",
          }}
        >
          {cityButtons.map((btn) => (
            <Link
              key={btn.id}
              href={`/subeler/${btn.slug}`}
              className="branch-btn"
              aria-label={`${btn.name} ilanlarını görüntüle`}
              style={isMobile ? undefined : {
                width: settings.homeCityBtnWidth ? `${settings.homeCityBtnWidth}px` : undefined,
                height: settings.homeCityBtnHeight ? `${settings.homeCityBtnHeight}px` : undefined,
                borderRadius: settings.homeCityBtnBorderRadius ? `${settings.homeCityBtnBorderRadius}px` : undefined,
              }}
            >
                <div
                  className="branch-media"
                  style={{
                    backgroundImage: btn.imageUrl ? `url('${fullImageUrl(btn.imageUrl)}')` : undefined,
                    borderRadius: !isMobile && settings.homeCityBtnBorderRadius ? `${settings.homeCityBtnBorderRadius}px` : undefined,
                  }}
                />
              <div
                className="branch-overlay"
                style={{
                  borderRadius: !isMobile && settings.homeCityBtnBorderRadius ? `${settings.homeCityBtnBorderRadius}px` : undefined,
                }}
              />
              <div className="branch-content">
                {settings.cityBtnShowBadge !== false && (
                  <div
                    className="branch-chip"
                    style={{
                      color: settings.cityBtnBadgeColor || btn.iconColor || undefined,
                      backgroundColor: settings.cityBtnBadgeBgColor || undefined,
                    }}
                  >
                    <i className={settings.cityBtnBadgeIcon || btn.icon || "fa-solid fa-location-dot"} aria-hidden="true"></i>
                    {settings.cityBtnBadgeText || "Şube"}
                  </div>
                )}
                <p
                  className="branch-title"
                  style={{
                    color: settings.cityBtnTitleColor || undefined,
                    fontSize: settings.cityBtnTitleSize ? `${settings.cityBtnTitleSize}px` : undefined,
                    fontFamily: settings.cityBtnTitleFont || undefined,
                  }}
                >
                  {btn.name}
                </p>
                <p
                  className="branch-meta"
                  style={{
                    color: settings.cityBtnSubtitleColor || undefined,
                    fontSize: settings.cityBtnSubtitleSize ? `${settings.cityBtnSubtitleSize}px` : undefined,
                  }}
                >
                  İlanları Gör
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div
          className="action-buttons"
          style={{
            gap: settings.homeActionBtnGap ? `${settings.homeActionBtnGap}px` : undefined,
          }}
        >
          {actions.map((action) => (
            <a
              key={action.id}
              href={action.linkUrl}
              className="action-btn"
              target={action.linkUrl.startsWith("http") ? "_blank" : undefined}
              rel={action.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{
                backgroundColor: action.bgColor || "#0a4ea3",
                color: action.textColor || "#ffffff",
                width: settings.homeActionBtnWidth ? `${settings.homeActionBtnWidth}px` : undefined,
                height: settings.homeActionBtnHeight ? `${settings.homeActionBtnHeight}px` : undefined,
                borderRadius: settings.homeActionBtnBorderRadius ? `${settings.homeActionBtnBorderRadius}px` : undefined,
                fontSize: settings.homeActionBtnFontSize ? `${settings.homeActionBtnFontSize}px` : undefined,
              }}
            >
              {action.imageUrl ? (
                <img src={action.imageUrl} alt="" className="action-btn-img" />
              ) : action.icon ? (
                <i className={action.icon} aria-hidden="true"></i>
              ) : null}
              {action.name}
            </a>
          ))}
        </div>

        {/* Map Module */}
        <section className="map-section">
          <h3 className="map-title">
            <i className="fa-solid fa-map-location-dot"></i>
            İlan Haritası
          </h3>
          <div className="map-container">
            <div className="listings-map">
              <ListingsMap listings={recentListings} />
            </div>
          </div>
        </section>

        {/* Recent Listings */}
        <section className="recent-listings">
          <h3
            className="recent-title"
            style={{
              justifyContent: "center",
              color: settings.sectionTitleColor || undefined,
              fontFamily: settings.sectionTitleFont || undefined,
              fontSize: settings.sectionTitleSize ? `${settings.sectionTitleSize}px` : undefined,
            }}
          >
            {settings.recentListingsTitle || "Son Yüklenen İlanlar"}
          </h3>
          <div className="listings-grid">
            {recentListings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`} className="listing-card">
                <div className="listing-image" style={{ backgroundImage: `url('${getCoverImage(listing)}')` }}>
                  <div className="listing-labels-top">
                    <span className={`listing-status ${listing.status === "FOR_SALE" ? "for-sale" : "for-rent"}`}>
                      {listing.status === "FOR_SALE" ? "Satılık" : "Kiralık"}
                    </span>
                    {listing.isOpportunity && <span className="listing-opportunity">Fırsat</span>}
                  </div>
                  {listing.listingNo && <span className="listing-no">#{listing.listingNo}</span>}
                </div>
                <div className="listing-info">
                  {/* Price - moved below image */}
                  <div className="listing-price-tag">{formatPrice(listing.price, listing.currency)}</div>
                  <h4 className="listing-title">{listing.title}</h4>
                  <p className="listing-location">
                    <i className="fa-solid fa-location-dot"></i>
                    {getLocationText(listing)}
                  </p>
                  <div className="listing-features">
                    {getListingFeatures(listing).map((feat, fidx) => (
                      <div key={fidx} className="listing-feature" title={feat.title}>
                        <i className={`fa-solid ${feat.icon}`}></i>
                        <span>{feat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {recentListings.length > 0 && (
            <div className="listings-more">
              <Link
                href="/arama"
                className="btn-view-all"
                style={{
                  backgroundColor: settings.viewAllBtnBgColor || undefined,
                  color: settings.viewAllBtnTextColor || undefined,
                }}
              >
                {settings.viewAllBtnText || "Tüm İlanları Gör"}
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
