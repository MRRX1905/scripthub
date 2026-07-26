import {
  FileCheck2,
  RefreshCcw,
  SearchCheck,
  ShieldAlert,
} from "lucide-react";

export function AboutPage() {
  return (
    <main id="main-content" className="shell page about-page" tabIndex={-1}>
      <header className="page-header about-hero">
        <div>
          <h1>Direktori yang dikelola satu admin</h1>
          <p>
            ScriptHub Indonesia adalah katalog publik read-only. Hanya admin
            pemilik repositori yang dapat menambah, mengubah, menerbitkan, atau
            menghapus konten.
          </p>
        </div>
      </header>

      <section className="about-process" aria-labelledby="process-title">
        <div className="section-heading">
          <div>
            <h2 id="process-title">Alur publikasi</h2>
            <p>Konten melewati satu jalur pengelolaan yang sederhana.</p>
          </div>
        </div>
        <div className="about-process__grid">
          <article>
            <FileCheck2 aria-hidden="true" />
            <span>01</span>
            <h3>Admin menyiapkan konten</h3>
            <p>Judul, game, deskripsi, kode, dan kompatibilitas dilengkapi.</p>
          </article>
          <article>
            <SearchCheck aria-hidden="true" />
            <span>02</span>
            <h3>Metadata ditinjau</h3>
            <p>Admin memeriksa sumber, status key, dan informasi eksekutor.</p>
          </article>
          <article>
            <RefreshCcw aria-hidden="true" />
            <span>03</span>
            <h3>Diterbitkan ke GitHub</h3>
            <p>Data dikomit ke repositori dan GitHub Pages membangun ulang web.</p>
          </article>
        </div>
      </section>

      <section className="policy-panel">
        <ShieldAlert aria-hidden="true" />
        <div>
          <h2>Catatan keamanan</h2>
          <p>
            Skrip game dan eksekutor merupakan alat pihak ketiga yang dapat
            berubah tanpa pemberitahuan. Tinjau kode, sumber, dan aturan game
            sebelum digunakan. ScriptHub tidak meminta kredensial game dan
            tidak menjamin alat pihak ketiga selalu aman.
          </p>
        </div>
      </section>
    </main>
  );
}
