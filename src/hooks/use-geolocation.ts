import { useCallback, useEffect, useRef, useState } from "react";

export type Coords = { lat: number; lng: number; accuracy?: number };

export type GeoState = {
  coords: Coords | null;
  error: string | null;
  loading: boolean;
  tracking: boolean;
};

/**
 * Locatietracker: eenmalig ophalen of live volgen van de positie van de gebruiker.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    coords: null,
    error: null,
    loading: false,
    tracking: false,
  });
  const watchId = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (watchId.current != null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setState((s) => ({ ...s, tracking: false }));
  }, []);

  const supported = typeof navigator !== "undefined" && !!navigator.geolocation;

  const request = useCallback(() => {
    if (!supported) {
      setState((s) => ({ ...s, error: "Locatie wordt niet ondersteund door deze browser." }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState((s) => ({
          ...s,
          loading: false,
          error: null,
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy },
        })),
      (err) =>
        setState((s) => ({
          ...s,
          loading: false,
          error:
            err.code === err.PERMISSION_DENIED
              ? "Geen toestemming voor je locatie. Zet dit aan in je browser."
              : "Je locatie kon niet worden bepaald.",
        })),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [supported]);

  const startTracking = useCallback(() => {
    if (!supported) {
      setState((s) => ({ ...s, error: "Locatie wordt niet ondersteund door deze browser." }));
      return;
    }
    if (watchId.current != null) return;
    setState((s) => ({ ...s, tracking: true, error: null }));
    watchId.current = navigator.geolocation.watchPosition(
      (pos) =>
        setState((s) => ({
          ...s,
          error: null,
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy },
        })),
      () =>
        setState((s) => ({
          ...s,
          tracking: false,
          error: "Live volgen is gestopt omdat je locatie niet beschikbaar is.",
        })),
      { enableHighAccuracy: true, maximumAge: 30000 },
    );
  }, [supported]);

  const clear = useCallback(() => {
    stop();
    setState({ coords: null, error: null, loading: false, tracking: false });
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { ...state, supported, request, startTracking, stopTracking: stop, clear };
}
