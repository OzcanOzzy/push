"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSettings } from "./SettingsProvider";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  isActive: boolean;
  textColor?: string | null;
  bgColor?: string | null;
  icon?: string | null;
};

type SocialLink = {
  id: string;
  label: string;
  url: string;
  icon: string;
  isActive: boolean;
};

const defaultNavLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/arama", label: "Tüm ilanlar" },
  { href: "/subeler", label: "Şubeler" },
  { href: "/firsatlar", label: "Fırsatlar" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export default function CorporateHeader() {
  const settings = useSettings();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [socialLinksFromApi, setSocialLinksFromApi] = useState<SocialLink[]>([]);

  useEffect(() => {
    // Load menu items from API
    fetch(`${API_BASE_URL}/menu-items`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMenuItems(data);
        }
      })
      .catch(() => {
        // Use default nav links on error
      });

    // Load social links from API
    fetch(`${API_BASE_URL}/social-links`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSocialLinksFromApi(data);
        }
      })
      .catch(() => {
        // Use default social links on error
      });
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/arama?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = menuItems.length > 0
    ? menuItems.map((item) => ({ href: item.href, label: item.label, textColor: item.textColor, bgColor: item.bgColor, icon: item.icon }))
    : defaultNavLinks;

  const whatsappLink = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`
    : "#";

  // Logo subtitle - now uses separate logoSubtitleText setting
  const showLogoSubtitle = settings.showLogoSubtitle !== false;
  const logoSubtitleText = settings.logoSubtitleText || null;
  
  // Build logo subtitle style
  const logoSubtitleStyle: React.CSSProperties = {};
  if (settings.logoSubtitleFont) {
    logoSubtitleStyle.fontFamily = settings.logoSubtitleFont;
  }
  if (settings.logoSubtitleFontSize) {
    logoSubtitleStyle.fontSize = `${settings.logoSubtitleFontSize}px`;
  }
  if (settings.logoSubtitleColor) {
    logoSubtitleStyle.color = settings.logoSubtitleColor;
  }
  if (settings.logoSubtitleBgColor) {
    logoSubtitleStyle.backgroundColor = settings.logoSubtitleBgColor;
    logoSubtitleStyle.padding = "4px 12px";
    logoSubtitleStyle.borderRadius = "4px";
  }

  // Use API social links if available, otherwise fall back to settings
  const socialLinks = socialLinksFromApi.length > 0
    ? socialLinksFromApi.map((link) => ({ href: link.url, icon: link.icon, label: link.label }))
    : [
        { href: settings.instagramUrl || "#", icon: "fa-brands fa-instagram", label: "Instagram" },
        { href: settings.facebookUrl || "#", icon: "fa-brands fa-facebook-f", label: "Facebook" },
        { href: settings.youtubeUrl || "#", icon: "fa-brands fa-youtube", label: "YouTube" },
        { href: settings.linkedinUrl || "#", icon: "fa-brands fa-linkedin-in", label: "LinkedIn" },
        { href: whatsappLink, icon: "fa-brands fa-whatsapp", label: "WhatsApp" },
      ].filter((link) => link.href && link.href !== "#");

  // Build header background style with opacity support
  const headerBgStyle: React.CSSProperties = {};
  const headerOpacity = settings.headerBgOpacity ?? 1;
  
  if (settings.headerBgImage) {
    headerBgStyle.backgroundImage = `url('${settings.headerBgImage}')`;
    headerBgStyle.backgroundSize = "cover";
    headerBgStyle.backgroundPosition = "center";
  } else if (settings.headerBgGradient) {
    headerBgStyle.background = settings.headerBgGradient;
  } else if (settings.headerBgColor) {
    headerBgStyle.backgroundColor = settings.headerBgColor;
  }
  
  if (headerOpacity < 1) {
    headerBgStyle.opacity = headerOpacity;
  }

  // Build nav link style
  const navLinkStyle: React.CSSProperties = {};
  if (settings.headerNavColor) {
    navLinkStyle.color = settings.headerNavColor;
  }
  if (settings.headerNavFont) {
    navLinkStyle.fontFamily = settings.headerNavFont;
  }
  if (settings.headerNavFontSize) {
    navLinkStyle.fontSize = `${settings.headerNavFontSize}px`;
  }

  return (
    <div className="corp-header" style={headerBgStyle}>
      {/* Top Navigation Row */}
      <div className="corp-nav-row">
        <nav className="corp-nav" aria-label="Üst Menü">
          {navLinks.map((link) => {
            const linkStyle: React.CSSProperties = { ...navLinkStyle };
            if ("textColor" in link && link.textColor) {
              linkStyle.color = String(link.textColor);
            }
            if ("bgColor" in link && link.bgColor) {
              linkStyle.backgroundColor = String(link.bgColor);
              linkStyle.borderRadius = "4px";
              linkStyle.padding = "6px 12px";
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? "active" : ""}
                style={linkStyle}
              >
                {"icon" in link && link.icon ? <i className={String(link.icon)} style={{ marginRight: 6 }}></i> : null}
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/admin/login" className="corp-consultant-btn">
          <i className="fa-solid fa-user"></i>
          Danışman Girişi
        </Link>
      </div>

      {/* Logo & Social Row */}
      <div className="corp-logo-row">
        <div className="corp-logo-row-inner">
          <div className="corp-social" aria-label="Sosyal Medya">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} aria-label={link.label} target="_blank" rel="noopener noreferrer">
                <i className={link.icon}></i>
              </a>
            ))}
          </div>

          <Link className="corp-logo" href="/" aria-label="Emlaknomi">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.siteName || "Emlaknomi"}
                className="corp-logo-img"
                style={{
                  ...(settings.logoWidth ? { width: `${settings.logoWidth}px` } : {}),
                  ...(settings.logoHeight ? { height: `${settings.logoHeight}px` } : {}),
                }}
              />
            ) : (
              <img
                src="/logo.png"
                alt="Emlaknomi"
                className="corp-logo-img"
                style={{
                  ...(settings.logoWidth ? { width: `${settings.logoWidth}px` } : {}),
                  ...(settings.logoHeight ? { height: `${settings.logoHeight}px` } : {}),
                }}
              />
            )}
            {showLogoSubtitle && logoSubtitleText && (
              <div className="corp-logo-sub" style={logoSubtitleStyle}>
                {logoSubtitleText}
              </div>
            )}
          </Link>

          {/* Search Bar */}
          <div className="corp-search">
            <form onSubmit={handleSearch} className="corp-search-form">
              <button type="submit" className="corp-search-btn" aria-label="Ara">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
              <input
                type="text"
                placeholder="İlan ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="corp-search-input"
              />
              <button
                type="button"
                className="corp-filter-btn"
                aria-label="Filtreler"
                onClick={() => router.push("/arama")}
              >
                <i className="fa-solid fa-sliders"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
