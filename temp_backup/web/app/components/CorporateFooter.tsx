"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "./SettingsProvider";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type FooterItem = {
  id: string;
  type: string;
  label: string | null;
  value: string;
  linkUrl: string | null;
  icon: string | null;
  iconColor: string | null;
  textColor: string | null;
};

export default function CorporateFooter() {
  const settings = useSettings();
  const pathname = usePathname();
  const [footerItems, setFooterItems] = useState<FooterItem[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/footer-items`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFooterItems(data);
        }
      })
      .catch(() => {});
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const whatsappLink = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`
    : "#";

  // Build footer background style with opacity support
  const footerBgStyle: React.CSSProperties = {};
  const footerOpacity = settings.footerBgOpacity ?? 1;
  
  if (settings.footerBgImage) {
    footerBgStyle.backgroundImage = `url('${settings.footerBgImage}')`;
    footerBgStyle.backgroundSize = "cover";
    footerBgStyle.backgroundPosition = "center";
  } else if (settings.footerBgGradient) {
    footerBgStyle.background = settings.footerBgGradient;
  } else if (settings.footerBgColor) {
    footerBgStyle.backgroundColor = settings.footerBgColor;
  }
  
  if (footerOpacity < 1) {
    footerBgStyle.opacity = footerOpacity;
  }

  // Build text style
  const textStyle: React.CSSProperties = {};
  if (settings.footerTextColor) {
    textStyle.color = settings.footerTextColor;
  }
  if (settings.footerFont) {
    textStyle.fontFamily = settings.footerFont;
  }
  if (settings.footerFontSize) {
    textStyle.fontSize = `${settings.footerFontSize}px`;
  }

  return (
    <footer className="corp-footer" style={footerBgStyle}>
      <div className="corp-footer-inner">
        <div className="corp-footer-col">
          <div className="corp-footer-logo">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.siteName || "Emlaknomi"} />
            ) : (
              <img src="/logo.png" alt="Emlaknomi" />
            )}
          </div>
          <p className="corp-footer-desc" style={textStyle}>
            {settings.footerLogoSubtitle || "Güvenilir gayrimenkul danışmanlığı hizmeti ile hayalinizdeki eve kavuşmanız için buradayız."}
          </p>
        </div>

        <div className="corp-footer-col">
          <h4 className="corp-footer-title" style={textStyle}>Hızlı Linkler</h4>
          <nav className="corp-footer-links">
            <Link href="/">Ana Sayfa</Link>
            <Link href="/arama">Tüm İlanlar</Link>
            <Link href="/subeler">Şubeler</Link>
            <Link href="/firsatlar">Fırsatlar</Link>
            <Link href="/hakkimizda">Hakkımızda</Link>
            <Link href="/iletisim">İletişim</Link>
          </nav>
        </div>

        <div className="corp-footer-col">
          <h4 className="corp-footer-title" style={textStyle}>İletişim</h4>
          <div className="corp-footer-contact">
            <div className="corp-footer-contact-item">
              <i className="fa-solid fa-user"></i>
              <span>{settings.ownerName || "Özcan Aktaş"}</span>
            </div>
            {(settings.footerPhone || settings.phoneNumber) && (
              <div className="corp-footer-contact-item">
                <i className="fa-solid fa-phone"></i>
                <a href={`tel:${settings.footerPhone || settings.phoneNumber}`}>
                  {settings.footerPhone || settings.phoneNumber}
                </a>
              </div>
            )}
            {settings.footerPhone2 && (
              <div className="corp-footer-contact-item">
                <i className="fa-solid fa-phone"></i>
                <a href={`tel:${settings.footerPhone2}`}>{settings.footerPhone2}</a>
              </div>
            )}
            <div className="corp-footer-contact-item">
              <i className="fa-brands fa-whatsapp"></i>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                {settings.whatsappNumber || "0543 306 14 99"}
              </a>
            </div>
            <div className="corp-footer-contact-item">
              <i className="fa-solid fa-envelope"></i>
              <a href={`mailto:${settings.footerEmail || settings.email}`}>
                {settings.footerEmail || settings.email || "emlaknomiozcan@gmail.com"}
              </a>
            </div>
            {(settings.footerAddress || settings.footerAddress2) && (
              <div className="corp-footer-contact-item">
                <i className="fa-solid fa-location-dot"></i>
                <span>
                  {settings.footerAddress}
                  {settings.footerAddress && settings.footerAddress2 && <br />}
                  {settings.footerAddress2}
                </span>
              </div>
            )}
            {!settings.footerAddress && !settings.footerAddress2 && (
              <div className="corp-footer-contact-item">
                <i className="fa-solid fa-location-dot"></i>
                <span>Türkiye</span>
              </div>
            )}
            {settings.footerWorkingHours && (
              <div className="corp-footer-contact-item">
                <i className="fa-solid fa-clock"></i>
                <span>{settings.footerWorkingHours}</span>
              </div>
            )}
            {/* Dynamic Footer Items */}
            {footerItems.map((item) => (
              <div
                key={item.id}
                className="corp-footer-contact-item"
                style={{ color: item.textColor || undefined }}
              >
                <i
                  className={item.icon || "fa-solid fa-circle"}
                  style={{ color: item.iconColor || undefined }}
                ></i>
                {item.linkUrl ? (
                  <a
                    href={item.linkUrl}
                    target={item.type === "map" || item.linkUrl.startsWith("http") ? "_blank" : undefined}
                    rel={item.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                    style={{ color: item.textColor || undefined }}
                  >
                    {item.label && <strong>{item.label}: </strong>}
                    {item.value}
                  </a>
                ) : (
                  <span>
                    {item.label && <strong>{item.label}: </strong>}
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="corp-footer-col">
          <h4 className="corp-footer-title" style={textStyle}>Sosyal Medya</h4>
          <div className="corp-footer-social">
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
            )}
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
            )}
            {settings.youtubeUrl && (
              <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <i className="fa-brands fa-youtube"></i>
              </a>
            )}
            {settings.linkedinUrl && (
              <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            )}
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <i className="fa-brands fa-whatsapp"></i>
            </a>
          </div>
          {settings.footerShowMap && settings.footerMapUrl && (
            <div style={{ marginTop: 16 }}>
              <a
                href={settings.footerMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: settings.footerTextColor || "#fff", textDecoration: "underline" }}
              >
                <i className="fa-solid fa-map"></i> Haritada Görüntüle
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="corp-footer-bottom">
        <p style={textStyle}>
          {settings.footerCopyright || `© ${new Date().getFullYear()} ${settings.siteName || "Emlaknomi"} — Tüm hakları saklıdır.`}
        </p>
      </div>
    </footer>
  );
}
