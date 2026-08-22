import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download, RefreshCw } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { runUitagendaImport } from "@/lib/external-events.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function UitagendaImport() {
  const startImport = useServerFn(runUitagendaImport);
  const qc = useQueryClient();
  const [cities, setCities] = useState("Utrecht, Amsterdam, Rotterdam");
  const [busy, setBusy] = useState(false);

  const imported = useQuery({
    queryKey: ["external-events-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("external_events")
        .select("id, title, city, source, starts_at, imported_at")
        .order("starts_at", { ascending: true })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function onImport() {
    setBusy(true);
    try {
      const list = cities
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      const result = await startImport({ data: { cities: list } });
      if (result.ok) {
        toast.success(`${result.saved} evenementen opgehaald`, {
          description: result.errors.length ? result.errors.join(" · ") : undefined,
        });
      } else {
        toast.error("Ophalen mislukt", { description: result.errors.join(" · ") });
      }
      await qc.invalidateQueries({ queryKey: ["external-events-admin"] });
      await qc.invalidateQueries({ queryKey: ["external-events"] });
    } catch {
      toast.error("Ophalen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="surface space-y-3 p-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Externe uitagenda's ophalen</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Haalt automatisch evenementen op van Dagjeweg.nl en wattedoenin.nl voor de opgegeven plaatsen.
            Bestaande items worden bijgewerkt en verlopen items opgeruimd.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            value={cities}
            onChange={(e) => setCities(e.target.value)}
            placeholder="Plaatsen, gescheiden door komma's"
            className="max-w-md"
          />
          <Button onClick={() => void onImport()} disabled={busy}>
            <Download /> {busy ? "Bezig..." : "Nu ophalen"}
          </Button>
          <Button variant="outline" onClick={() => void imported.refetch()}>
            <RefreshCw /> Ververs
          </Button>
        </div>
      </div>

      {imported.isLoading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : (imported.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">Nog geen externe evenementen opgehaald.</p>
      ) : (
        <ul className="space-y-2">
          {(imported.data ?? []).map((e) => (
            <li key={e.id} className="surface flex flex-wrap items-center gap-3 p-3 text-sm">
              <span className="font-medium text-foreground">{e.title}</span>
              <Badge variant="outline">{e.source}</Badge>
              <span className="text-xs text-muted-foreground">
                {e.city} · {new Date(e.starts_at).toLocaleDateString("nl-NL", { dateStyle: "medium" })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
