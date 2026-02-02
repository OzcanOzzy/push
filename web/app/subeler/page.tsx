"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type CityButton = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  iconColor?: string | null;
  bgColor?: string | null;
  borderColor?: string | null;
  width?: number | null;
  height?: number | null;
  city?: { name: string; slug: string } | null;
};

export default function SubelerPage() {
  const [cityButtons, setCityButtons] = useState<CityButton[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/city-buttons`)
      .then((res) => res.json())
      .then((data) => setCityButtons(Array.isArray(data) ? data : []))
      .catch(() => setCityButtons([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="branches-page">
        <div className="branches-container">
          <div className="branches-loading">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>Şubeler yükleniyor...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="branches-page">
      <div className="branches-container">
        <div className="branches-header">
          <h1>
            <i className="fa-solid fa-building"></i>
            Şubelerimiz
          </h1>
          <p>İlanlarını görüntülemek istediğiniz şubeyi seçin</p>
        </div>

        <div className="branches-grid">
          {cityButtons.length === 0 ? (
            <div className="branches-empty">
              <i className="fa-solid fa-map-marker-alt"></i>
              <p>Henüz şube eklenmemiş.</p>
            </div>
          ) : (
            cityButtons.map((btn) => {
              const width = btn.width || 120;
              const height = btn.height || 120;
              const hasImage = Boolean(btn.imageUrl);
              const bgStyle = btn.bgColor?.startsWith("linear-gradient")
                ? { background: btn.bgColor }
                : { backgroundColor: btn.bgColor || "#0c2340" };

              return (
                <Link
                  key={btn.id}
                  href={`/subeler/${btn.slug}`}
                  className="branch-card"
                  style={{
                    width,
                    height,
                    ...bgStyle,
                    borderColor: btn.borderColor || "#d4af37",
                    backgroundImage: hasImage
                      ? `url('${btn.imageUrl?.startsWith("http") ? btn.imageUrl : API_BASE_URL + btn.imageUrl}')`
                      : undefined,
                  }}
                >
                  {!hasImage && (
                    <div className="branch-card-icon" style={{ color: btn.iconColor || "#d4af37" }}>
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                  )}
                  <div className="branch-card-overlay">
                    <span className="branch-card-name">{btn.name}</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <div className="branches-info">
          <div className="branches-info-card">
            <i className="fa-solid fa-phone"></i>
            <h4>İletişim</h4>
            <p>Şubelerimizle iletişime geçmek için ilgili şubeyi seçin ve ilanları görüntüleyin.</p>
          </div>
          <div className="branches-info-card">
            <i className="fa-solid fa-map"></i>
            <h4>Konum</h4>
            <p>Tüm şubelerimiz Türkiye'nin farklı bölgelerinde hizmet vermektedir.</p>
          </div>
          <div className="branches-info-card">
            <i className="fa-solid fa-home"></i>
            <h4>İlanlar</h4>
            <p>Her şubemizde satılık ve kiralık gayrimenkul ilanlarını bulabilirsiniz.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
