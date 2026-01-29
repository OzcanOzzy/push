"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultSettings, type SiteSettings } from "../../lib/settings";

type SettingsContextValue = SiteSettings;

const SettingsContext = createContext<SettingsContextValue>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

const applyCssVars = (settings: SettingsContextValue) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty("--color-primary", settings.primaryColor || '');
  root.style.setProperty("--color-accent", settings.accentColor || '');
  root.style.setProperty("--color-bg", settings.backgroundColor || '');
  root.style.setProperty("--color-text", settings.textColor || '');
};

export default function SettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: SettingsContextValue;
}) {
  // Use server-provided initial settings
  const [settings] = useState<SettingsContextValue>(initialSettings || defaultSettings);

  // Apply CSS vars on mount (for client-side navigation)
  useEffect(() => {
    applyCssVars(settings);
  }, [settings]);

  const value = useMemo(() => settings, [settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
