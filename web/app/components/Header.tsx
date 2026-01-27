"use client";

import { useSettings } from "./SettingsProvider";

export default function Header() {
  const settings = useSettings();
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="logo">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.siteName}
              style={{ height: 36 }}
            />
          ) : (
            settings.siteName
          )}
        </div>
        <div className="search-bar">
          <input
            className="search-input"
            placeholder="İlan, şehir, ilçe ara"
          />
          <button className="btn">Filtre</button>
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{settings.ownerName}</div>
          <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
            {settings.ownerTitle}
          </div>
        </div>
      </div>
    </header>
  );
}
