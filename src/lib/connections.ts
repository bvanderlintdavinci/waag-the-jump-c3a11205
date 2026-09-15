import { supabase } from "@/integrations/supabase/client";

export type ConnectionState = "none" | "pending_out" | "pending_in" | "accepted" | "declined";

export type ConnectionRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
};

export async function fetchConnection(meId: string, otherId: string): Promise<ConnectionRow | null> {
  const { data, error } = await supabase
    .from("connections")
    .select("id, requester_id, addressee_id, status")
    .or(
      `and(requester_id.eq.${meId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${meId})`,
    )
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export function connectionState(row: ConnectionRow | null, meId: string): ConnectionState {
  if (!row) return "none";
  if (row.status === "accepted") return "accepted";
  if (row.status === "declined") return "declined";
  return row.requester_id === meId ? "pending_out" : "pending_in";
}

export async function requestConnection(meId: string, otherId: string) {
  const { error } = await supabase.from("connections").insert({ requester_id: meId, addressee_id: otherId });
  if (error) throw error;
}

export async function respondConnection(id: string, accept: boolean) {
  const { error } = await supabase
    .from("connections")
    .update({ status: accept ? "accepted" : "declined" })
    .eq("id", id);
  if (error) throw error;
}

export async function removeConnection(id: string) {
  const { error } = await supabase.from("connections").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleFavorite(meId: string, otherId: string, isFavorite: boolean) {
  if (isFavorite) {
    const { error } = await supabase.from("favorites").delete().eq("owner_id", meId).eq("favorite_id", otherId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("favorites").insert({ owner_id: meId, favorite_id: otherId });
  if (error) throw error;
}
