export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
};

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.includes("supabase.co")
    );
  } catch {
    return false;
  }
}

export function hasSupabase() {
  return Boolean(
    env.supabaseUrl &&
      env.supabaseServiceRoleKey &&
      isValidSupabaseUrl(env.supabaseUrl)
  );
}
