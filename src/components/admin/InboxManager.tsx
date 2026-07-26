import {
  Check,
  Clipboard,
  Inbox,
  Mail,
  MailOpen,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteScriptSubmission,
  fetchScriptSubmissions,
  subscribeToScriptSubmissions,
  updateSubmissionStatus,
} from "../../lib/submissions";
import { formatDate } from "../../lib/format";
import type { ScriptSubmission } from "../../types";
import { ConfirmDialog } from "./ConfirmDialog";

export function InboxManager() {
  const [items, setItems] = useState<ScriptSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<ScriptSubmission | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const newCount = useMemo(
    () => items.filter((item) => item.status === "new").length,
    [items],
  );

  const load = useCallback(async () => {
    setError("");
    try {
      setItems(await fetchScriptSubmissions());
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Inbox admin tidak dapat dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return subscribeToScriptSubmissions(setItems, (reason) => {
      setError(reason.message);
    });
  }, [load]);

  const toggleStatus = async (item: ScriptSubmission) => {
    setBusyId(item.id);
    setError("");
    try {
      await updateSubmissionStatus(
        item.id,
        item.status === "new" ? "reviewed" : "new",
      );
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Status kiriman tidak dapat diubah.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const copyScript = async (item: ScriptSubmission) => {
    try {
      await navigator.clipboard.writeText(item.scriptContent);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setError("Skrip tidak dapat disalin dari browser ini.");
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    setError("");
    try {
      await deleteScriptSubmission(deleting.id);
      setDeleting(null);
      await load();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Kiriman tidak dapat dihapus.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>Inbox</p>
          <h1>Kiriman Pengunjung</h1>
          <span>
            Tinjau skrip yang dikirim dari website publik secara real-time.
          </span>
        </div>
        <button
          className="button button--ghost button--small"
          type="button"
          disabled={loading}
          onClick={() => void load()}
        >
          <RefreshCw size={15} aria-hidden="true" />
          Muat ulang
        </button>
      </div>

      <div className="inbox-admin-summary">
        <article>
          <Mail size={20} aria-hidden="true" />
          <div>
            <strong>{newCount}</strong>
            <span>Kiriman baru</span>
          </div>
        </article>
        <article>
          <Inbox size={20} aria-hidden="true" />
          <div>
            <strong>{items.length}</strong>
            <span>Total kiriman</span>
          </div>
        </article>
      </div>

      {error ? (
        <p className="form-error inbox-admin-error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="admin-panel inbox-admin-panel">
        {loading ? (
          <div className="inbox-admin-state" aria-live="polite">
            <div className="loading-mark" aria-hidden="true" />
            <p>Memuat kiriman…</p>
          </div>
        ) : items.length ? (
          <div className="inbox-admin-list">
            {items.map((item) => (
              <article
                className={item.status === "new" ? "is-new" : ""}
                key={item.id}
              >
                <header>
                  <div className="inbox-admin-list__sender">
                    {item.status === "new" ? (
                      <Mail size={18} aria-hidden="true" />
                    ) : (
                      <MailOpen size={18} aria-hidden="true" />
                    )}
                    <div>
                      <h2>{item.senderName}</h2>
                      <time>{formatDate(item.createdAt)}</time>
                    </div>
                  </div>
                  <span
                    className={`inbox-status inbox-status--${item.status}`}
                  >
                    {item.status === "new" ? "Baru" : "Ditinjau"}
                  </span>
                </header>
                <pre>
                  <code>{item.scriptContent}</code>
                </pre>
                <footer>
                  <button
                    className="button button--ghost button--small"
                    type="button"
                    onClick={() => void copyScript(item)}
                  >
                    {copiedId === item.id ? (
                      <Check size={15} aria-hidden="true" />
                    ) : (
                      <Clipboard size={15} aria-hidden="true" />
                    )}
                    {copiedId === item.id ? "Tersalin" : "Salin skrip"}
                  </button>
                  <button
                    className="button button--secondary button--small"
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void toggleStatus(item)}
                  >
                    {item.status === "new" ? (
                      <MailOpen size={15} aria-hidden="true" />
                    ) : (
                      <Mail size={15} aria-hidden="true" />
                    )}
                    {item.status === "new"
                      ? "Tandai ditinjau"
                      : "Tandai belum dibaca"}
                  </button>
                  <button
                    className="button button--danger button--small"
                    type="button"
                    aria-label={`Hapus kiriman dari ${item.senderName}`}
                    onClick={() => setDeleting(item)}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    Hapus
                  </button>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <div className="inbox-admin-state">
            <Inbox size={30} aria-hidden="true" />
            <h2>Inbox masih kosong</h2>
            <p>Kiriman pengunjung akan muncul otomatis di halaman ini.</p>
          </div>
        )}
      </section>

      {deleting ? (
        <ConfirmDialog
          title="Hapus kiriman"
          description={`Yakin ingin menghapus kiriman dari “${deleting.senderName}”?`}
          busy={busyId === deleting.id}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      ) : null}
    </>
  );
}
