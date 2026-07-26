import {
  FilePlus2,
  Files,
  Gauge,
  Inbox,
  LogOut,
  Settings,
  ShieldCheck,
  Tags,
  X,
} from "lucide-react";
import { Brand } from "../Brand";

export type AdminSection =
  | "overview"
  | "inbox"
  | "scripts"
  | "create"
  | "executors"
  | "categories"
  | "settings";

interface AdminSidebarProps {
  section: AdminSection;
  open: boolean;
  onSelect: (section: AdminSection) => void;
  onClose: () => void;
  onLogout: () => void;
}

const items = [
  { id: "overview" as const, label: "Ringkasan", icon: Gauge },
  { id: "inbox" as const, label: "Inbox", icon: Inbox },
  { id: "scripts" as const, label: "Kelola Skrip", icon: Files },
  { id: "create" as const, label: "Tambah Skrip", icon: FilePlus2 },
  { id: "executors" as const, label: "Kelola Eksekutor", icon: ShieldCheck },
  { id: "categories" as const, label: "Kelola Kategori", icon: Tags },
  { id: "settings" as const, label: "Pengaturan", icon: Settings },
];

export function AdminSidebar({
  section,
  open,
  onSelect,
  onClose,
  onLogout,
}: AdminSidebarProps) {
  return (
    <>
      <aside className={`admin-sidebar ${open ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__brand">
          <Brand compact admin />
          <button
            className="icon-button admin-sidebar__close"
            type="button"
            aria-label="Tutup navigasi admin"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>
        <nav aria-label="Navigasi admin">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={section === item.id ? "is-active" : ""}
                onClick={() => onSelect(item.id)}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <button
          className="admin-sidebar__logout"
          type="button"
          onClick={onLogout}
        >
          <LogOut size={18} aria-hidden="true" />
          Keluar
        </button>
      </aside>
      {open ? (
        <button
          className="admin-sidebar__scrim"
          type="button"
          aria-label="Tutup navigasi admin"
          onClick={onClose}
        />
      ) : null}
    </>
  );
}
