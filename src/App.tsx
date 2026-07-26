import { useEffect, useState } from "react";
import { PublicFooter } from "./components/PublicFooter";
import { PublicHeader } from "./components/PublicHeader";
import { routePath, useHashLocation } from "./lib/router";
import { AboutPage } from "./pages/AboutPage";
import { AdminPage } from "./pages/AdminPage";
import { CatalogPage } from "./pages/CatalogPage";
import { ExecutorsPage } from "./pages/ExecutorsPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ScriptDetailPage } from "./pages/ScriptDetailPage";
import type { ContentData } from "./types";

export function App() {
  const location = useHashLocation();
  const path = routePath(location);
  const [content, setContent] = useState<ContentData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch(`${import.meta.env.BASE_URL}data/content.json`, { cache: "no-cache" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Konten tidak dapat dimuat.");
        }
        return (await response.json()) as ContentData;
      })
      .then((data) => {
        if (active) {
          setContent(data);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Terjadi kesalahan saat memuat konten.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const main = document.querySelector("main");
    main?.focus({ preventScroll: true });
  }, [path]);

  if (path === "/admin") {
    return (
      <AdminPage
        initialContent={content}
        onContentChange={(nextContent) => setContent(nextContent)}
      />
    );
  }

  const publishedScripts =
    content?.scripts.filter((script) => script.published) ?? [];

  let page;
  if (error) {
    page = (
      <main className="shell page-state" tabIndex={-1}>
        <h1>Konten belum tersedia</h1>
        <p>{error}</p>
      </main>
    );
  } else if (!content) {
    page = (
      <main className="shell page-state" tabIndex={-1} aria-live="polite">
        <div className="loading-mark" aria-hidden="true" />
        <p>Memuat direktori…</p>
      </main>
    );
  } else if (path === "/") {
    page = (
      <HomePage scripts={publishedScripts} executors={content.executors} />
    );
  } else if (path === "/katalog") {
    page = <CatalogPage scripts={publishedScripts} location={location} />;
  } else if (path.startsWith("/skrip/")) {
    page = (
      <ScriptDetailPage
        slug={path.replace("/skrip/", "")}
        scripts={publishedScripts}
        executors={content.executors}
      />
    );
  } else if (path === "/eksekutor") {
    page = (
      <ExecutorsPage
        executors={content.executors}
        scripts={publishedScripts}
      />
    );
  } else if (path === "/tentang") {
    page = <AboutPage />;
  } else {
    page = <NotFoundPage />;
  }

  return (
    <div className="public-app">
      <a className="skip-link" href="#main-content">
        Lewati ke konten
      </a>
      <PublicHeader path={path} />
      {page}
      <PublicFooter />
    </div>
  );
}
