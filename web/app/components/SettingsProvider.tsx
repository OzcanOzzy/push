"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchJsonOptional } from "../../lib/api";
import { defaultSettings, type SiteSettings } from "../../lib/settings";

type SettingsContextValue = Required<SiteSettings>;

const SettingsContext = createContext<SettingsContextValue>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

const applyCssVars = (settings: SettingsContextValue) => {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", settings.primaryColor);
  root.style.setProperty("--color-accent", settings.accentColor);
  root.style.setProperty("--color-bg", settings.backgroundColor);
  root.style.setProperty("--color-text", settings.textColor);
};

export default function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<SettingsContextValue>(defaultSettings);

  useEffect(() => {
    let isMounted = true;
    fetchJsonOptional<SiteSettings>("/settings", { cache: "no-store" })
      .then((data) => {
        if (!isMounted || !data) {
          return;
        }
        const merged = { ...defaultSettings, ...data };
        setSettings(merged);
        applyCssVars(merged);
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => settings, [settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
