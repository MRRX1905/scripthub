export function NotFoundPage() {
  return (
    <main id="main-content" className="shell page-state" tabIndex={-1}>
      <p className="page-state__code">404</p>
      <h1>Halaman tidak ditemukan</h1>
      <p>Alamat yang Anda buka tidak tersedia di ScriptHub Indonesia.</p>
      <a className="button button--primary" href="#/">
        Kembali ke beranda
      </a>
    </main>
  );
}
