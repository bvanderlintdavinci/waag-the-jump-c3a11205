import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: unknown; userId: string }) {
  const supabase = context.supabase as {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  };
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || data !== true) throw new Error("Forbidden");
}

export const runUitagendaImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { cities?: string[] } | undefined) => ({
    cities: (input?.cities ?? []).map((c) => String(c).slice(0, 60)).slice(0, 12),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { importUitagenda } = await import("@/lib/external-events.server");
    try {
      const result = await importUitagenda(data.cities);
      return { ok: true as const, ...result };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Onbekende fout";
      console.error("[uitagenda] import mislukt", message);
      return { ok: false as const, saved: 0, cities: data.cities, errors: [message] };
    }
  });
