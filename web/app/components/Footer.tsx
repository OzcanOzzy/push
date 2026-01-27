"use client";

import { useSettings } from "./SettingsProvider";

export default function Footer() {
  const settings = useSettings();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div style={{ fontWeight: 700, fontSize: 18 }}>{settings.siteName}</div>
        <div>Telefon: {settings.phoneNumber}</div>
        <div>İletişim: {settings.email}</div>
        <div>Destek: {settings.supportEmail}</div>
      </div>
    </footer>
  );
}
