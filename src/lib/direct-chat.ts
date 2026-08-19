import { supabase } from "@/integrations/supabase/client";

/** Zoekt een bestaande 1-op-1 chat met `otherId` of maakt er een aan. Geeft het conversatie-id terug. */
export async function openDirectChat(myId: string, otherId: string, title?: string | null) {
  const { data: mine } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", myId);
  const { data: theirs } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", otherId);

  const sharedIds = (mine ?? [])
    .map((m) => m.conversation_id)
    .filter((cid) => (theirs ?? []).some((t) => t.conversation_id === cid));

  if (sharedIds.length) {
    const { data: convs } = await supabase
      .from("conversations")
      .select("id, is_group")
      .in("id", sharedIds);
    const direct = (convs ?? []).find((c) => !c.is_group);
    if (direct) return direct.id;
  }

  const { data: conv, error } = await supabase
    .from("conversations")
    .insert({ is_group: false, created_by: myId, title: title ?? null })
    .select("id")
    .single();
  if (error || !conv) throw error ?? new Error("Chat aanmaken mislukt");

  await supabase.from("conversation_participants").insert([
    { conversation_id: conv.id, user_id: myId },
    { conversation_id: conv.id, user_id: otherId },
  ]);
  return conv.id;
}
