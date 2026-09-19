import { sendTemplateEmail } from "@/lib/email-templates/send-email";

function dutchDate(d: Date): string {
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Amsterdam" });
}

export interface WeeklyReportStats {
  periodLabel: string
  visitors: number
  signups: number
  chatMessages: number
  activityBookings: number
  averageMinutes: number
  totalHours: number
}

export async function collectWeeklyStats(): Promise<WeeklyReportStats> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date();
  const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sinceIso = since.toISOString();

  const [sessions, signups, messages, participants, requests] = await Promise.all([
    supabaseAdmin.from("site_sessions").select("first_seen_at, last_seen_at").gte("first_seen_at", sinceIso),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sinceIso),
    supabaseAdmin.from("messages").select("id", { count: "exact", head: true }).gte("created_at", sinceIso),
    supabaseAdmin.from("activity_participants").select("id", { count: "exact", head: true }).gte("created_at", sinceIso),
    supabaseAdmin
      .from("activity_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted")
      .gte("updated_at", sinceIso),
  ]);

  const rows = sessions.data ?? [];
  const totalMs = rows.reduce((sum, r) => {
    const start = new Date(r.first_seen_at).getTime();
    const end = new Date(r.last_seen_at).getTime();
    return sum + Math.max(0, end - start);
  }, 0);
  const visitors = rows.length;

  return {
    periodLabel: `${dutchDate(since)} t/m ${dutchDate(now)}`,
    visitors,
    signups: signups.count ?? 0,
    chatMessages: messages.count ?? 0,
    activityBookings: (participants.count ?? 0) + (requests.count ?? 0),
    averageMinutes: visitors ? Math.round(totalMs / visitors / 60000) : 0,
    totalHours: Math.round((totalMs / 3600000) * 10) / 10,
  };
}

export async function sendWeeklyReport() {
  const stats = await collectWeeklyStats();
  const result = await sendTemplateEmail("weekly-report", "dare2meet@proton.me", {
    templateData: stats as unknown as Record<string, unknown>,
    idempotencyKey: `weekly-report-${stats.periodLabel}`,
  });
  return { stats, result };
}
