import {
  MonitorSmartphone,
  RefreshCw,
  SquareTerminal,
} from "lucide-react";
import { formatDate, formatNumber } from "../lib/format";
import type { ExecutorItem } from "../types";
import { ExecutorStatusBadge } from "./StatusBadge";

interface ExecutorCardProps {
  executor: ExecutorItem;
  compact?: boolean;
}

export function ExecutorCard({ executor, compact = false }: ExecutorCardProps) {
  if (compact) {
    return (
      <article className="executor-card executor-card--compact">
        <div className="executor-card__icon">
          <SquareTerminal size={21} aria-hidden="true" />
        </div>
        <div>
          <h3>{executor.name}</h3>
          <p>{executor.platforms.join(" / ")}</p>
        </div>
        <ExecutorStatusBadge value={executor.status} />
        <div className="executor-card__count">
          <span>Skrip kompatibel</span>
          <strong>{formatNumber(executor.compatibleScripts)}</strong>
        </div>
      </article>
    );
  }

  return (
    <article className="executor-card">
      <div className="executor-card__heading">
        <div className="executor-card__icon">
          <SquareTerminal size={23} aria-hidden="true" />
        </div>
        <div>
          <h2>{executor.name}</h2>
          <ExecutorStatusBadge value={executor.status} />
        </div>
      </div>
      <p>{executor.description}</p>
      <dl>
        <div>
          <dt>
            <MonitorSmartphone size={16} aria-hidden="true" />
            Platform
          </dt>
          <dd>{executor.platforms.join(", ")}</dd>
        </div>
        <div>
          <dt>Jumlah skrip</dt>
          <dd>{formatNumber(executor.compatibleScripts)}</dd>
        </div>
        <div>
          <dt>
            <RefreshCw size={15} aria-hidden="true" />
            Terakhir diperbarui
          </dt>
          <dd>{formatDate(executor.updatedAt)}</dd>
        </div>
      </dl>
      <a className="button button--secondary" href={`#/katalog?executor=${executor.name}`}>
        Lihat skrip kompatibel
      </a>
    </article>
  );
}
