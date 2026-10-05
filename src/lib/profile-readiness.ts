import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

type ReadinessProfile = Pick<Tables<"profiles">, "avatar_url" | "bio" | "interests">;

export interface ReadinessCheck {
  key: "photo" | "about" | "verified";
  label: string;
  done: boolean;
  weight: number;
}

export interface ProfileReadiness {
  percent: number;
  ready: boolean;
  checks: ReadinessCheck[];
}

/** Minimaal 80% en alle drie de voorwaarden: foto, bio of 3 interesses, geverifieerd e-mailadres. */
export function computeReadiness(
  profile: ReadinessProfile | null | undefined,
  user: Pick<User, "email_confirmed_at"> | null | undefined,
): ProfileReadiness {
  const checks: ReadinessCheck[] = [
    { key: "photo", label: "Profielfoto toegevoegd", done: !!profile?.avatar_url, weight: 40 },
    {
      key: "about",
      label: "Bio ingevuld of minstens 3 interesses",
      done: (profile?.bio ?? "").trim().length >= 20 || (profile?.interests ?? []).length >= 3,
      weight: 40,
    },
    { key: "verified", label: "E-mailadres geverifieerd", done: !!user?.email_confirmed_at, weight: 20 },
  ];
  const percent = checks.reduce((s, c) => s + (c.done ? c.weight : 0), 0);
  return { percent, ready: percent >= 80 && checks.every((c) => c.done), checks };
}

export class ProfileNotReadyError extends Error {
  constructor() {
    super("Maak eerst je profiel af om een nieuwe chat te starten.");
    this.name = "ProfileNotReadyError";
  }
}
