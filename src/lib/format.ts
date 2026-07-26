import type { ExecutorState, KeySystem } from "../types";

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));

export const keySystemLabel: Record<KeySystem, string> = {
  "no-key": "Tanpa Key",
  "key-required": "Perlu Key",
};

export const executorStatusLabel: Record<ExecutorState, string> = {
  online: "Online",
  updated: "Updated",
  maintenance: "Maintenance",
};

export const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
