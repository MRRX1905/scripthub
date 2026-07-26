import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "./Brand";

const links = [
  { label: "Beranda", href: "#/" },
  { label: "Katalog Skrip", href: "#/katalog" },
  { label: "Eksekutor", href: "#/eksekutor" },
  { label: "Inbox", href: "#/inbox" },
  { label: "Informasiku", href: "#/informasi" },
];

interface PublicHeaderProps {
  path: string;
}

export function PublicHeader({ path }: PublicHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const activeHref =
    path.startsWith("/skrip/") || path === "/katalog"
      ? "#/katalog"
      : path === "/tentang"
        ? "#/informasi"
      : `#${path}`;

  return (
    <header className="public-header">
      <div className="shell public-header__inner">
        <Brand />
        <nav
          className={`public-nav ${menuOpen ? "public-nav--open" : ""}`}
          aria-label="Navigasi utama"
        >
          {links.map((link) => (
            <a
              key={link.href}
              className={activeHref === link.href ? "is-active" : ""}
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <button
          className="icon-button public-header__menu"
          type="button"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}
