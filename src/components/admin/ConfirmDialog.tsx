import { Trash2, X } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  description: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDialog({
  title,
  description,
  busy,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="icon-button confirm-dialog__close"
          type="button"
          aria-label="Tutup dialog"
          onClick={onCancel}
        >
          <X size={18} />
        </button>
        <div className="confirm-dialog__icon">
          <Trash2 size={23} aria-hidden="true" />
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-description">{description}</p>
        <div className="confirm-dialog__actions">
          <button
            className="button button--ghost"
            type="button"
            onClick={onCancel}
          >
            Batal
          </button>
          <button
            className="button button--danger"
            type="button"
            disabled={busy}
            onClick={() => void onConfirm()}
          >
            <Trash2 size={16} aria-hidden="true" />
            {busy ? "Menghapus…" : "Hapus"}
          </button>
        </div>
      </section>
    </div>
  );
}
