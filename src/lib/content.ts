import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ContentData, ExecutorItem, ScriptItem } from "../types";
import { requireSupabase, supabase } from "./supabase";

let realtimeSubscriptionId = 0;

interface ScriptRow {
  id: string;
  slug: string;
  title: string;
  game: string;
  category: string;
  summary: string;
  description: string;
  features: string[];
  key_system: ScriptItem["keySystem"];
  executors: string[];
  thumbnail: string;
  script_code: string;
  verified_by_admin: boolean;
  published: boolean;
  views: number;
  updated_at: string;
}

interface ExecutorRow {
  id: string;
  name: string;
  status: ExecutorItem["status"];
  platforms: string[];
  compatible_scripts: number;
  description: string;
  updated_at: string;
}

const toScript = (row: ScriptRow): ScriptItem => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  game: row.game,
  category: row.category,
  summary: row.summary,
  description: row.description,
  features: row.features ?? [],
  keySystem: row.key_system,
  executors: row.executors ?? [],
  thumbnail: row.thumbnail,
  scriptCode: row.script_code,
  verifiedByAdmin: row.verified_by_admin,
  published: row.published,
  views: Number(row.views),
  updatedAt: row.updated_at,
});

const toExecutor = (row: ExecutorRow): ExecutorItem => ({
  id: row.id,
  name: row.name,
  status: row.status,
  platforms: row.platforms ?? [],
  compatibleScripts: Number(row.compatible_scripts),
  description: row.description,
  updatedAt: row.updated_at,
});

const toScriptRow = (script: ScriptItem): ScriptRow => ({
  id: script.id,
  slug: script.slug,
  title: script.title,
  game: script.game,
  category: script.category,
  summary: script.summary,
  description: script.description,
  features: script.features,
  key_system: script.keySystem,
  executors: script.executors,
  thumbnail: script.thumbnail,
  script_code: script.scriptCode,
  verified_by_admin: script.verifiedByAdmin,
  published: script.published,
  views: script.views,
  updated_at: script.updatedAt,
});

const toExecutorRow = (executor: ExecutorItem): ExecutorRow => ({
  id: executor.id,
  name: executor.name,
  status: executor.status,
  platforms: executor.platforms,
  compatible_scripts: executor.compatibleScripts,
  description: executor.description,
  updated_at: executor.updatedAt,
});

export async function fetchRealtimeContent(): Promise<ContentData> {
  const client = requireSupabase();
  const [scriptsResult, executorsResult] = await Promise.all([
    client.from("scripts").select("*").order("updated_at", { ascending: false }),
    client
      .from("executors")
      .select("*")
      .order("name", { ascending: true }),
  ]);

  if (scriptsResult.error) throw scriptsResult.error;
  if (executorsResult.error) throw executorsResult.error;

  const scripts = (scriptsResult.data as ScriptRow[]).map(toScript);
  const executors = (executorsResult.data as ExecutorRow[]).map(toExecutor);
  const timestamps = [
    ...scripts.map((item) => item.updatedAt),
    ...executors.map((item) => item.updatedAt),
  ];

  return {
    version: 2,
    updatedAt: timestamps.sort().at(-1) || new Date().toISOString(),
    scripts,
    executors,
  };
}

export async function upsertScript(script: ScriptItem) {
  const { error } = await requireSupabase()
    .from("scripts")
    .upsert(toScriptRow(script), { onConflict: "id" });

  if (error) throw error;
}

export async function removeScript(id: string) {
  const { error } = await requireSupabase()
    .from("scripts")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function upsertExecutors(executors: ExecutorItem[]) {
  const { error } = await requireSupabase()
    .from("executors")
    .upsert(executors.map(toExecutorRow), { onConflict: "id" });

  if (error) throw error;
}

export function subscribeToContent(
  onContent: (content: ContentData) => void,
  onError?: (error: Error) => void,
) {
  const client = supabase;
  if (!client) return () => undefined;

  let timer: number | undefined;
  let active = true;

  const refresh = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      void fetchRealtimeContent()
        .then((content) => {
          if (active) onContent(content);
        })
        .catch((reason: unknown) => {
          if (!active || !onError) return;
          onError(
            reason instanceof Error
              ? reason
              : new Error("Sinkronisasi real-time gagal."),
          );
        });
    }, 60);
  };

  const channel: RealtimeChannel = client
    .channel(`scripthub:content:${++realtimeSubscriptionId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "scripts" },
      refresh,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "executors" },
      refresh,
    )
    .subscribe();

  return () => {
    active = false;
    window.clearTimeout(timer);
    void client.removeChannel(channel);
  };
}
