"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultSettings, type SiteSettings } from "../../lib/settings";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type SettingsContextValue = SiteSettings & {
  refetchSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue>({
  ...defaultSettings,
  refetchSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

const applyCssVars = (settings: SiteSettings) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  // Temel renkler
  root.style.setProperty("--color-primary", settings.primaryColor || '#1a436e');
  root.style.setProperty("--color-accent", settings.accentColor || '#e20b0b');
  root.style.setProperty("--color-bg", settings.backgroundColor || '#e9e9f0');
  root.style.setProperty("--color-text", settings.textColor || '#122033');
  
  // Header renkleri
  if (settings.headerBgColor) root.style.setProperty("--header-bg-color", settings.headerBgColor);
  if (settings.headerNavColor) root.style.setProperty("--header-nav-color", settings.headerNavColor);
  
  // Footer renkleri
  if (settings.footerBgColor) root.style.setProperty("--footer-bg-color", settings.footerBgColor);
  if (settings.footerTextColor) root.style.setProperty("--footer-text-color", settings.footerTextColor);
  
  // Logo boyutları
  if (settings.logoWidth) root.style.setProperty("--logo-width", `${settings.logoWidth}px`);
  if (settings.logoHeight) root.style.setProperty("--logo-height", `${settings.logoHeight}px`);
  
  // Ana sayfa buton boyutları
  if (settings.homeCityBtnWidth) root.style.setProperty("--city-btn-width", `${settings.homeCityBtnWidth}px`);
  if (settings.homeCityBtnHeight) root.style.setProperty("--city-btn-height", `${settings.homeCityBtnHeight}px`);
  if (settings.homeActionBtnWidth) root.style.setProperty("--action-btn-width", `${settings.homeActionBtnWidth}px`);
  if (settings.homeActionBtnHeight) root.style.setProperty("--action-btn-height", `${settings.homeActionBtnHeight}px`);
  
  // Mobil ayarları
  if (settings.mobileHeaderPadding) root.style.setProperty("--mobile-header-padding", settings.mobileHeaderPadding);
  if (settings.mobileNavFontSize) root.style.setProperty("--mobile-nav-font-size", `${settings.mobileNavFontSize}px`);
  if (settings.mobileLogoRowPadding) root.style.setProperty("--mobile-logo-row-padding", settings.mobileLogoRowPadding);
  if (settings.mobileLogoHeight) root.style.setProperty("--mobile-logo-height", `${settings.mobileLogoHeight}px`);
  if (settings.mobileLogoSubSize) root.style.setProperty("--mobile-logo-sub-size", `${settings.mobileLogoSubSize}px`);
  if (settings.mobileSocialSize) root.style.setProperty("--mobile-social-size", `${settings.mobileSocialSize}px`);
  if (settings.mobileSocialGap) root.style.setProperty("--mobile-social-gap", `${settings.mobileSocialGap}px`);
  if (settings.mobileSocialPosition) root.style.setProperty("--mobile-social-position", settings.mobileSocialPosition);
  if (settings.mobileSearchWidth) root.style.setProperty("--mobile-search-width", `${settings.mobileSearchWidth}px`);
  if (settings.mobileSearchHeight) root.style.setProperty("--mobile-search-height", `${settings.mobileSearchHeight}px`);
  if (settings.mobileBannerHeight) root.style.setProperty("--mobile-banner-height", `${settings.mobileBannerHeight}px`);
  if (settings.mobileBannerBorderRadius) root.style.setProperty("--mobile-banner-radius", `${settings.mobileBannerBorderRadius}px`);
  if (settings.mobileBranchColumns) root.style.setProperty("--mobile-branch-columns", String(settings.mobileBranchColumns));
  if (settings.mobileBranchGap) root.style.setProperty("--mobile-branch-gap", `${settings.mobileBranchGap}px`);
  if (settings.mobileBranchBorderRadius) root.style.setProperty("--mobile-branch-radius", `${settings.mobileBranchBorderRadius}px`);
  if (settings.mobileBranchAlign) root.style.setProperty("--mobile-branch-align", settings.mobileBranchAlign);
  if (settings.mobileActionColumns) root.style.setProperty("--mobile-action-columns", String(settings.mobileActionColumns));
  if (settings.mobileActionGap) root.style.setProperty("--mobile-action-gap", `${settings.mobileActionGap}px`);
  if (settings.mobileActionHeight) root.style.setProperty("--mobile-action-height", `${settings.mobileActionHeight}px`);
  if (settings.mobileActionFontSize) root.style.setProperty("--mobile-action-font-size", `${settings.mobileActionFontSize}px`);
  if (settings.mobileActionBorderRadius) root.style.setProperty("--mobile-action-radius", `${settings.mobileActionBorderRadius}px`);
  if (settings.mobileActionAlign) {
    // CSS align-items için değer dönüşümü
    const alignValue = settings.mobileActionAlign === 'left' ? 'flex-start' 
      : settings.mobileActionAlign === 'right' ? 'flex-end' 
      : settings.mobileActionAlign;
    root.style.setProperty("--mobile-action-align", alignValue);
  }
  if (settings.mobileActionWidth) root.style.setProperty("--mobile-action-width", `${settings.mobileActionWidth}%`);
  if (settings.mobileListingColumns) root.style.setProperty("--mobile-listing-columns", String(settings.mobileListingColumns));
  if (settings.mobileListingGap) root.style.setProperty("--mobile-listing-gap", `${settings.mobileListingGap}px`);
};

export default function SettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SiteSettings;
}) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings || defaultSettings);

  // Fetch settings from API
  const refetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const newSettings = { ...defaultSettings, ...data };
        setSettings(newSettings);
        applyCssVars(newSettings);
      }
    } catch (error) {
      console.error("Settings fetch failed:", error);
    }
  }, []);

  // Apply CSS vars on mount and when settings change
  useEffect(() => {
    applyCssVars(settings);
  }, [settings]);

  // Initial fetch on client-side mount (to get latest settings)
  useEffect(() => {
    // Sadece client-side'da çalış
    if (typeof window !== 'undefined') {
      refetchSettings();
    }
  }, [refetchSettings]);

  const value = useMemo(() => ({
    ...settings,
    refetchSettings,
  }), [settings, refetchSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
