import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-auth";
import { guardText } from "@/lib/moderation-guard";
import { AppShell } from "@/components/AppShell";
import { ReportDialog } from "@/components/SafetyDialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/chats/$id")({
  head: () => ({
    meta: [
      { title: "Gesprek — Dare2Meet" },
      { name: "description", content: "Besloten gesprek tussen waaggenoten." },
      { property: "og:title", content: "Gesprek — Dare2Meet" },
      { property: "og:description", content: "Praat verder met je waaggenoten." },
    ],
  }),
  component: ChatRoom,
});

function ChatRoom() {
  const { id } = Route.useParams();
  const { user } = useSession();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["chat", id],
    queryFn: async () => {
      const { data: conv } = await supabase.from("conversations").select("*").eq("id", id).maybeSingle();
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      const ids = [...new Set((messages ?? []).map((m) => m.sender_id))];
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, first_name").in("id", ids)
        : { data: [] };
      return { conv, messages: messages ?? [], names: new Map((profiles ?? []).map((p) => [p.id, p.first_name])) };
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`messages-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        () => void qc.invalidateQueries({ queryKey: ["chat", id] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [id, qc]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !text.trim()) return;
    if (!(await guardText("chat", text, user.id))) return;
    const body = text.trim();
    setText("");
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: id, sender_id: user.id, body });
    if (error) {
      toast.error("Versturen mislukt", { description: error.message });
      return;
    }
    void qc.invalidateQueries({ queryKey: ["chat", id] });
  }

  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-extrabold text-foreground">{data?.conv?.title ?? "Gesprek"}</h1>

      <div className="surface flex h-[60vh] flex-col p-4">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {(data?.messages ?? []).map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={mine ? "flex justify-end" : "flex items-start gap-2"}>
                <div
                  className={
                    mine
                      ? "max-w-[80%] rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[80%] rounded-xl bg-muted px-3 py-2 text-sm text-foreground"
                  }
                >
                  {!mine ? (
                    <p className="mb-0.5 text-xs font-semibold text-muted-foreground">
                      {data?.names.get(m.sender_id) ?? "Lid"}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </div>
                {!mine ? <ReportDialog userId={m.sender_id} context="message" label="" /> : null}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={send} className="mt-3 flex gap-2">
          <Input
            value={text}
            maxLength={1000}
            placeholder="Schrijf een bericht..."
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" aria-label="Versturen">
            <Send />
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
