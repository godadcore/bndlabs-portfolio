import { createContext, useContext } from "react";
import { getFallbackSiteSettings } from "../lib/site";

export const SiteSettingsContext = createContext(getFallbackSiteSettings());

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
