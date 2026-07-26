import { ArrowRight, Eye, ShieldCheck } from "lucide-react";
import { assetUrl } from "../lib/assets";
import { formatNumber } from "../lib/format";
import type { ScriptItem } from "../types";
import { KeyBadge, VerifiedBadge } from "./StatusBadge";

interface ScriptRowProps {
  script: ScriptItem;
  featured?: boolean;
}

export function ScriptRow({ script, featured = false }: ScriptRowProps) {
  return (
    <article className={`script-row ${featured ? "script-row--featured" : ""}`}>
      <div className="script-row__media">
        <img src={assetUrl(script.thumbnail)} alt="" />
        <KeyBadge value={script.keySystem} />
      </div>
      <div className="script-row__body">
        {script.verifiedByAdmin ? <VerifiedBadge /> : null}
        <h3>{script.title}</h3>
        <p className="script-row__game">{script.game}</p>
        <p className="script-row__summary">{script.summary}</p>
        <div className="tag-list" aria-label="Kategori dan fitur">
          <span>{script.category}</span>
          {script.features.slice(0, featured ? 3 : 2).map((feature) => (
            <span key={feature}>{feature.split(" ").slice(0, 2).join(" ")}</span>
          ))}
        </div>
        <div className="executor-list" aria-label="Eksekutor kompatibel">
          {script.executors.map((executor) => (
            <span key={executor}>
              {executor}
              <ShieldCheck size={12} aria-hidden="true" />
            </span>
          ))}
        </div>
        <div className="script-row__footer">
          <span>
            <Eye size={15} aria-hidden="true" />
            {formatNumber(script.views)} views
          </span>
          <a href={`#/skrip/${script.slug}`}>
            Lihat Detail
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
