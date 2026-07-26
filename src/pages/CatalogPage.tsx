import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import {
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import { ScriptCard } from "../components/ScriptCard";
import type { KeySystem, ScriptItem } from "../types";

interface CatalogPageProps {
  scripts: ScriptItem[];
  location: string;
}

const paramsFromLocation = (location: string) =>
  new URLSearchParams(location.split("?")[1] || "");

export function CatalogPage({ scripts, location }: CatalogPageProps) {
  const initialParams = paramsFromLocation(location);
  const [query, setQuery] = useState(initialParams.get("q") || "");
  const [category, setCategory] = useState(
    initialParams.get("category") || "all",
  );
  const [keySystem, setKeySystem] = useState(
    initialParams.get("key") || "all",
  );
  const [executor, setExecutor] = useState(
    initialParams.get("executor") || "all",
  );
  const [sort, setSort] = useState("latest");
  const deferredQuery = useDeferredValue(query);

  const categories = useMemo(
    () => Array.from(new Set(scripts.map((script) => script.category))).sort(),
    [scripts],
  );
  const executors = useMemo(
    () =>
      Array.from(new Set(scripts.flatMap((script) => script.executors))).sort(),
    [scripts],
  );

  const filteredScripts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const result = scripts.filter((script) => {
      const matchesQuery =
        !normalizedQuery ||
        [script.title, script.game, script.category, script.summary]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory =
        category === "all" || script.category === category;
      const matchesKey = keySystem === "all" || script.keySystem === keySystem;
      const matchesExecutor =
        executor === "all" || script.executors.includes(executor);
      return (
        matchesQuery && matchesCategory && matchesKey && matchesExecutor
      );
    });

    return result.slice().sort((first, second) => {
      if (sort === "popular") {
        return second.views - first.views;
      }
      if (sort === "title") {
        return first.title.localeCompare(second.title, "id");
      }
      return (
        new Date(second.updatedAt).getTime() -
        new Date(first.updatedAt).getTime()
      );
    });
  }, [category, deferredQuery, executor, keySystem, scripts, sort]);

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setKeySystem("all");
    setExecutor("all");
    setSort("latest");
  };

  const hasActiveFilters =
    query || category !== "all" || keySystem !== "all" || executor !== "all";

  return (
    <main id="main-content" className="shell page" tabIndex={-1}>
      <header className="page-header">
        <div>
          <h1>Katalog Skrip</h1>
          <p>
            Temukan konten yang sudah diterbitkan admin berdasarkan game,
            kategori, sistem key, dan kompatibilitas.
          </p>
        </div>
      </header>

      <section className="catalog-toolbar" aria-label="Pencarian dan filter">
        <label className="search-control">
          <span className="sr-only">Cari katalog</span>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari judul, game, atau kategori..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Urutkan katalog</span>
          <SlidersHorizontal size={17} aria-hidden="true" />
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="latest">Terbaru</option>
            <option value="popular">Terpopuler</option>
            <option value="title">Judul A–Z</option>
          </select>
        </label>
      </section>

      <div className="catalog-layout">
        <aside className="filter-panel">
          <div className="filter-panel__title">
            <h2>
              <Filter size={18} aria-hidden="true" />
              Filter
            </h2>
            {hasActiveFilters ? (
              <button type="button" onClick={resetFilters}>
                Reset
              </button>
            ) : null}
          </div>
          <label>
            Kategori
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">Semua kategori</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Status Key</legend>
            {[
              ["all", "Semua"],
              ["no-key", "Tanpa Key"],
              ["key-required", "Perlu Key"],
            ].map(([value, label]) => (
              <label key={value} className="radio-control">
                <input
                  type="radio"
                  name="key-system"
                  value={value}
                  checked={keySystem === value}
                  onChange={() => setKeySystem(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
          <label>
            Eksekutor
            <select
              value={executor}
              onChange={(event) => setExecutor(event.target.value)}
            >
              <option value="all">Semua eksekutor</option>
              {executors.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </aside>

        <section className="catalog-results" aria-live="polite">
          <div className="catalog-results__meta">
            <p>
              Menampilkan <strong>{filteredScripts.length}</strong> dari{" "}
              <strong>{scripts.length}</strong> skrip
            </p>
            {hasActiveFilters ? (
              <button type="button" onClick={resetFilters}>
                <X size={14} aria-hidden="true" />
                Hapus filter
              </button>
            ) : null}
          </div>
          {filteredScripts.length ? (
            <div className="catalog-grid">
              {filteredScripts.map((script) => (
                <ScriptCard key={script.id} script={script} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={28} aria-hidden="true" />
              <h2>Tidak ada hasil</h2>
              <p>Coba kata kunci atau kombinasi filter yang berbeda.</p>
              <button
                className="button button--secondary"
                type="button"
                onClick={resetFilters}
              >
                Reset filter
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
