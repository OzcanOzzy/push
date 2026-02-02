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

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  photoUrl?: string;
  title?: string;
};

// Rol kategorileri
const ADMIN_ROLE = "ADMIN";
const MANAGER_ROLES = ["ADMIN", "MANAGER", "BROKER", "FIRM_OWNER", "REAL_ESTATE_EXPERT"];
const CONSULTANT_ROLES = ["CONSULTANT", "BRANCH_MANAGER"];

// Rol etiketleri
const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Yönetici",
  BROKER: "Broker",
  FIRM_OWNER: "Firma Sahibi",
  REAL_ESTATE_EXPERT: "Emlak Uzmanı",
  BRANCH_MANAGER: "Şube Müdürü",
  CONSULTANT: "Danışman",
};

// Panel başlıkları
const PANEL_TITLES: Record<string, string> = {
  ADMIN: "Admin Panel",
  MANAGER: "Yönetici Paneli",
  BROKER: "Yönetici Paneli",
  FIRM_OWNER: "Yönetici Paneli",
  REAL_ESTATE_EXPERT: "Yönetici Paneli",
  BRANCH_MANAGER: "Danışman Paneli",
  CONSULTANT: "Danışman Paneli",
};

export default function AdminDashboardPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  // Yetki kontrolleri
  const isAdmin = user?.role === ADMIN_ROLE;
  const isManager = user?.role ? MANAGER_ROLES.includes(user.role) : false;
  const isConsultant = user?.role ? CONSULTANT_ROLES.includes(user.role) : false;

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");
    
    setIsAuthed(Boolean(token));
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        // ignore
      }
    }
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
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-primary)" }}>
                {user?.role ? PANEL_TITLES[user.role] || "Yönetim Paneli" : "Yönetim Paneli"}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                {user?.name && (
                  <span style={{ fontWeight: 600, marginRight: 8 }}>{user.name}</span>
                )}
                {user?.role && (
                  <span style={{ 
                    background: isAdmin ? "#dc2626" : isManager ? "#0a4ea3" : "#10b981",
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                  }}>
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                )}
              </div>
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
              {/* Herkes görebilir */}
              <Link className="btn btn-outline" href="/admin/listings">
                <i className="fa-solid fa-building" style={{ marginRight: 6 }}></i>
                {isConsultant && !isManager ? "İlanlarım" : "İlanlar"}
              </Link>
              
              <Link className="btn btn-outline" href="/admin/requests">
                <i className="fa-solid fa-inbox" style={{ marginRight: 6 }}></i>
                Talepler
              </Link>

              <Link className="btn btn-outline" href="/admin/valuation-requests">
                <i className="fa-solid fa-calculator" style={{ marginRight: 6 }}></i>
                Değerleme Talepleri
              </Link>

              <Link className="btn btn-outline" href="/admin/property-requests">
                <i className="fa-solid fa-handshake" style={{ marginRight: 6 }}></i>
                Satış/Kiralama Talepleri
              </Link>

              {/* Sadece yönetici ve admin */}
              {isManager && (
                <>
                  <Link className="btn btn-outline" href="/admin/consultants">
                    <i className="fa-solid fa-user-tie" style={{ marginRight: 6 }}></i>
                    Danışmanlar
                  </Link>
                  <Link className="btn btn-outline" href="/admin/branches">
                    <i className="fa-solid fa-building-columns" style={{ marginRight: 6 }}></i>
                    Şubeler
                  </Link>
                </>
              )}

              {/* Sadece admin */}
              {isAdmin && (
                <>
                  <div style={{ borderTop: "1px solid var(--color-border)", margin: "8px 0" }} />
                  <div style={{ fontWeight: 600, fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>
                    KULLANICI YÖNETİMİ
                  </div>
                  <Link className="btn btn-outline" href="/admin/users" style={{ background: "#10b981", color: "#fff", border: "none" }}>
                    <i className="fa-solid fa-users-gear" style={{ marginRight: 6 }}></i>
                    Kullanıcı Yönetimi
                  </Link>
                  <Link className="btn btn-outline" href="/admin/cities">
                    <i className="fa-solid fa-city" style={{ marginRight: 6 }}></i>
                    Şehirler
                  </Link>
                  <Link className="btn btn-outline" href="/admin/listing-attributes">
                    <i className="fa-solid fa-list-check" style={{ marginRight: 6 }}></i>
                    İlan Özellikleri
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
                </>
              )}
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
