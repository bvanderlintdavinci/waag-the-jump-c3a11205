import { supabase } from "@/integrations/supabase/client";

/**
 * Zorgt dat er een groepschat bestaat voor een activiteit en dat de gebruiker
 * daarin zit, zodat deelnemers direct kunnen overleggen over tijd en plek.
 */
export async function ensureActivityConversation(
  activityId: string,
  title: string,
  userId: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("activity_id", activityId)
    .maybeSingle();

  let conversationId = existing?.id ?? null;

  if (!conversationId) {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ activity_id: activityId, is_group: true, title, created_by: userId })
      .select("id")
      .maybeSingle();
    if (error || !created) return null;
    conversationId = created.id;
  }

  const { data: member } = await supabase
    .from("conversation_participants")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!member) {
    await supabase.from("conversation_participants").insert({ conversation_id: conversationId, user_id: userId });
  }

  return conversationId;
}
