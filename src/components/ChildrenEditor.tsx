import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const CHILD_GENDERS = ["jongen", "meisje", "anders"] as const;

export function useChildren(profileId: string | undefined) {
  return useQuery({
    queryKey: ["children", profileId],
    enabled: !!profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_children")
        .select("id, gender, birth_year")
        .eq("profile_id", profileId!)
        .order("birth_year", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function childLabel(child: { gender: string; birth_year: number }) {
  const age = new Date().getFullYear() - child.birth_year;
  return `${child.gender} (${child.birth_year}, ±${age} jaar)`;
}

export function ChildrenEditor({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: children = [] } = useChildren(userId);
  const [gender, setGender] = useState<string>("jongen");
  const [year, setYear] = useState("");
  const [busy, setBusy] = useState(false);

  const currentYear = new Date().getFullYear();

  async function add() {
    const birthYear = Number(year);
    if (!birthYear || birthYear < currentYear - 30 || birthYear > currentYear) {
      toast.error("Vul een geldig geboortejaar in.");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("profile_children")
      .insert({ profile_id: userId, gender, birth_year: birthYear });
    setBusy(false);
    if (error) {
      toast.error("Toevoegen mislukt", { description: error.message });
      return;
    }
    setYear("");
    await qc.invalidateQueries({ queryKey: ["children", userId] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("profile_children").delete().eq("id", id);
    if (error) {
      toast.error("Verwijderen mislukt", { description: error.message });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["children", userId] });
  }

  return (
    <div className="grid gap-3">
      <div>
        <Label>Kinderen (vrijwillig)</Label>
        <p className="text-xs text-muted-foreground">
          Geef per kind het geslacht en geboortejaar op. Geen namen, geen exacte geboortedatum. Andere leden zien
          dit, zodat gezinnen elkaar makkelijker vinden.
        </p>
      </div>

      {children.length ? (
        <ul className="grid gap-2">
          {children.map((child) => (
            <li key={child.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
              <span className="text-foreground">{childLabel(child)}</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => void remove(child.id)}>
                <Trash2 className="size-4" /> Verwijderen
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">Nog geen kinderen toegevoegd.</p>
      )}

      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="grid gap-1.5">
          <Label htmlFor="child-gender">Geslacht</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="child-gender">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHILD_GENDERS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="child-year">Geboortejaar</Label>
          <Input
            id="child-year"
            type="number"
            min={currentYear - 30}
            max={currentYear}
            placeholder={String(currentYear - 8)}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <Button type="button" variant="outline" disabled={busy} onClick={() => void add()}>
          Kind toevoegen
        </Button>
      </div>
    </div>
  );
}
