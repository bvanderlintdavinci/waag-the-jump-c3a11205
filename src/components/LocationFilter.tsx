import { useEffect } from "react";
import { Crosshair, LocateFixed, MapPin, X } from "lucide-react";

import { CATEGORIES } from "@/lib/pinguingo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGeolocation } from "@/hooks/use-geolocation";
import { nearestPlaceName } from "@/lib/geo";

export type Filters = {
  place: string;
  radius: number;
  connection: "all" | "friendship" | "dating";
  category: string;
  coords: { lat: number; lng: number; name: string } | null;
};

export const DEFAULT_FILTERS: Filters = {
  place: "",
  radius: 25,
  connection: "all",
  category: "all",
  coords: null,
};

export function LocationFilter({
  value,
  onChange,
  resolvedName,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
  resolvedName?: string | null | undefined;
}) {
  const geo = useGeolocation();

  useEffect(() => {
    if (!geo.coords) return;
    const { lat, lng } = geo.coords;
    if (value.coords && value.coords.lat === lat && value.coords.lng === lng) return;
    onChange({ ...value, place: "", coords: { lat, lng, name: nearestPlaceName(lat, lng) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.coords]);


  return (
    <div className="surface grid gap-4 p-4 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <Label htmlFor="place">Plaatsnaam of postcode</Label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="place"
            className="pl-9"
            placeholder="Bijv. Utrecht of 3511"
            value={value.place}
            maxLength={60}
            onChange={(e) => onChange({ ...value, place: e.target.value, coords: null })}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button type="button" size="sm" variant="secondary" onClick={geo.request} disabled={geo.loading}>
            <Crosshair className="size-4" />
            {geo.loading ? "Locatie bepalen..." : "Gebruik mijn locatie"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={geo.tracking ? "default" : "outline"}
            onClick={() => (geo.tracking ? geo.stopTracking() : geo.startTracking())}
          >
            <LocateFixed className="size-4" />
            {geo.tracking ? "Live volgen aan" : "Live volgen"}
          </Button>
          {value.coords ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                geo.clear();
                onChange({ ...value, coords: null });
              }}
            >
              <X className="size-4" /> Wissen
            </Button>
          ) : null}
        </div>
        {geo.error ? (
          <p className="text-xs text-destructive">{geo.error}</p>
        ) : value.coords ? (
          <p className="text-xs text-muted-foreground">
            Middelpunt: jouw locatie ({value.coords.name})
            {geo.tracking ? " · wordt live bijgewerkt" : ""}
          </p>
        ) : resolvedName ? (
          <p className="text-xs text-muted-foreground">Middelpunt: {resolvedName}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Leeg = jouw eigen woonplaats</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label>Afstandscirkel: {value.radius} km</Label>
        <Slider
          min={5}
          max={100}
          step={5}
          value={[value.radius]}
          onValueChange={([r]) => onChange({ ...value, radius: r ?? 25 })}
          className="mt-3"
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Type verbinding</Label>
        <Select
          value={value.connection}
          onValueChange={(v) => onChange({ ...value, connection: v as Filters["connection"] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alles</SelectItem>
            <SelectItem value="friendship">Alleen Vrienden/Activiteiten</SelectItem>
            <SelectItem value="dating">Alleen Dating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label>Interesse / categorie</Label>
        <Select value={value.category} onValueChange={(v) => onChange({ ...value, category: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle categorieën</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
