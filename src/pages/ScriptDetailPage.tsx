import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Eye,
  Gamepad2,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ScriptCard } from "../components/ScriptCard";
import { KeyBadge, VerifiedBadge } from "../components/StatusBadge";
import { assetUrl } from "../lib/assets";
import { formatDate, formatNumber } from "../lib/format";
import type { ExecutorItem, ScriptItem } from "../types";

interface ScriptDetailPageProps {
  slug: string;
  scripts: ScriptItem[];
  executors: ExecutorItem[];
}

export function ScriptDetailPage({
  slug,
  scripts,
  executors,
}: ScriptDetailPageProps) {
  const [copied, setCopied] = useState(false);
  const script = scripts.find((item) => item.slug === slug);
  const executorMap = useMemo(
    () => new Map(executors.map((executor) => [executor.name, executor])),
    [executors],
  );

  if (!script) {
    return (
      <main id="main-content" className="shell page-state" tabIndex={-1}>
        <h1>Skrip tidak ditemukan</h1>
        <p>Konten mungkin sudah dihapus atau belum diterbitkan.</p>
        <a className="button button--primary" href="#/katalog">
          Kembali ke katalog
        </a>
      </main>
    );
  }

  const related = scripts
    .filter(
      (item) =>
        item.id !== script.id &&
        (item.game === script.game || item.category === script.category),
    )
    .slice(0, 3);

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(script.scriptCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main id="main-content" className="shell page detail-page" tabIndex={-1}>
      <a className="back-link" href="#/katalog">
        <ChevronLeft size={16} aria-hidden="true" />
        Kembali ke katalog
      </a>

      <section className="detail-hero">
        <div className="detail-hero__media">
          <img src={assetUrl(script.thumbnail)} alt="" />
        </div>
        <div className="detail-hero__content">
          <div className="detail-hero__badges">
            <KeyBadge value={script.keySystem} />
            {script.verifiedByAdmin ? <VerifiedBadge /> : null}
          </div>
          <h1>{script.title}</h1>
          <p className="detail-hero__summary">
            {script.game} · {script.summary}
          </p>
          <div className="detail-hero__meta">
            <span>
              <Gamepad2 size={16} aria-hidden="true" />
              {script.game}
            </span>
            <span>
              <Calendar size={16} aria-hidden="true" />
              {formatDate(script.updatedAt)}
            </span>
            <span>
              <Eye size={16} aria-hidden="true" />
              {formatNumber(script.views)} views
            </span>
          </div>
        </div>
      </section>

      <div className="detail-layout">
        <div className="detail-main">
          <section className="detail-panel">
            <div className="panel-heading">
              <h2>Deskripsi &amp; Fitur</h2>
            </div>
            <p>{script.description}</p>
            <ul className="feature-list">
              {script.features.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          <section className="detail-panel code-panel">
            <div className="panel-heading">
              <div>
                <h2>Salin Skrip</h2>
                <p>
                  Tinjau kode sebelum menjalankannya pada alat pihak ketiga.
                </p>
              </div>
              <button
                className={`button ${copied ? "button--success" : "button--primary"}`}
                type="button"
                onClick={copyScript}
              >
                {copied ? (
                  <Check size={17} aria-hidden="true" />
                ) : (
                  <Copy size={17} aria-hidden="true" />
                )}
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
            <pre>
              <code>{script.scriptCode}</code>
            </pre>
          </section>
        </div>

        <aside className="detail-sidebar">
          <section className="detail-panel">
            <div className="panel-heading">
              <h2>Eksekutor Kompatibel</h2>
            </div>
            <div className="compatibility-list">
              {script.executors.map((name) => {
                const executor = executorMap.get(name);
                return (
                  <a key={name} href="#/eksekutor">
                    <span>
                      <Terminal size={17} aria-hidden="true" />
                      <span>
                        <strong>{name}</strong>
                        <small>
                          {executor?.platforms.join(" / ") || "Terdaftar"}
                        </small>
                      </span>
                    </span>
                    <Check size={16} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </section>

          <section className="detail-panel notice-panel">
            <ShieldAlert size={26} aria-hidden="true" />
            <h2>Gunakan dengan bijak</h2>
            <p>
              Status “Ditinjau Admin” berarti metadata dan sumber telah
              diperiksa pada saat publikasi, bukan jaminan bebas risiko.
            </p>
          </section>
        </aside>
      </div>

      {related.length ? (
        <section className="related-section" aria-labelledby="related-title">
          <div className="section-heading">
            <div>
              <h2 id="related-title">Skrip Serupa</h2>
              <p>Konten lain dengan game atau kategori yang berdekatan.</p>
            </div>
          </div>
          <div className="catalog-grid">
            {related.map((item) => (
              <ScriptCard key={item.id} script={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
