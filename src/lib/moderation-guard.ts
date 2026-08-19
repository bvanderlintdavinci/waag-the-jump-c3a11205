import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { checkText } from "@/lib/moderation";

/**
 * Controleert vrije tekst. Bij een treffer wordt de poging als 'High Risk'
 * gelogd in de admin logs en wordt de actie geblokkeerd.
 */
export async function guardText(
  field: string,
  content: string,
  userId?: string | null,
): Promise<boolean> {
  const result = checkText(content);
  if (result.ok) return true;

  if (userId) {
    await supabase.from("moderation_logs").insert({
      user_id: userId,
      field,
      content: content.slice(0, 2000),
      matched_terms: result.matches,
      severity: "high",
    });
  }
  toast.error("Bericht geblokkeerd", {
    description: "Deze tekst bevat taal die niet is toegestaan. De poging is gelogd.",
  });
  return false;
}
