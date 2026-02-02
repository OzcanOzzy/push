"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PropertyRequestForm from "../components/PropertyRequestForm";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Settings = {
  siteName?: string;
  logoUrl?: string;
  heroBackgroundUrl?: string;
  valuationPageTitle?: string;
  valuationPageDescription?: string;
  [key: string]: unknown;
};

type Banner = {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  title?: string;
};

type MenuItem = {
  id: string;
  label: string;
  href: string;
  isActive?: boolean;
};

type SocialLink = {
  id: string;
  label: string;
  url: string;
  icon: string;
  isActive?: boolean;
};

type FooterItem = {
  id: string;
  type: string;
  label?: string;
  value: string;
  linkUrl?: string;
  icon?: string;
  isActive?: boolean;
};

export default function ValuationPageClient() {
  const [settings, setSettings] = useState<Settings>({});
  const [banners, setBanners] = useState<Banner[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [footerItems, setFooterItems] = useState<FooterItem[]>([]);

  useEffect(() => {
    // Tüm verileri yükle
    Promise.all([
      fetch(`${API_BASE_URL}/settings`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/banners?position=home-top`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/menu-items`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/social-links`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/footer-items`).then((r) => r.json()),
    ])
      .then(([settingsData, bannersData, menuData, socialData, footerData]) => {
        setSettings(settingsData);
        setBanners(bannersData);
        setMenuItems(menuData.filter((m: MenuItem) => m.isActive !== false));
        setSocialLinks(socialData.filter((s: SocialLink) => s.isActive !== false));
        setFooterItems(footerData.filter((f: FooterItem) => f.isActive !== false));
      })
      .catch(console.error);
  }, []);

  const fullUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  return (
    <div className="page-wrapper">
      {/* HEADER */}
      <header
        className="header"
        style={{
          background: settings.headerBgColor || "linear-gradient(135deg, #0a4ea3 0%, #1e3a5f 100%)",
        }}
      >
        <div className="header-top">
          <div className="header-container">
            <div className="logo-row">
              {settings.logoUrl && (
                <Link href="/" className="logo-link">
                  <img
                    src={fullUrl(settings.logoUrl)}
                    alt={settings.siteName || "Logo"}
                    className="header-logo"
                  />
                </Link>
              )}
              <div className="social-row">
                {socialLinks.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer">
                    <i className={link.icon}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <nav className="header-nav">
          <div className="header-container">
            <ul className="nav-menu">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* BANNER */}
      {banners.length > 0 && (
        <section className="hero-banner">
          <div
            className="banner-image"
            style={{
              backgroundImage: `url('${fullUrl(banners[0].imageUrl)}')`,
              height: 300,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="banner-overlay" style={{ background: "rgba(0,0,0,0.5)", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", color: "#fff" }}>
                <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>
                  {settings.valuationPageTitle || "Evim Ne Kadar Eder?"}
                </h1>
                <p style={{ fontSize: 18, opacity: 0.9 }}>
                  {settings.valuationPageDescription || "Gayrimenkulünüzün güncel piyasa değerini öğrenin"}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ANA İÇERİK */}
      <main className="section" style={{ padding: "40px 0 60px" }}>
        <div className="container" style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
          {/* Başlık (Banner yoksa) */}
          {banners.length === 0 && (
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1f2937", marginBottom: 12 }}>
                Evim Ne Kadar Eder?
              </h1>
              <p style={{ color: "#6b7280", fontSize: 16 }}>
                Gayrimenkulünüzün güncel piyasa değerini öğrenmek için formu doldurun
              </p>
            </div>
          )}

          {/* Bilgi Kartları */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginBottom: 32 }}>
            <div style={{ background: "#eff6ff", borderRadius: 12, padding: 20, textAlign: "center" }}>
              <i className="fa-solid fa-calculator" style={{ fontSize: 32, color: "#3b82f6", marginBottom: 12 }}></i>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Ücretsiz Değerleme</h3>
              <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Profesyonel değerleme hizmeti tamamen ücretsiz</p>
            </div>
            <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 20, textAlign: "center" }}>
              <i className="fa-solid fa-clock" style={{ fontSize: 32, color: "#22c55e", marginBottom: 12 }}></i>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Hızlı Dönüş</h3>
              <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>24 saat içinde sizinle iletişime geçiyoruz</p>
            </div>
            <div style={{ background: "#fef3c7", borderRadius: 12, padding: 20, textAlign: "center" }}>
              <i className="fa-solid fa-user-tie" style={{ fontSize: 32, color: "#f59e0b", marginBottom: 12 }}></i>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Uzman Danışman</h3>
              <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Tecrübeli emlak danışmanları</p>
            </div>
          </div>

          {/* FORM */}
          <PropertyRequestForm formType="valuation" />
        </div>
      </main>

      {/* FOOTER */}
      <footer
        className="footer"
        style={{
          background: settings.footerBgColor || "linear-gradient(135deg, #1e3a5f 0%, #0a2540 100%)",
          color: settings.footerTextColor || "#fff",
          padding: "40px 0 20px",
        }}
      >
        <div className="container">
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, marginBottom: 32 }}>
            {/* Logo ve Hakkında */}
            <div>
              {settings.logoUrl && (
                <img
                  src={fullUrl(settings.logoUrl)}
                  alt={settings.siteName || "Logo"}
                  style={{ height: 50, marginBottom: 16 }}
                />
              )}
              <p style={{ opacity: 0.8, fontSize: 14, lineHeight: 1.6 }}>
                {settings.footerLogoSubtitle || "Güvenilir emlak danışmanlığı"}
              </p>
            </div>

            {/* İletişim */}
            <div>
              <h4 style={{ marginBottom: 16, fontSize: 16 }}>İletişim</h4>
              {footerItems.filter(f => f.type === "phone" || f.type === "email" || f.type === "address").map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, opacity: 0.8, fontSize: 14 }}>
                  {item.icon && <i className={item.icon}></i>}
                  <span>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Hızlı Linkler */}
            <div>
              <h4 style={{ marginBottom: 16, fontSize: 16 }}>Hızlı Linkler</h4>
              {menuItems.slice(0, 5).map((item) => (
                <div key={item.id} style={{ marginBottom: 8 }}>
                  <Link href={item.href} style={{ color: "inherit", opacity: 0.8, fontSize: 14, textDecoration: "none" }}>
                    {item.label}
                  </Link>
                </div>
              ))}
            </div>

            {/* Sosyal Medya */}
            <div>
              <h4 style={{ marginBottom: 16, fontSize: 16 }}>Sosyal Medya</h4>
              <div style={{ display: "flex", gap: 12 }}>
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <i className={link.icon}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, textAlign: "center", opacity: 0.6, fontSize: 13 }}>
            {settings.footerCopyright || `© ${new Date().getFullYear()} Tüm hakları saklıdır.`}
          </div>
        </div>
      </footer>
    </div>
  );
}
