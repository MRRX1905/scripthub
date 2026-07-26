import { Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { ExecutorCard } from "../components/ExecutorCard";
import type { ExecutorItem, ScriptItem } from "../types";

interface ExecutorsPageProps {
  executors: ExecutorItem[];
  scripts: ScriptItem[];
}

export function ExecutorsPage({ executors, scripts }: ExecutorsPageProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase();
    return executors.filter((executor) =>
      [executor.name, executor.description, executor.platforms.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [deferredQuery, executors]);

  return (
    <main id="main-content" className="shell page" tabIndex={-1}>
      <header className="page-header page-header--split">
        <div>
          <h1>Status Eksekutor</h1>
          <p>
            Status dikelola admin berdasarkan pembaruan yang tersedia. Periksa
            kembali sebelum memakai alat pihak ketiga.
          </p>
        </div>
        <label className="search-control page-header__search">
          <span className="sr-only">Cari eksekutor</span>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari eksekutor..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </header>

      <section className="executor-grid" aria-live="polite">
        {filtered.map((executor) => (
          <ExecutorCard key={executor.id} executor={executor} />
        ))}
      </section>

      <section className="executor-note">
        <h2>{scripts.length} skrip publik tersedia</h2>
        <p>
          Gunakan filter eksekutor di katalog untuk melihat konten yang cocok
          dengan alat pilihan Anda.
        </p>
        <a className="button button--primary" href="#/katalog">
          Buka katalog
        </a>
      </section>
    </main>
  );
}
