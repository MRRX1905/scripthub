import type { RealtimeChannel } from "@supabase/supabase-js";
import type {
  ScriptSubmission,
  SubmissionStatus,
} from "../types";
import { requireSupabase, supabase } from "./supabase";

interface SubmissionRow {
  id: number;
  sender_name: string;
  script_content: string;
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
}

let submissionSubscriptionId = 0;

const toSubmission = (row: SubmissionRow): ScriptSubmission => ({
  id: Number(row.id),
  senderName: row.sender_name,
  scriptContent: row.script_content,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function submitScriptSuggestion(
  senderName: string,
  scriptContent: string,
) {
  const { error } = await requireSupabase()
    .from("script_submissions")
    .insert({
      sender_name: senderName.trim(),
      script_content: scriptContent.trim(),
    });

  if (error) throw error;
}

export async function fetchScriptSubmissions() {
  const { data, error } = await requireSupabase()
    .from("script_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as SubmissionRow[]).map(toSubmission);
}

export async function updateSubmissionStatus(
  id: number,
  status: SubmissionStatus,
) {
  const { error } = await requireSupabase()
    .from("script_submissions")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteScriptSubmission(id: number) {
  const { error } = await requireSupabase()
    .from("script_submissions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export function subscribeToScriptSubmissions(
  onSubmissions: (items: ScriptSubmission[]) => void,
  onError?: (error: Error) => void,
) {
  const client = supabase;
  if (!client) return () => undefined;

  let active = true;
  let timer: number | undefined;

  const refresh = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      void fetchScriptSubmissions()
        .then((items) => {
          if (active) onSubmissions(items);
        })
        .catch((reason: unknown) => {
          if (!active || !onError) return;
          onError(
            reason instanceof Error
              ? reason
              : new Error("Inbox real-time tidak dapat diperbarui."),
          );
        });
    }, 200);
  };

  const channel: RealtimeChannel = client
    .channel(`scripthub:submissions:${++submissionSubscriptionId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "script_submissions" },
      refresh,
    )
    .subscribe();

  return () => {
    active = false;
    window.clearTimeout(timer);
    void client.removeChannel(channel);
  };
}
