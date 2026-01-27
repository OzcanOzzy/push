"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);
  }, []);

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

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">Yönetim Paneli</div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-outline" onClick={handleLogout}>
            Çıkış
          </button>
        </div>
        <div className="layout-grid" style={{ marginTop: 16 }}>
          <aside className="sidebar">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Menü</div>
            <div style={{ display: "grid", gap: 8 }}>
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
              <Link className="btn btn-outline" href="/admin/requests">
                Talepler
              </Link>
              <Link className="btn btn-outline" href="/admin/settings">
                Site Ayarları
              </Link>
            </div>
          </aside>
          <section>
            <div className="card">
              <div className="card-body">
                Yönetim ekranı bileşenleri burada olacak. İlan ekleme, güncelleme
                ve kullanıcı yönetimi adımları bu panelde yapılacak.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
