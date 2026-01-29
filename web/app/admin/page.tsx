"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchJson } from "../../lib/api";
import { type SiteSettings, defaultSettings } from "../../lib/settings";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type DashboardStats = {
  listings: number;
  forSale: number;
  forRent: number;
  opportunities: number;
  branches: number;
  consultants: number;
  customerRequests: number;
  consultantRequests: number;
};

export default function AdminDashboardPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);

    // Load settings for logo
    fetchJson<SiteSettings>("/settings", { cache: "no-store" })
      .then((data) => setSettings({ ...defaultSettings, ...data }))
      .catch(() => {});

    if (token) {
      loadStats(token);
    }
  }, []);

  const loadStats = async (token: string) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        listingsRes,
        forSaleRes,
        forRentRes,
        opportunitiesRes,
        branchesRes,
        consultantsRes,
        customerRequestsRes,
        consultantRequestsRes,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/listings`, { headers }),
        fetch(`${API_BASE_URL}/listings?status=FOR_SALE`, { headers }),
        fetch(`${API_BASE_URL}/listings?status=FOR_RENT`, { headers }),
        fetch(`${API_BASE_URL}/listings?isOpportunity=true`, { headers }),
        fetch(`${API_BASE_URL}/branches`, { headers }),
        fetch(`${API_BASE_URL}/consultants`, { headers }),
        fetch(`${API_BASE_URL}/requests/customer`, { headers }),
        fetch(`${API_BASE_URL}/requests/consultant`, { headers }),
      ]);

      const listings = await listingsRes.json();
      const forSale = await forSaleRes.json();
      const forRent = await forRentRes.json();
      const opportunities = await opportunitiesRes.json();
      const branches = await branchesRes.json();
      const consultants = await consultantsRes.json();
      const customerRequests = await customerRequestsRes.json();
      const consultantRequests = await consultantRequestsRes.json();

      setStats({
        listings: Array.isArray(listings) ? listings.length : 0,
        forSale: Array.isArray(forSale) ? forSale.length : 0,
        forRent: Array.isArray(forRent) ? forRent.length : 0,
        opportunities: Array.isArray(opportunities) ? opportunities.length : 0,
        branches: Array.isArray(branches) ? branches.length : 0,
        consultants: Array.isArray(consultants) ? consultants.length : 0,
        customerRequests: Array.isArray(customerRequests) ? customerRequests.length : 0,
        consultantRequests: Array.isArray(consultantRequests) ? consultantRequests.length : 0,
      });
    } catch {
      // ignore errors
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setIsAuthed(false);
  };

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Yönetim Paneli</div>
          <div className="card">
            <div className="card-body">Kontrol ediliyor...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Yönetim Paneli</div>
          <div className="card">
            <div className="card-body">
              Bu sayfayı görmek için giriş yapmalısınız.{" "}
              <Link href="/admin/login" className="btn btn-outline">
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const StatCard = ({
    title,
    value,
    href,
    color,
  }: {
    title: string;
    value: number;
    href: string;
    color?: string;
  }) => (
    <Link href={href} className="card" style={{ textDecoration: "none" }}>
      <div className="card-body" style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: color || "var(--color-primary)",
          }}
        >
          {value}
        </div>
        <div style={{ color: "var(--color-muted)", marginTop: 4 }}>{title}</div>
      </div>
    </Link>
  );

  return (
    <main className="section">
      <div className="container">
        {/* Admin Header with Logo */}
        <div className="admin-dashboard-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "2px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.siteName || "Logo"}
                style={{ height: 50, maxWidth: 150, objectFit: "contain" }}
              />
            ) : (
              <img src="/logo.png" alt="Logo" style={{ height: 50, maxWidth: 150, objectFit: "contain" }} />
            )}
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-primary)" }}>Yönetim Paneli</div>
              <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{settings.siteName || "Emlaknomi"}</div>
            </div>
          </div>
          <div className="admin-header-buttons" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/admin/ilan-hazirla"
              className="btn admin-btn-ilan-hazirla"
              style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#dc2626", borderColor: "#dc2626" }}
            >
              <i className="fa-solid fa-file-pen"></i>
              İlan Hazırla
            </Link>
            <Link 
              href="/admin/talep-gir" 
              className="btn btn-outline admin-btn-talep-gir"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <i className="fa-solid fa-paper-plane"></i>
              Talep Gir
            </Link>
            <Link 
              href="/admin/listings/new" 
              className="btn admin-btn-yeni-ilan"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <i className="fa-solid fa-plus"></i>
              Yeni İlan Ekle
            </Link>
            <Link href="/" target="_blank" className="btn btn-outline admin-btn-site" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-external-link-alt"></i>
              Siteyi Görüntüle
            </Link>
            <button className="btn btn-outline admin-btn-cikis" onClick={handleLogout}>
              <i className="fa-solid fa-sign-out-alt" style={{ marginRight: 6 }}></i>
              Çıkış
            </button>
          </div>
        </div>
        <div className="layout-grid" style={{ marginTop: 16 }}>
          <aside className="sidebar">
            <div className="sidebar-title" style={{ fontWeight: 700, marginBottom: 12 }}>Menü</div>
            <div className="sidebar-menu" style={{ display: "grid", gap: 8 }}>
              <Link className="btn btn-outline" href="/admin/listings">
                İlanlar
              </Link>
              <Link className="btn btn-outline" href="/admin/consultants">
                Danışmanlar
              </Link>
              <Link className="btn btn-outline" href="/admin/branches">
                Şubeler
              </Link>
              <Link className="btn btn-outline" href="/admin/cities">
                Şehirler
              </Link>
              <Link className="btn btn-outline" href="/admin/listing-attributes">
                İlan Özellikleri
              </Link>
              <Link className="btn btn-outline" href="/admin/requests">
                Talepler
              </Link>
              <div style={{ borderTop: "1px solid var(--color-border)", margin: "8px 0" }} />
              <div style={{ fontWeight: 600, fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>
                TASARIM
              </div>
              <Link className="btn btn-outline" href="/admin/menu">
                Menü Yönetimi
              </Link>
              <Link className="btn btn-outline" href="/admin/city-buttons">
                Şehir Butonları
              </Link>
              <Link className="btn btn-outline" href="/admin/action-buttons">
                Aksiyon Butonları
              </Link>
              <Link className="btn btn-outline" href="/admin/banners">
                Banner / Reklam
              </Link>
              <Link className="btn btn-outline" href="/admin/listing-labels">
                <i className="fa-solid fa-tags" style={{ marginRight: 6 }}></i>
                İlan Etiketleri
              </Link>
              <Link className="btn btn-outline" href="/admin/footer-items">
                <i className="fa-solid fa-shoe-prints" style={{ marginRight: 6 }}></i>
                Footer İçerikleri
              </Link>
              <Link className="btn btn-outline" href="/admin/social-links">
                <i className="fa-solid fa-share-nodes" style={{ marginRight: 6 }}></i>
                Sosyal Medya
              </Link>
              <Link className="btn btn-outline" href="/admin/settings">
                Site Ayarları
              </Link>
              <Link className="btn btn-outline" href="/admin/seo">
                <i className="fa-solid fa-chart-line" style={{ marginRight: 6 }}></i>
                SEO & Analitik
              </Link>
              <Link className="btn btn-outline" href="/admin/page-design">
                Sayfa Tasarımı
              </Link>
              <Link className="btn btn-outline" href="/admin/mobile-settings" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none" }}>
                <i className="fa-solid fa-mobile-screen" style={{ marginRight: 6 }}></i>
                Mobil Ayarları
              </Link>
              <div style={{ borderTop: "1px solid var(--color-border)", margin: "8px 0" }} />
              <div style={{ fontWeight: 600, fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>
                İÇERİK & SEO
              </div>
              <Link className="btn btn-outline" href="/admin/pages">
                Sayfa Yönetimi
              </Link>
              <Link className="btn btn-outline" href="/admin/blog">
                Blog Yazıları
              </Link>
              <div style={{ borderTop: "1px solid var(--color-border)", margin: "8px 0" }} />
              <div style={{ fontWeight: 600, fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>
                SİSTEM
              </div>
              <Link className="btn btn-outline" href="/admin/backup" style={{ background: "linear-gradient(135deg, #0a4ea3 0%, #1e3a5f 100%)", color: "#fff", border: "none" }}>
                <i className="fa-solid fa-shield-halved" style={{ marginRight: 6 }}></i>
                Yedekleme
              </Link>
            </div>
          </aside>
          <section>
            {loading ? (
              <div className="card">
                <div className="card-body">İstatistikler yükleniyor...</div>
              </div>
            ) : stats ? (
              <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
                <StatCard title="Toplam İlan" value={stats.listings} href="/admin/listings" />
                <StatCard title="Satılık" value={stats.forSale} href="/admin/listings" color="#10b981" />
                <StatCard title="Kiralık" value={stats.forRent} href="/admin/listings" color="#3b82f6" />
                <StatCard title="Fırsat" value={stats.opportunities} href="/admin/listings" color="#f59e0b" />
                <StatCard title="Şube" value={stats.branches} href="/admin/branches" />
                <StatCard title="Danışman" value={stats.consultants} href="/admin/consultants" />
                <StatCard title="Müşteri Talebi" value={stats.customerRequests} href="/admin/requests" color="#ef4444" />
                <StatCard title="Danışman Talebi" value={stats.consultantRequests} href="/admin/requests" color="#8b5cf6" />
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  İstatistikler yüklenemedi. Lütfen sayfayı yenileyin.
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
