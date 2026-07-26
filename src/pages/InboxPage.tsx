import {
  CheckCircle2,
  Code2,
  Inbox,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { submitScriptSuggestion } from "../lib/submissions";

export function InboxPage() {
  const [senderName, setSenderName] = useState("");
  const [scriptContent, setScriptContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await submitScriptSuggestion(senderName, scriptContent);
      setSenderName("");
      setScriptContent("");
      setSuccess(true);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Kiriman belum dapat dikirim. Silakan coba kembali.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="shell page inbox-page" tabIndex={-1}>
      <header className="page-header inbox-page__header">
        <div>
          <h1>Kirim Skrip ke SHAKHAI</h1>
          <p>
            Bagikan skrip yang menurut Anda layak ditambahkan. SHAKHAI akan
            meninjau dan mengujinya terlebih dahulu sebelum memutuskan untuk
            menerbitkannya.
          </p>
        </div>
      </header>

      <div className="inbox-page__layout">
        <section className="inbox-form-panel" aria-labelledby="inbox-form-title">
          {success ? (
            <div className="inbox-success" role="status">
              <CheckCircle2 size={34} aria-hidden="true" />
              <div>
                <h2>Kiriman sudah diterima</h2>
                <p>
                  Skrip Anda telah masuk ke Inbox Admin dan akan ditinjau oleh
                  SHAKHAI.
                </p>
              </div>
              <button
                className="button button--ghost"
                type="button"
                onClick={() => setSuccess(false)}
              >
                Kirim skrip lain
              </button>
            </div>
          ) : (
            <>
              <div className="inbox-form-panel__heading">
                <Inbox size={22} aria-hidden="true" />
                <div>
                  <h2 id="inbox-form-title">Inbox Admin</h2>
                  <p>Isi nama dan skrip yang ingin Anda bagikan.</p>
                </div>
              </div>
              <form className="inbox-form" onSubmit={submit}>
                <label>
                  Nama
                  <span className="input-with-icon">
                    <UserRound size={17} aria-hidden="true" />
                    <input
                      required
                      minLength={2}
                      maxLength={80}
                      type="text"
                      autoComplete="name"
                      placeholder="Masukkan nama Anda"
                      value={senderName}
                      onChange={(event) => setSenderName(event.target.value)}
                    />
                  </span>
                </label>
                <label>
                  Skrip yang ingin ditambahkan
                  <span className="inbox-script-control">
                    <Code2 size={18} aria-hidden="true" />
                    <textarea
                      required
                      minLength={10}
                      maxLength={20000}
                      rows={12}
                      spellCheck={false}
                      placeholder="Tempel kode skrip atau link sumber skrip di sini…"
                      value={scriptContent}
                      onChange={(event) => setScriptContent(event.target.value)}
                    />
                  </span>
                  <small>
                    {scriptContent.length.toLocaleString("id-ID")} / 20.000
                    karakter
                  </small>
                </label>
                {error ? (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  className="button button--primary button--wide"
                  type="submit"
                  disabled={submitting}
                >
                  <Send size={17} aria-hidden="true" />
                  {submitting ? "Mengirim…" : "Kirim ke Inbox Admin"}
                </button>
              </form>
            </>
          )}
        </section>

        <aside className="inbox-guidance">
          <ShieldCheck size={28} aria-hidden="true" />
          <h2>Proses peninjauan</h2>
          <p>
            Setiap kiriman diperiksa secara manual. Pengiriman skrip tidak
            menjamin bahwa konten tersebut akan dipublikasikan.
          </p>
          <ol>
            <li>
              <span>01</span>
              Kiriman masuk ke Inbox Admin.
            </li>
            <li>
              <span>02</span>
              SHAKHAI meninjau sumber dan menguji skrip.
            </li>
            <li>
              <span>03</span>
              Skrip yang lolos akan dilengkapi dan diterbitkan.
            </li>
          </ol>
          <p className="inbox-guidance__notice">
            Jangan sertakan password, cookie, token akun, atau informasi
            pribadi lainnya.
          </p>
        </aside>
      </div>
    </main>
  );
}
