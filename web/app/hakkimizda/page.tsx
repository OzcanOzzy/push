"use client";

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

export default function AboutPage() {
  const settings = useSettings();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/pages/slug/hakkimizda`);
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

  // Varsayılan içerik (veritabanında yoksa)
  const DefaultContent = () => (
    <>
      <div className="card">
        <div className="card-body">
          <h2 style={{ marginBottom: 16 }}>{settings.siteName}</h2>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            {settings.siteName}, gayrimenkul sektöründe güvenilir ve profesyonel
            hizmet anlayışıyla müşterilerimize en iyi deneyimi sunmayı
            hedeflemektedir. Uzman kadromuz ve geniş portföyümüz ile konut,
            arsa, ticari gayrimenkul ve daha fazlası için yanınızdayız.
          </p>
          <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
            Müşteri memnuniyetini ön planda tutarak, alım, satım ve kiralama
            süreçlerinizde size rehberlik ediyoruz. Şeffaf iletişim ve
            profesyonel yaklaşımımızla sektörde fark yaratıyoruz.
          </p>
          <div style={{ marginTop: 24, padding: 16, background: "var(--color-bg-alt)", borderRadius: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              {settings.ownerName}
            </div>
            <div style={{ color: "var(--color-muted)" }}>
              {settings.ownerTitle}
            </div>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-body">
          <h3 style={{ marginBottom: 16 }}>Neden Biz?</h3>
          <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
            <li>Geniş gayrimenkul portföyü</li>
            <li>Deneyimli ve profesyonel ekip</li>
            <li>Şeffaf ve güvenilir hizmet</li>
            <li>Müşteri odaklı yaklaşım</li>
            <li>Hızlı ve etkili çözümler</li>
            <li>Piyasa analizi ve danışmanlık</li>
          </ul>
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
        <div className="section-title">{pageData?.title || "Hakkımızda"}</div>
        
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
