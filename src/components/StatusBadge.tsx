import { CircleCheck, KeyRound, LockKeyholeOpen } from "lucide-react";
import { executorStatusLabel, keySystemLabel } from "../lib/format";
import type { ExecutorState, KeySystem } from "../types";

export function KeyBadge({ value }: { value: KeySystem }) {
  return (
    <span className={`badge badge--${value}`}>
      {value === "no-key" ? (
        <LockKeyholeOpen size={13} aria-hidden="true" />
      ) : (
        <KeyRound size={13} aria-hidden="true" />
      )}
      {keySystemLabel[value]}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="verified-label">
      <CircleCheck size={14} aria-hidden="true" />
      Ditinjau Admin
    </span>
  );
}

export function ExecutorStatusBadge({ value }: { value: ExecutorState }) {
  return (
    <span className={`status status--${value}`}>
      <span aria-hidden="true" />
      {executorStatusLabel[value]}
    </span>
  );
}
