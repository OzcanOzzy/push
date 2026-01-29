"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSettings } from "./components/SettingsProvider";

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
  status: "FOR_SALE" | "FOR_RENT";
  category: string;
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

  const heroImage = settings.heroBackgroundUrl || banners[0]?.imageUrl || "";

  // Default action buttons - always show these plus any from API
  const defaultActions: ActionButton[] = [
    { id: "default-1", name: "SATMAK İSTİYORUM", linkUrl: "/requests/customer?type=SELL", bgColor: "#f97316", icon: "fa-solid fa-house" },
    { id: "default-2", name: "EVİM NE KADAR EDER?", linkUrl: "/requests/customer?type=VALUATION", bgColor: "#0a4ea3", icon: "fa-solid fa-calculator" },
    { id: "default-3", name: "DEĞER ARTIŞ VERGİSİ", linkUrl: "https://ivd.gib.gov.tr/", bgColor: "#2f9e44", icon: "fa-solid fa-receipt" },
  ];

  // Combine default actions with API actions
  const actions = [...defaultActions, ...actionButtons];

  // Get cover image for a listing
  const getCoverImage = (listing: Listing) => {
    if (!listing.images || listing.images.length === 0) return "/placeholder-house.jpg";
    const cover = listing.images.find((img) => img.isCover) || listing.images[0];
    return cover.url;
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

  // Get listing features as icons
  const getListingFeatures = (listing: Listing) => {
    const attrs = listing.attributes as Record<string, unknown> || {};
    const features = [];
    
    if (attrs.roomCount) features.push({ icon: "fa-solid fa-door-open", value: `${attrs.roomCount} Oda` });
    if (attrs.bathroomCount) features.push({ icon: "fa-solid fa-bath", value: `${attrs.bathroomCount} Banyo` });
    if (listing.areaGross) features.push({ icon: "fa-solid fa-ruler-combined", value: `${listing.areaGross} m²` });
    if (attrs.floorNumber) features.push({ icon: "fa-solid fa-building", value: `${attrs.floorNumber}. Kat` });
    if (attrs.buildingAge) features.push({ icon: "fa-solid fa-calendar", value: `${attrs.buildingAge} Yaşında` });
    if (attrs.heatingType) features.push({ icon: "fa-solid fa-fire", value: String(attrs.heatingType) });
    
    return features.slice(0, 6);
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

  // Build banner style with opacity
  const bannerOpacity = settings.bannerOpacity ?? 1;
  const bannerStyle: React.CSSProperties = {
    ["--banner-image" as string]: heroImage ? `url('${heroImage}')` : "none",
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
        {/* Banner - just background image, no fixed content */}
        <div className="banner" style={bannerStyle} />
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
              href={`/${btn.slug}`}
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
                  backgroundImage: btn.imageUrl ? `url('${btn.imageUrl}')` : undefined,
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
                  {/* Status Badge */}
                  <span className={`listing-status ${listing.status === "FOR_SALE" ? "for-sale" : "for-rent"}`}>
                    {listing.status === "FOR_SALE" ? "Satılık" : "Kiralık"}
                  </span>
                  {/* Opportunity Badge */}
                  {listing.isOpportunity && <span className="listing-opportunity">Fırsat</span>}
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
                    {getListingFeatures(listing).map((feat, idx) => (
                      <div key={idx} className="listing-feature">
                        <i className={feat.icon}></i>
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
