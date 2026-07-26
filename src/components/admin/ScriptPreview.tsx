import { Eye, X } from "lucide-react";
import { assetUrl } from "../../lib/assets";
import { formatDate, formatNumber } from "../../lib/format";
import type { ScriptItem } from "../../types";
import { KeyBadge, VerifiedBadge } from "../StatusBadge";

interface ScriptPreviewProps {
  script: ScriptItem | null;
  onClose: () => void;
}

export function ScriptPreview({ script, onClose }: ScriptPreviewProps) {
  if (!script) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="icon-button preview-modal__close"
          type="button"
          aria-label="Tutup pratinjau"
          onClick={onClose}
        >
          <X size={19} />
        </button>
        <img src={assetUrl(script.thumbnail)} alt="" />
        <div className="preview-modal__content">
          <div className="preview-modal__badges">
            <KeyBadge value={script.keySystem} />
            {script.verifiedByAdmin ? <VerifiedBadge /> : null}
          </div>
          <h2 id="preview-title">{script.title}</h2>
          <p className="preview-modal__game">{script.game}</p>
          <p>{script.description}</p>
          <div className="preview-modal__meta">
            <span>
              <Eye size={15} aria-hidden="true" />
              {formatNumber(script.views)} views
            </span>
            <span>{formatDate(script.updatedAt)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
