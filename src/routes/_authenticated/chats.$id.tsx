import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Check, CheckCheck, ShieldAlert, Send, Smile } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-auth";
import { guardText } from "@/lib/moderation-guard";
import { AppShell } from "@/components/AppShell";
import { BlockDialog, ReportDialog } from "@/components/SafetyDialogs";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MeetupCard } from "@/components/MeetupCard";
import { MeetupDialog, type MeetupDraft } from "@/components/MeetupDialog";
import { buildIcebreakers, detectSensitive, readMeetup, sharedInterests, type MeetupPayload } from "@/lib/chat-extras";
import type { Json } from "@/integrations/supabase/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const Route = createFileRoute("/_authenticated/chats/$id")({
  head: () => ({
    meta: [
      { title: "Gesprek | Dare2Meet" },
      { name: "description", content: "Besloten gesprek tussen waaggenoten." },
      { property: "og:title", content: "Gesprek | Dare2Meet" },
      { property: "og:description", content: "Praat verder met je waaggenoten." },
    ],
  }),
  component: ChatRoom,
});

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🙌", "☕"];

const EMOJIS = [
  "😀","😃","😄","😁","😊","😉","😍","🥰","😘","😎",
  "🤗","🤔","😅","😇","🙃","😴","🥳","😢","😮","😐",
  "❤️","🧡","💛","💚","💙","💜","🤍","💖","💕","✨",
  "👍","👏","🙌","🙏","🤝","👋","💪","🤞","✌️","🫶",
  "🎉","🔥","☕","🍻","🍕","🌞","🌧️","🏃","🚶","🐧",
];

function ChatRoom() {
  const { id } = Route.useParams();
  const { user } = useSession();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["chat", id],
    queryFn: async () => {
      const { data: conv } = await supabase.from("conversations").select("*").eq("id", id).maybeSingle();
      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", id);
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      const ids = [
        ...new Set([...(parts ?? []).map((p) => p.user_id), ...(messages ?? []).map((m) => m.sender_id)]),
      ];
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, first_name, avatar_url, interests, onboarded, bio").in("id", ids)
        : { data: [] };
      return {
        conv,
        messages: messages ?? [],
        participantIds: (parts ?? []).map((p) => p.user_id),
        profiles: new Map((profiles ?? []).map((p) => [p.id, p])),
      };
    },
  });

  const [typingName, setTypingName] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastTypingSent = useRef(0);

  useEffect(() => {
    let typingTimer: number | undefined;
    const channel = supabase
      .channel(`messages-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        () => void qc.invalidateQueries({ queryKey: ["chat", id] }),
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.userId === user?.id) return;
        setTypingName(String(payload?.name ?? "Iemand"));
        window.clearTimeout(typingTimer);
        typingTimer = window.setTimeout(() => setTypingName(null), 3000);
      })
      .subscribe();
    channelRef.current = channel;
    return () => {
      window.clearTimeout(typingTimer);
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [id, qc, user?.id]);

  // Markeer binnengekomen berichten als gelezen.
  const unreadFromOthers = (data?.messages ?? []).some((m) => m.sender_id !== user?.id && !m.read_at);
  useEffect(() => {
    if (!user || !unreadFromOthers) return;
    void supabase.rpc("mark_conversation_read", { _conversation_id: id });
  }, [id, user, unreadFromOthers, data?.messages.length]);

  function announceTyping() {
    const now = Date.now();
    if (!user || now - lastTypingSent.current < 1500) return;
    lastTypingSent.current = now;
    void channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: user.id, name: data?.profiles.get(user.id)?.first_name ?? "Iemand" },
    });
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

  const otherId = (data?.participantIds ?? []).find((p) => p !== user?.id);
  const other = otherId ? data?.profiles.get(otherId) : undefined;
  const isDirect = !data?.conv?.is_group && !!otherId;
  const me = user ? data?.profiles.get(user.id) : undefined;
  const shared = sharedInterests(me?.interests, other?.interests);
  const otherVerified = !!other?.onboarded && !!other?.avatar_url;
  const messages = data?.messages ?? [];
  const icebreakers = isDirect && data && messages.length === 0 ? buildIcebreakers(shared) : [];
  // Veiligheidswaarschuwing: eerste bericht van een afzender met gevoelige gegevens.
  const firstBySender = new Map<string, string>();
  for (const m of messages) if (!firstBySender.has(m.sender_id)) firstBySender.set(m.sender_id, m.id);
  const lastMineId = [...messages].reverse().find((m) => m.sender_id === user?.id)?.id;

  async function sendMeetup(d: MeetupDraft) {
    if (!user) return false;
    const payload: MeetupPayload = { ...d, proposed_by: user.id, status: "pending" };
    const { error } = await supabase.from("messages").insert({
      conversation_id: id,
      sender_id: user.id,
      kind: "meetup",
      body: `Uitnodiging: ${d.type}`,
      meetup: payload as unknown as Json,
    });
    if (error) {
      toast.error("Versturen mislukt", { description: error.message });
      return false;
    }
    void qc.invalidateQueries({ queryKey: ["chat", id] });
    return true;
  }

  async function sendBody(body: string) {
    if (!user || !body.trim()) return;
    if (!(await guardText("chat", body, user.id))) return;
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: id, sender_id: user.id, body: body.trim() });
    if (error) {
      toast.error("Versturen mislukt", { description: error.message });
      return;
    }
    void qc.invalidateQueries({ queryKey: ["chat", id] });
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text;
    setText("");
    await sendBody(body);
  }

  return (
    <AppShell>
      <div className="surface mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          {isDirect ? (
            <UserAvatar path={other?.avatar_url} name={other?.first_name} />
          ) : null}
          <div>
            <h1 className="text-lg font-extrabold text-foreground">
              {isDirect ? (other?.first_name ?? "Lid") : (data?.conv?.title ?? "Gesprek")}
            </h1>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {isDirect && otherVerified ? (
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <BadgeCheck className="size-3.5" /> Geverifieerd profiel ·
                </span>
              ) : null}
              {typingName ? `${typingName} typt...` : isDirect ? "Besloten gesprek" : "Groepschat van dit Waagje"}
            </p>
            {isDirect && shared.length ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {shared.slice(0, 5).map((i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{i}</Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {isDirect && otherId ? (
          <div className="flex items-center gap-2">
            <ReportDialog userId={otherId} context="chat" label="Meld gebruiker" />
            <BlockDialog userId={otherId} userName={other?.first_name ?? "Dit lid"} />
          </div>
        ) : null}
      </div>

      <div className="surface flex h-[60vh] flex-col p-4">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {icebreakers.length ? (
            <div className="rounded-xl bg-muted p-4">
              <p className="text-sm font-semibold text-foreground">Breek het ijs</p>
              <p className="text-xs text-muted-foreground">Tik op een vraag om hem als eerste bericht te sturen.</p>
              <div className="mt-3 flex flex-col gap-2">
                {icebreakers.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition hover:border-primary"
                    onClick={() => void sendBody(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {messages.map((m) => {
            const mine = m.sender_id === user?.id;
            const meetup = readMeetup(m);
            const sensitive = firstBySender.get(m.sender_id) === m.id ? detectSensitive(m.body) : [];
            const status = mine && m.id === lastMineId ? (m.read_at ? "Gelezen" : "Verzonden") : null;
            if (meetup) {
              return (
                <div key={m.id} className={mine ? "flex flex-col items-end" : "flex flex-col items-start"}>
                  <MeetupCard messageId={m.id} meetup={meetup} myId={user?.id} />
                  {status ? <StatusLine read={!!m.read_at} label={status} /> : null}
                </div>
              );
            }
            return (
              <div key={m.id} className={mine ? "flex flex-wrap justify-end" : "flex flex-wrap items-start gap-2"}>
                {!mine ? (
                  <UserAvatar
                    path={data?.profiles.get(m.sender_id)?.avatar_url}
                    name={data?.profiles.get(m.sender_id)?.first_name}
                    className="size-8"
                  />
                ) : null}
                <div
                  className={
                    mine
                      ? "max-w-[80%] rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[80%] rounded-xl bg-muted px-3 py-2 text-sm text-foreground"
                  }
                >
                  {!mine ? (
                    <p className="mb-0.5 text-xs font-semibold text-muted-foreground">
                      {data?.profiles.get(m.sender_id)?.first_name ?? "Lid"}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </div>
                {!mine ? <ReportDialog userId={m.sender_id} context="message" label="" /> : null}
                {sensitive.length ? (
                  <p className="flex w-full items-center gap-1 text-xs text-muted-foreground">
                    <ShieldAlert className="size-3.5 text-primary" />
                    Let op: dit bericht lijkt een {sensitive.join(" / ")} te bevatten. Deel persoonlijke gegevens pas als je iemand vertrouwt.
                  </p>
                ) : null}
                {status ? <StatusLine read={!!m.read_at} label={status} /> : null}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1">
          {isDirect ? <MeetupDialog onSend={sendMeetup} /> : null}
          {QUICK_REACTIONS.map((e) => (
            <button
              key={e}
              type="button"
              aria-label={`Stuur ${e}`}
              className="rounded-full border border-border px-2 py-1 text-base transition hover:bg-muted"
              onClick={() => void sendBody(e)}
            >
              {e}
            </button>
          ))}
        </div>

        <form onSubmit={send} className="mt-2 flex gap-2">
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="icon" aria-label="Emoji kiezen">
                <Smile />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
              <div className="grid grid-cols-8 gap-1">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className="rounded p-1 text-lg transition hover:bg-muted"
                    onClick={() => {
                      setText((t) => t + e);
                      setEmojiOpen(false);
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Input
            value={text}
            maxLength={1000}
            placeholder="Schrijf een bericht..."
            onChange={(e) => {
              setText(e.target.value);
              announceTyping();
            }}
          />
          <Button type="submit" aria-label="Versturen">
            <Send />
          </Button>
        </form>
      </div>
    </AppShell>
  );
}

function StatusLine({ read, label }: { read: boolean; label: string }) {
  return (
    <p className="flex w-full items-center justify-end gap-1 text-[11px] text-muted-foreground">
      {read ? <CheckCheck className="size-3.5 text-primary" /> : <Check className="size-3.5" />} {label}
    </p>
  );
}
