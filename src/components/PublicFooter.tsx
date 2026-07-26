import { Brand } from "./Brand";

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="shell public-footer__grid">
        <div className="public-footer__brand">
          <Brand />
          <p>
            Direktori skrip game yang ditinjau dan dikelola oleh SHAKHAI.
          </p>
          <small>© 2026 ScriptHub Indonesia. Semua hak dilindungi.</small>
        </div>
        <div>
          <h2>Navigasi</h2>
          <a href="#/">Beranda</a>
          <a href="#/katalog">Katalog Skrip</a>
          <a href="#/eksekutor">Eksekutor</a>
          <a href="#/inbox">Inbox</a>
          <a href="#/informasi">Informasiku</a>
        </div>
        <div>
          <h2>Lainnya</h2>
          <a href="#/informasi">Kebijakan publikasi</a>
          <a href="#/informasi">Ketentuan penggunaan</a>
          <a className="public-footer__admin" href="#/admin">
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
}
