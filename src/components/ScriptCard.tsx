import { ArrowUpRight, Eye } from "lucide-react";
import { assetUrl } from "../lib/assets";
import { formatNumber } from "../lib/format";
import type { ScriptItem } from "../types";
import { KeyBadge, VerifiedBadge } from "./StatusBadge";

export function ScriptCard({ script }: { script: ScriptItem }) {
  return (
    <article className="script-card">
      <a className="script-card__media" href={`#/skrip/${script.slug}`}>
        <img src={assetUrl(script.thumbnail)} alt="" />
        <KeyBadge value={script.keySystem} />
      </a>
      <div className="script-card__body">
        {script.verifiedByAdmin ? <VerifiedBadge /> : null}
        <h2>
          <a href={`#/skrip/${script.slug}`}>{script.title}</a>
        </h2>
        <p className="script-card__game">{script.game}</p>
        <p>{script.summary}</p>
        <div className="tag-list">
          <span>{script.category}</span>
          {script.executors.slice(0, 2).map((executor) => (
            <span key={executor}>{executor}</span>
          ))}
        </div>
        <div className="script-card__footer">
          <span>
            <Eye size={15} aria-hidden="true" />
            {formatNumber(script.views)}
          </span>
          <a
            className="button button--secondary button--small"
            href={`#/skrip/${script.slug}`}
          >
            Detail
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
