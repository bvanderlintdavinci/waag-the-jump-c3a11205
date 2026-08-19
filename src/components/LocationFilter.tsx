import { MapPin } from "lucide-react";
import { CATEGORIES } from "@/lib/pinguingo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Filters = {
  place: string;
  radius: number;
  connection: "all" | "friendship" | "dating";
  category: string;
};

export const DEFAULT_FILTERS: Filters = {
  place: "",
  radius: 25,
  connection: "all",
  category: "all",
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
            onChange={(e) => onChange({ ...value, place: e.target.value })}
          />
        </div>
        {resolvedName ? (
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
