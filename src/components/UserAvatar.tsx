import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function useAvatarUrl(path?: string | null | undefined) {
  return useQuery({
    queryKey: ["avatar", path],
    enabled: !!path,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data } = await supabase.storage.from("avatars").createSignedUrl(path!, 60 * 60);
      return data?.signedUrl ?? null;
    },
  });
}

export function UserAvatar({
  path,
  name,
  className,
}: {
  path?: string | null | undefined;
  name?: string | null | undefined;
  className?: string | undefined;
}) {
  const { data: url } = useAvatarUrl(path);
  return (
    <Avatar className={cn("size-11 border border-border", className)}>
      {url ? <AvatarImage src={url} alt={name ?? "Profielfoto"} /> : null}
      <AvatarFallback className="bg-mint text-mint-foreground font-semibold">
        {(name ?? "?").slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
