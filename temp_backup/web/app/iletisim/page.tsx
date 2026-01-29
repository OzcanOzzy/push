"use client";

import Link from "next/link";
import { useSettings } from "../components/SettingsProvider";

export default function ContactPage() {
  const settings = useSettings();
  const whatsappLink = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`
    : "#";

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">İletişim</div>
        <div className="layout-grid">
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: 16 }}>Bize Ulaşın</h3>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Telefon</div>
                  <a
                    href={`tel:${settings.phoneNumber?.replace(/\s/g, "")}`}
                    style={{ color: "var(--color-primary)" }}
                  >
                    {settings.phoneNumber}
                  </a>
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>WhatsApp</div>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {settings.whatsappNumber}
                  </a>
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>E-posta</div>
                  <a
                    href={`mailto:${settings.email}`}
                    style={{ color: "var(--color-primary)" }}
                  >
                    {settings.email}
                  </a>
                </div>
                {settings.supportEmail && settings.supportEmail !== settings.email && (
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Destek E-posta</div>
                    <a
                      href={`mailto:${settings.supportEmail}`}
                      style={{ color: "var(--color-primary)" }}
                    >
                      {settings.supportEmail}
                    </a>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn">
                  WhatsApp ile İletişim
                </a>
                <a href={`tel:${settings.phoneNumber?.replace(/\s/g, "")}`} className="btn btn-outline">
                  Hemen Ara
                </a>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: 16 }}>Talep Oluştur</h3>
              <p style={{ marginBottom: 16, color: "var(--color-muted)" }}>
                Satış, kiralama veya değerleme talepleriniz için formumuzu
                kullanabilirsiniz.
              </p>
              <div style={{ display: "grid", gap: 12 }}>
                <Link href="/requests/customer?type=SELL" className="btn btn-outline">
                  Satmak İstiyorum
                </Link>
                <Link href="/requests/customer?type=RENT" className="btn btn-outline">
                  Kiraya Vermek İstiyorum
                </Link>
                <Link href="/requests/customer?type=VALUATION" className="btn btn-outline">
                  Değerleme İstiyorum
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-body">
            <h3 style={{ marginBottom: 16 }}>Yetkili</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 24,
                }}
              >
                {settings.ownerName?.charAt(0)?.toUpperCase() || "E"}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{settings.ownerName}</div>
                <div style={{ color: "var(--color-muted)" }}>{settings.ownerTitle}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
