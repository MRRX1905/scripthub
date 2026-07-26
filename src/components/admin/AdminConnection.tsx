import {
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { adminUsername } from "../../lib/supabase";

export interface ConnectionFormValue {
  username: string;
  password: string;
}

interface AdminConnectionProps {
  loading: boolean;
  error: string;
  onConnect: (value: ConnectionFormValue) => Promise<void>;
}

export function AdminConnection({
  loading,
  error,
  onConnect,
}: AdminConnectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<ConnectionFormValue>({
    username: adminUsername,
    password: "",
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onConnect({
      username: form.username.trim(),
      password: form.password,
    });
  };

  return (
    <main className="admin-login">
      <a className="admin-login__back" href="#/">
        ← Kembali ke situs publik
      </a>
      <section className="admin-login__card">
        <div className="admin-login__mark">
          <LockKeyhole size={26} aria-hidden="true" />
        </div>
        <h1>Konsol Admin</h1>
        <p>
          Masuk sebagai administrator untuk mengelola seluruh konten ScriptHub
          secara real-time.
        </p>
        <form onSubmit={submit}>
          <label>
            Username
            <span className="password-control">
              <UserRound size={17} aria-hidden="true" />
              <input
                required
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                autoComplete="username"
                spellCheck={false}
              />
            </span>
          </label>
          <label>
            Password
            <span className="password-control">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                required
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Masukkan password admin"
                autoComplete="current-password"
              />
              <button
                type="button"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          <div className="admin-login__notice">
            <ShieldCheck size={18} aria-hidden="true" />
            <p>
              Sesi login dienkripsi oleh Supabase. Pengunjung situs publik tidak
              memiliki akses untuk menambah, mengubah, atau menghapus konten.
            </p>
          </div>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button
            className="button button--primary button--wide"
            type="submit"
            disabled={loading}
          >
            <LockKeyhole size={18} aria-hidden="true" />
            {loading ? "Memverifikasi…" : "Masuk sebagai Admin"}
          </button>
        </form>
      </section>
    </main>
  );
}
