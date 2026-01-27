"use client";

import Link from "next/link";
import { useSettings } from "./SettingsProvider";

export default function TopBar() {
  const settings = useSettings();
  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <div className="topbar-links">
          <Link href="/">Menü</Link>
          <Link href="/">Tüm İlanlar</Link>
          <Link href="/firsatlar">Fırsatlar</Link>
          <Link href="/requests/customer?type=SELL">Hakkımızda</Link>
          <Link href="/requests/customer?type=SELL">İletişim</Link>
        </div>
        <div className="topbar-links">
          <span>WhatsApp</span>
          <span>{settings.whatsappNumber}</span>
          <span>{settings.email}</span>
        </div>
      </div>
    </div>
  );
}
