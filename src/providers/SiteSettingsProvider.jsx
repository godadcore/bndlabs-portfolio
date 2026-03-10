import { useEffect, useState } from "react";
import { loadSiteSettings } from "../lib/siteData";
import { getFallbackSiteSettings } from "../lib/site";
import { SiteSettingsContext } from "./siteSettingsContext.js";

export function SiteSettingsProvider({ children }) {
  const [siteSettings, setSiteSettings] = useState(() => getFallbackSiteSettings());

  useEffect(() => {
    let isMounted = true;

    loadSiteSettings().then((loadedSettings) => {
      if (!isMounted || !loadedSettings) return;
      setSiteSettings(loadedSettings);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SiteSettingsContext.Provider value={siteSettings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
