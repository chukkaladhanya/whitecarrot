import { createClient } from "@supabase/supabase-js";
import { env, hasSupabase } from "@/lib/env";

export function getSupabaseAdmin() {
  if (!hasSupabase()) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false }
  });
}
