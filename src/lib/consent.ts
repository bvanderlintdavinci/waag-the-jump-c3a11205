/**
 * Toestemmingsbeheer voor niet-noodzakelijke cookies/trackers.
 *
 * Zet een tracker in NON_ESSENTIAL_TRACKERS zodra die echt op de site actief
 * wordt (bijv. AdSense-advertenties na goedkeuring). Zolang de lijst leeg is,
 * verschijnt de toestemmingsbanner niet en wordt niets extra geladen.
 */
export type ConsentCategory = "advertising" | "analytics";

export interface TrackerDef {
  id: string;
  category: ConsentCategory;
  name: string;
  provider: string;
}

export const NON_ESSENTIAL_TRACKERS: TrackerDef[] = [
  // Activeer na AdSense-goedkeuring:
  // { id: "adsense", category: "advertising", name: "Google AdSense-advertenties", provider: "Google" },
];

export const CONSENT_VERSION = "2026-11-02";
const KEY = "d2m-consent";
export const CONSENT_EVENT = "d2m-consent-change";
export const OPEN_CONSENT_EVENT = "d2m-open-consent";

export interface ConsentState {
  version: string;
  decidedAt: string;
  advertising: boolean;
  analytics: boolean;
}

export function trackersActive(): boolean {
  return NON_ESSENTIAL_TRACKERS.length > 0;
}

export function activeCategories(): ConsentCategory[] {
  return Array.from(new Set(NON_ESSENTIAL_TRACKERS.map((t) => t.category)));
}

export function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasConsent(category: ConsentCategory): boolean {
  return readConsent()?.[category] === true;
}

export function saveConsent(choice: { advertising: boolean; analytics: boolean }) {
  const state: ConsentState = { version: CONSENT_VERSION, decidedAt: new Date().toISOString(), ...choice };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* opslag geblokkeerd */
  }
  applyGoogleConsent(state);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
  return state;
}

/** Google Consent Mode: standaard geweigerd, alleen bijwerken na keuze. */
export function applyGoogleConsent(state: ConsentState | null) {
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  }
  if (state) {
    const ad = state.advertising ? "granted" : "denied";
    w.gtag("consent", "update", {
      ad_storage: ad,
      ad_user_data: ad,
      ad_personalization: ad,
      analytics_storage: state.analytics ? "granted" : "denied",
    });
  }
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}
