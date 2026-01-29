"use client";

import Link from "next/link";
import { useSettings } from "../components/SettingsProvider";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ContentBlock = {
  id: string;
  type: "text" | "image" | "button" | "html";
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  alt?: string;
  style?: Record<string, string>;
};

type PageData = {
  id: string;
  slug: string;
  title: string;
  content?: ContentBlock[] | null;
};

export default function ContactPage() {
  const settings = useSettings();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  const whatsappLink = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`
    : "#";

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/pages/slug/iletisim`);
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          setPageData(data);
        }
      }
    } catch (error) {
      console.error("Sayfa verisi yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (blocks: ContentBlock[]) => {
    return blocks.map((block) => {
      switch (block.type) {
        case "text":
          return (
            <div key={block.id} style={{ marginBottom: 16, lineHeight: 1.8, ...block.style }}>
              {block.content}
            </div>
          );
        case "html":
          return (
            <div
              key={block.id}
              style={{ marginBottom: 16, ...block.style }}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        case "image":
          return (
            <div key={block.id} style={{ marginBottom: 16, textAlign: "center", ...block.style }}>
              <img
                src={block.imageUrl || ""}
                alt={block.alt || ""}
                style={{ maxWidth: "100%", height: "auto", borderRadius: 8 }}
              />
              {block.content && <p style={{ marginTop: 8, color: "#666", fontSize: 14 }}>{block.content}</p>}
            </div>
          );
        case "button":
          return (
            <div key={block.id} style={{ marginBottom: 16, ...block.style }}>
              <a
                href={block.linkUrl || "#"}
                className="btn btn-primary"
                style={{ display: "inline-block" }}
              >
                {block.content}
              </a>
            </div>
          );
        default:
          return null;
      }
    });
  };

  // Varsayılan içerik
  const DefaultContent = () => (
    <>
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
    </>
  );

  if (loading) {
    return (
      <main className="section">
        <div className="container">
          <div className="card">
            <div className="card-body" style={{ textAlign: "center", padding: 40 }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "#0a4ea3" }}></i>
              <p style={{ marginTop: 16, color: "#666" }}>Yükleniyor...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">{pageData?.title || "İletişim"}</div>
        
        {pageData && pageData.content && Array.isArray(pageData.content) && pageData.content.length > 0 ? (
          <div className="card">
            <div className="card-body">
              {renderContent(pageData.content)}
            </div>
          </div>
        ) : (
          <DefaultContent />
        )}
      </div>
    </main>
  );
}
