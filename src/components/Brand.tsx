import { Braces } from "lucide-react";

interface BrandProps {
  compact?: boolean;
  admin?: boolean;
}

export function Brand({ compact = false, admin = false }: BrandProps) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href="#/">
      <span className="brand__mark" aria-hidden="true">
        <Braces size={18} strokeWidth={2.4} />
      </span>
      <span className="brand__name">
        ScriptHub
        <small>{admin ? "Admin Console" : "Indonesia"}</small>
      </span>
    </a>
  );
}
