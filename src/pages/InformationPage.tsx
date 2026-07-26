import {
  FileCheck2,
  RefreshCcw,
  SearchCheck,
  ShieldAlert,
} from "lucide-react";

export function InformationPage() {
  return (
    <main id="main-content" className="shell page about-page" tabIndex={-1}>
      <header className="page-header about-hero">
        <div>
          <h1>SHAKHAI — Developer ScriptHub Indonesia</h1>
          <p>
            Saya adalah SHAKHAI, pengembang sekaligus administrator website ini.
            ScriptHub Indonesia saya bangun untuk memudahkan komunitas
            menemukan skrip yang telah ditinjau dan diuji sebelum diterbitkan.
          </p>
        </div>
      </header>

      <section className="about-process" aria-labelledby="process-title">
        <div className="section-heading">
          <div>
            <h2 id="process-title">Cara kerja ScriptHub</h2>
            <p>Setiap skrip melewati proses peninjauan yang terarah.</p>
          </div>
        </div>
        <div className="about-process__grid">
          <article>
            <FileCheck2 aria-hidden="true" />
            <span>01</span>
            <h3>Pengunjung mengirim skrip</h3>
            <p>
              Nama dan skrip dikirim melalui Inbox Admin untuk dipertimbangkan.
            </p>
          </article>
          <article>
            <SearchCheck aria-hidden="true" />
            <span>02</span>
            <h3>SHAKHAI meninjau dan menguji</h3>
            <p>
              Sumber, fungsi, status key, dan kompatibilitas diperiksa langsung.
            </p>
          </article>
          <article>
            <RefreshCcw aria-hidden="true" />
            <span>03</span>
            <h3>Skrip diterbitkan</h3>
            <p>
              Kiriman yang lolos dilengkapi informasinya lalu diterbitkan ke
              website.
            </p>
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
            sebelum digunakan. SHAKHAI dan ScriptHub tidak meminta kredensial
            game serta tidak menjamin alat pihak ketiga selalu aman.
          </p>
        </div>
      </section>
    </main>
  );
}
