import type { RealtimeChannel } from "@supabase/supabase-js";
import type { AnalyticsDashboardData } from "../types";
import { requireSupabase, supabase } from "./supabase";

const VISITOR_STORAGE_KEY = "scripthub:anonymous-visitor:v1";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let memoryVisitorId = "";
let lastTrackedPath = "";
let analyticsSubscriptionId = 0;

function createVisitorId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return [
    value.slice(0, 8),
    value.slice(8, 12),
    value.slice(12, 16),
    value.slice(16, 20),
    value.slice(20),
  ].join("-");
}

function getVisitorId() {
  if (memoryVisitorId) return memoryVisitorId;

  try {
    const stored = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (stored && UUID_PATTERN.test(stored)) {
      memoryVisitorId = stored;
      return stored;
    }

    memoryVisitorId = createVisitorId();
    window.localStorage.setItem(VISITOR_STORAGE_KEY, memoryVisitorId);
    return memoryVisitorId;
  } catch {
    memoryVisitorId = createVisitorId();
    return memoryVisitorId;
  }
}

export function trackPublicPageView(path: string, scriptId?: string) {
  const client = supabase;
  if (
    !import.meta.env.PROD ||
    !client ||
    path.startsWith("/admin") ||
    path === lastTrackedPath
  ) {
    return;
  }

  lastTrackedPath = path;
  const visitorId = getVisitorId();

  window.setTimeout(() => {
    void client
      .from("analytics_events")
      .insert({
        visitor_id: visitorId,
        path,
        script_id: scriptId || null,
      })
      .then(({ error }) => {
        if (error) {
          console.warn("View analitik tidak dapat dicatat:", error.message);
        }
      });
  }, 0);
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDashboard(value: unknown): AnalyticsDashboardData {
  const data =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const daily = Array.isArray(data.daily) ? data.daily : [];
  const trending = Array.isArray(data.trending) ? data.trending : [];

  return {
    totalViews: numberValue(data.totalViews),
    uniqueVisitors: numberValue(data.uniqueVisitors),
    viewsToday: numberValue(data.viewsToday),
    visitorsToday: numberValue(data.visitorsToday),
    activeVisitors: numberValue(data.activeVisitors),
    daily: daily.map((item) => {
      const point = item as Record<string, unknown>;
      return {
        date: String(point.date || ""),
        views: numberValue(point.views),
        visitors: numberValue(point.visitors),
      };
    }),
    trending: trending.map((item) => {
      const script = item as Record<string, unknown>;
      return {
        id: String(script.id || ""),
        slug: String(script.slug || ""),
        title: String(script.title || ""),
        game: String(script.game || ""),
        thumbnail: String(script.thumbnail || ""),
        views7d: numberValue(script.views7d),
        visitors7d: numberValue(script.visitors7d),
        viewsTotal: numberValue(script.viewsTotal),
      };
    }),
    updatedAt: String(data.updatedAt || new Date().toISOString()),
  };
}

export async function fetchAnalyticsDashboard() {
  const { data, error } = await requireSupabase().rpc(
    "admin_analytics_dashboard",
    {
      p_days: 7,
      p_trending_limit: 5,
    },
  );

  if (error) throw error;
  return normalizeDashboard(data);
}

export function subscribeToAnalytics(
  onAnalytics: (data: AnalyticsDashboardData) => void,
  onError?: (error: Error) => void,
) {
  const client = supabase;
  if (!client) return () => undefined;

  let timer: number | undefined;
  let active = true;

  const refresh = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      void fetchAnalyticsDashboard()
        .then((data) => {
          if (active) onAnalytics(data);
        })
        .catch((reason: unknown) => {
          if (!active || !onError) return;
          onError(
            reason instanceof Error
              ? reason
              : new Error("Analitik real-time tidak dapat diperbarui."),
          );
        });
    }, 350);
  };

  const channel: RealtimeChannel = client
    .channel(`scripthub:analytics:${++analyticsSubscriptionId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "analytics_events" },
      refresh,
    )
    .subscribe();

  return () => {
    active = false;
    window.clearTimeout(timer);
    void client.removeChannel(channel);
  };
}
