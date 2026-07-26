import {
  Eye,
  EyeOff,
  GitBranch,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { adminDefaults, REPOSITORY_KEY } from "../../lib/config";

export interface ConnectionFormValue {
  owner: string;
  repo: string;
  branch: string;
  contentPath: string;
  token: string;
}

interface AdminConnectionProps {
  loading: boolean;
  error: string;
  onConnect: (value: ConnectionFormValue) => Promise<void>;
}

const loadSavedRepository = () => {
  try {
    const saved = localStorage.getItem(REPOSITORY_KEY);
    return saved
      ? (JSON.parse(saved) as Omit<ConnectionFormValue, "token">)
      : null;
  } catch {
    return null;
  }
};

export function AdminConnection({
  loading,
  error,
  onConnect,
}: AdminConnectionProps) {
  const savedRepository = loadSavedRepository();
  const [showToken, setShowToken] = useState(false);
  const [form, setForm] = useState<ConnectionFormValue>({
    owner: savedRepository?.owner || adminDefaults.owner,
    repo: savedRepository?.repo || adminDefaults.repo,
    branch: savedRepository?.branch || adminDefaults.branch,
    contentPath:
      savedRepository?.contentPath || adminDefaults.contentPath,
    token: "",
  });

  const update = (field: keyof ConnectionFormValue, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onConnect({
      owner: form.owner.trim(),
      repo: form.repo.trim(),
      branch: form.branch.trim(),
      contentPath: form.contentPath.trim(),
      token: form.token.trim(),
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
          Hubungkan akun GitHub yang memiliki akses tulis ke repositori
          ScriptHub.
        </p>
        <form onSubmit={submit}>
          <div className="form-grid form-grid--two">
            <label>
              Owner
              <input
                required
                value={form.owner}
                onChange={(event) => update("owner", event.target.value)}
                placeholder="username"
              />
            </label>
            <label>
              Repository
              <input
                required
                value={form.repo}
                onChange={(event) => update("repo", event.target.value)}
                placeholder="scripthub-indonesia"
              />
            </label>
            <label>
              Branch
              <input
                required
                value={form.branch}
                onChange={(event) => update("branch", event.target.value)}
                placeholder="main"
              />
            </label>
            <label>
              Path file konten
              <input
                required
                value={form.contentPath}
                onChange={(event) =>
                  update("contentPath", event.target.value)
                }
                placeholder="public/data/content.json"
              />
            </label>
          </div>
          <label>
            Fine-grained personal access token
            <span className="password-control">
              <GitBranch size={17} aria-hidden="true" />
              <input
                required
                type={showToken ? "text" : "password"}
                value={form.token}
                onChange={(event) => update("token", event.target.value)}
                placeholder="github_pat_..."
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                aria-label={showToken ? "Sembunyikan token" : "Tampilkan token"}
                onClick={() => setShowToken((current) => !current)}
              >
                {showToken ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          <div className="admin-login__notice">
            <ShieldCheck size={18} aria-hidden="true" />
            <p>
              Token harus memiliki permission <strong>Contents: Read and write</strong>.
              Token hanya disimpan di session browser dan dihapus saat Anda
              keluar atau menutup sesi.
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
            <GitBranch size={18} aria-hidden="true" />
            {loading ? "Memverifikasi…" : "Hubungkan GitHub"}
          </button>
        </form>
      </section>
    </main>
  );
}
