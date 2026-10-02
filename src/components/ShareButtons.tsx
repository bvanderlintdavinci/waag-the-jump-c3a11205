import { Facebook, Link2, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** Deelknoppen zodat bezoekers een pagina met één tik doorsturen. */
export function ShareButtons({ url, text }: { url: string; text: string }) {
  const tracked = `${url}${url.includes("?") ? "&" : "?"}utm_source=share&utm_medium=social`;
  const enc = encodeURIComponent;

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: text, text, url: tracked });
      } catch {
        /* geannuleerd */
      }
    } else {
      await copy();
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(tracked);
      toast.success("Link gekopieerd");
    } catch {
      toast.error("Kopiëren lukte niet");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-foreground">Ken je iemand die mee wil?</span>
      <a href={`https://wa.me/?text=${enc(`${text} ${tracked}`)}`} target="_blank" rel="noopener noreferrer">
        <Button size="sm" variant="outline"><MessageCircle className="size-4" />WhatsApp</Button>
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(tracked)}`} target="_blank" rel="noopener noreferrer">
        <Button size="sm" variant="outline"><Facebook className="size-4" />Facebook</Button>
      </a>
      <Button size="sm" variant="outline" onClick={copy}><Link2 className="size-4" />Kopieer link</Button>
      <Button size="sm" variant="ghost" onClick={nativeShare} aria-label="Delen"><Share2 className="size-4" /></Button>
    </div>
  );
}
