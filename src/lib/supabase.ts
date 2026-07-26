import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || "";

export const adminUsername =
  import.meta.env.VITE_ADMIN_USERNAME?.trim() || "admin";
export const adminEmail =
  import.meta.env.VITE_ADMIN_EMAIL?.trim() || "ztropixsantuy@gmail.com";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Backend real-time belum dikonfigurasi. Isi variabel Supabase pada deployment.",
    );
  }

  return supabase;
}
