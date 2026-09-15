import { createLovableAuth } from "@lovable.dev/cloud-auth-js";

import { supabase } from "@/integrations/supabase/client";

const oauth = createLovableAuth({
  oauthBrokerUrl: "https://waag-the-jump.lovable.app/~oauth/initiate",
});

export async function signInWithGoogle(redirectUri: string) {
  const result = await oauth.signInWithOAuth("google", { redirect_uri: redirectUri });
  if (result.redirected || result.error) return result;

  const { error } = await supabase.auth.setSession(result.tokens);
  return error ? { error } : result;
}