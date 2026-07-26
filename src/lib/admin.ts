import type { Session } from "@supabase/supabase-js";
import {
  adminEmail,
  adminUsername,
  requireSupabase,
} from "./supabase";

const isAdminSession = (session: Session | null): session is Session =>
  session?.user.app_metadata?.role === "admin";

export async function getAdminSession() {
  const { data, error } = await requireSupabase().auth.getSession();
  if (error) throw error;
  return isAdminSession(data.session) ? data.session : null;
}

export async function loginAdmin(username: string, password: string) {
  if (username.trim().toLowerCase() !== adminUsername.toLowerCase()) {
    throw new Error("Username atau password admin tidak benar.");
  }

  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email: adminEmail,
    password,
  });

  if (error || !isAdminSession(data.session)) {
    if (data.session) await client.auth.signOut();
    throw new Error("Username atau password admin tidak benar.");
  }

  return data.session;
}

export async function logoutAdmin() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function changeAdminPassword(
  currentPassword: string,
  nextPassword: string,
) {
  const { error } = await requireSupabase().auth.updateUser({
    password: nextPassword,
    current_password: currentPassword,
  });

  if (error) throw error;
}
