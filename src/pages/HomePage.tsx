import {
  ArrowRight,
  Check,
  Eye,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { ExecutorCard } from "../components/ExecutorCard";
import { ScriptRow } from "../components/ScriptRow";
import { formatNumber } from "../lib/format";
import { navigate } from "../lib/router";
import type { ExecutorItem, ScriptItem } from "../types";

interface HomePageProps {
  scripts: ScriptItem[];
  executors: ExecutorItem[];
}

export function HomePage({ scripts, executors }: HomePageProps) {
  const [query, setQuery] = useState("");
  const latest = useMemo(
    () =>
      scripts
        .slice()
        .sort(
          (first, second) =>
            new Date(second.updatedAt).getTime() -
            new Date(first.updatedAt).getTime(),
        )
        .slice(0, 5),
    [scripts],
  );
  const trending = useMemo(
    () => scripts.slice().sort((a, b) => b.views - a.views).slice(0, 5),
    [scripts],
  );

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/katalog${query.trim() ? `?q=${encodeURIComponent(query)}` : ""}`);
  };

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="hero shell">
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__content">
          <h1>
            Temukan Skrip Game
            <span>dengan Cepat</span>
          </h1>
          <p>
            Direktori skrip game yang dikurasi untuk komunitas gaming
            Indonesia.
          </p>
          <form className="hero-search" onSubmit={submitSearch}>
            <Search size={20} aria-hidden="true" />
            <label className="sr-only" htmlFor="home-search">
              Cari skrip atau game
            </label>
            <input
              id="home-search"
              type="search"
              placeholder="Cari skrip atau game..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit" aria-label="Mulai pencarian">
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="popular-links" aria-label="Pencarian populer">
            <span>Populer:</span>
            {["Blox Fruits", "Pet Simulator 99", "Doors"].map((game) => (
              <a key={game} href={`#/katalog?q=${encodeURIComponent(game)}`}>
                {game}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="shell home-directory" aria-labelledby="latest-title">
        <div className="directory-panel">
          <div className="section-heading section-heading--compact">
            <div>
              <h2 id="latest-title">Skrip Terbaru</h2>
              <p>Skrip terbaru yang telah ditinjau dan diterbitkan admin.</p>
            </div>
            <a href="#/katalog">
              Lihat Semua
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
          <div className="script-list">
            {latest.map((script, index) => (
              <ScriptRow
                key={script.id}
                script={script}
                featured={index === 0}
              />
            ))}
          </div>
          <div className="directory-actions">
            <a href="#/katalog?category=Auto%20Farm">Auto Farm</a>
            <a href="#/katalog?category=Combat">Combat</a>
            <a href="#/katalog?category=Utility">Utility</a>
            <a href="#/katalog?key=no-key">Tanpa Key</a>
            <a className="directory-actions__all" href="#/katalog">
              Buka filter lengkap
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>

        <aside className="trending-panel" aria-labelledby="trending-title">
          <div className="section-heading section-heading--compact">
            <div>
              <h2 id="trending-title">
                <TrendingUp size={19} aria-hidden="true" />
                Trending
              </h2>
              <p>Skrip paling banyak dilihat.</p>
            </div>
          </div>
          <ol>
            {trending.map((script, index) => (
              <li key={script.id}>
                <span>{index + 1}</span>
                <a href={`#/skrip/${script.slug}`}>
                  <strong>{script.title}</strong>
                  <small>{script.game}</small>
                </a>
                <small>
                  <Eye size={12} aria-hidden="true" />
                  {formatNumber(script.views)}
                </small>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="shell executor-strip" aria-labelledby="status-title">
        <div className="section-heading section-heading--compact">
          <div>
            <h2 id="status-title">Status Eksekutor</h2>
            <p>Cek kompatibilitas dan pembaruan eksekutor.</p>
          </div>
          <a href="#/eksekutor">
            Lihat Semua
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="executor-strip__grid">
          {executors.map((executor) => (
            <ExecutorCard key={executor.id} executor={executor} compact />
          ))}
        </div>
      </section>

      <section className="shell trust-panel" aria-labelledby="trust-title">
        <div className="trust-panel__icon" aria-hidden="true">
          <ShieldCheck />
        </div>
        <div>
          <h2 id="trust-title">Transparan &amp; Terkurasi</h2>
          <p>
            Setiap entri diperiksa admin sebelum diterbitkan. Status ini bukan
            jaminan mutlak keamanan; selalu tinjau kode dan pahami risiko alat
            pihak ketiga sebelum menjalankannya.
          </p>
        </div>
        <ul>
          <li>
            <Check size={15} aria-hidden="true" />
            Metadata ditinjau manual
          </li>
          <li>
            <Check size={15} aria-hidden="true" />
            Status publikasi terkontrol
          </li>
          <li>
            <Check size={15} aria-hidden="true" />
            Kompatibilitas diperbarui admin
          </li>
        </ul>
      </section>
    </main>
  );
}
