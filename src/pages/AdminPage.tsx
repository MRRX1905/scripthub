import type { Session } from "@supabase/supabase-js";
import {
  CheckCircle2,
  CircleDot,
  Clock3,
  Database,
  ExternalLink,
  Eye,
  FileClock,
  Files,
  FileText,
  KeyRound,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AdminConnection,
  type ConnectionFormValue,
} from "../components/admin/AdminConnection";
import {
  AdminSidebar,
  type AdminSection,
} from "../components/admin/AdminSidebar";
import { ConfirmDialog } from "../components/admin/ConfirmDialog";
import { ScriptEditor } from "../components/admin/ScriptEditor";
import { ScriptPreview } from "../components/admin/ScriptPreview";
import { KeyBadge } from "../components/StatusBadge";
import {
  changeAdminPassword,
  getAdminSession,
  loginAdmin,
  logoutAdmin,
} from "../lib/admin";
import { assetUrl } from "../lib/assets";
import {
  fetchRealtimeContent,
  removeScript,
  subscribeToContent,
  upsertExecutors,
  upsertScript,
} from "../lib/content";
import { formatDate, formatNumber } from "../lib/format";
import { adminUsername } from "../lib/supabase";
import type {
  ContentData,
  ExecutorItem,
  ExecutorState,
  ScriptItem,
} from "../types";

interface AdminPageProps {
  initialContent: ContentData | null;
  onContentChange: (content: ContentData) => void;
}

export function AdminPage({
  initialContent,
  onContentChange,
}: AdminPageProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [content, setContent] = useState<ContentData | null>(initialContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    void getAdminSession()
      .then((savedSession) => {
        if (active) setSession(savedSession);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Sesi admin tidak dapat diperiksa.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const applyContent = useCallback(
    (nextContent: ContentData) => {
      setContent(nextContent);
      onContentChange(nextContent);
    },
    [onContentChange],
  );

  const refresh = useCallback(async () => {
    const nextContent = await fetchRealtimeContent();
    applyContent(nextContent);
  }, [applyContent]);

  useEffect(() => {
    if (!session) return;

    void refresh().catch((reason: unknown) => {
      setError(
        reason instanceof Error
          ? reason.message
          : "Konten admin tidak dapat dimuat.",
      );
    });

    return subscribeToContent(applyContent, (reason) => {
      setError(reason.message);
    });
  }, [applyContent, refresh, session]);

  const connect = async (value: ConnectionFormValue) => {
    setLoading(true);
    setError("");
    try {
      setSession(await loginAdmin(value.username, value.password));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Login admin tidak berhasil.",
      );
    } finally {
      setLoading(false);
    }
  };

  const runMutation = async (
    action: () => Promise<void>,
    nextContent: ContentData,
    message: string,
  ) => {
    setSaving(true);
    setError("");
    try {
      await action();
      applyContent(nextContent);
      setSuccess(message);
      window.setTimeout(() => setSuccess(""), 4000);
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Perubahan gagal disimpan.";
      setError(message);
      throw reason;
    } finally {
      setSaving(false);
    }
  };

  const saveScript = async (script: ScriptItem) => {
    if (!content) return;
    const exists = content.scripts.some((item) => item.id === script.id);
    const nextContent = {
      ...content,
      updatedAt: script.updatedAt,
      scripts: exists
        ? content.scripts.map((item) =>
            item.id === script.id ? script : item,
          )
        : [script, ...content.scripts],
    };
    await runMutation(
      () => upsertScript(script),
      nextContent,
      exists ? "Skrip berhasil diperbarui." : "Skrip berhasil ditambahkan.",
    );
  };

  const deleteScript = async (script: ScriptItem) => {
    if (!content) return;
    const nextContent = {
      ...content,
      updatedAt: new Date().toISOString(),
      scripts: content.scripts.filter((item) => item.id !== script.id),
    };
    await runMutation(
      () => removeScript(script.id),
      nextContent,
      "Skrip berhasil dihapus dari website.",
    );
  };

  const saveExecutors = async (items: ExecutorItem[]) => {
    if (!content) return;
    const timestamp = new Date().toISOString();
    const executors = items.map((item) => ({
      ...item,
      updatedAt: timestamp,
    }));
    await runMutation(
      () => upsertExecutors(executors),
      { ...content, executors, updatedAt: timestamp },
      "Status eksekutor berhasil diperbarui.",
    );
  };

  const logout = async () => {
    try {
      await logoutAdmin();
    } finally {
      setSession(null);
    }
    setSuccess("");
    setError("");
  };

  if (!session) {
    return (
      <AdminConnection loading={loading} error={error} onConnect={connect} />
    );
  }

  if (!content) {
    return (
      <main className="admin-login">
        <section className="admin-login__card page-state" aria-live="polite">
          <div className="loading-mark" aria-hidden="true" />
          <p>Memuat konsol admin…</p>
        </section>
      </main>
    );
  }

  return (
    <AdminDashboard
      username={adminUsername}
      content={content}
      saving={saving}
      error={error}
      success={success}
      onDismissError={() => setError("")}
      onSaveScript={saveScript}
      onDeleteScript={deleteScript}
      onSaveExecutors={saveExecutors}
      onSuccess={setSuccess}
      onLogout={() => void logout()}
    />
  );
}

interface AdminDashboardProps {
  username: string;
  content: ContentData;
  saving: boolean;
  error: string;
  success: string;
  onDismissError: () => void;
  onSaveScript: (script: ScriptItem) => Promise<void>;
  onDeleteScript: (script: ScriptItem) => Promise<void>;
  onSaveExecutors: (items: ExecutorItem[]) => Promise<void>;
  onSuccess: (message: string) => void;
  onLogout: () => void;
}

function AdminDashboard({
  username,
  content,
  saving,
  error,
  success,
  onDismissError,
  onSaveScript,
  onDeleteScript,
  onSaveExecutors,
  onSuccess,
  onLogout,
}: AdminDashboardProps) {
  const [section, setSection] = useState<AdminSection>("scripts");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<ScriptItem | null>(null);
  const [previewScript, setPreviewScript] = useState<ScriptItem | null>(null);
  const [deletingScript, setDeletingScript] = useState<ScriptItem | null>(null);

  const selectSection = (next: AdminSection) => {
    setSidebarOpen(false);
    if (next === "create") {
      setEditingScript(null);
      setDrawerOpen(true);
    }
    setSection(next);
  };

  const openCreate = () => {
    setEditingScript(null);
    setDrawerOpen(true);
    setSection("create");
  };

  const openEdit = (script: ScriptItem) => {
    setEditingScript(script);
    setDrawerOpen(true);
    setSection("scripts");
  };

  const closeEditor = () => {
    setDrawerOpen(false);
    if (section === "create") {
      setSection("scripts");
    }
  };

  const saveScript = async (script: ScriptItem) => {
    await onSaveScript(script);
    closeEditor();
  };

  const deleteScript = async () => {
    if (!deletingScript) return;
    await onDeleteScript(deletingScript);
    setDeletingScript(null);
  };

  return (
    <div className={`admin-app ${drawerOpen ? "admin-app--drawer-open" : ""}`}>
      <AdminSidebar
        section={section}
        open={sidebarOpen}
        onSelect={selectSection}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="icon-button admin-topbar__menu"
            type="button"
            aria-label="Buka navigasi admin"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <a className="admin-topbar__public" href="#/">
            Lihat situs publik
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          <div className="github-status">
            <Database size={18} aria-hidden="true" />
            <span>
              <strong>Real-time aktif</strong>
              Login sebagai @{username}
            </span>
            <i aria-label="Online" />
          </div>
        </header>

        {error ? (
          <div className="admin-alert admin-alert--error" role="alert">
            <p>{error}</p>
            <button
              className="icon-button"
              type="button"
              aria-label="Tutup pesan"
              onClick={onDismissError}
            >
              <X size={17} />
            </button>
          </div>
        ) : null}

        <div className="admin-content">
          {section === "overview" ? (
            <AdminOverview content={content} onCreate={openCreate} />
          ) : null}
          {section === "scripts" || section === "create" ? (
            <ScriptManager
              content={content}
              onCreate={openCreate}
              onEdit={openEdit}
              onPreview={setPreviewScript}
              onDelete={setDeletingScript}
            />
          ) : null}
          {section === "executors" ? (
            <ExecutorManager
              content={content}
              saving={saving}
              onSave={onSaveExecutors}
            />
          ) : null}
          {section === "settings" ? (
            <AdminSettings
              username={username}
              content={content}
              onSuccess={onSuccess}
            />
          ) : null}
        </div>
      </div>

      <ScriptEditor
        script={editingScript}
        executors={content.executors}
        knownSlugs={content.scripts.map((script) => script.slug)}
        open={drawerOpen}
        saving={saving}
        onClose={closeEditor}
        onSave={saveScript}
      />

      <ScriptPreview
        script={previewScript}
        onClose={() => setPreviewScript(null)}
      />

      {deletingScript ? (
        <ConfirmDialog
          title="Hapus skrip"
          description={`Yakin ingin menghapus “${deletingScript.title}”? Konten akan langsung hilang dari website publik.`}
          busy={saving}
          onCancel={() => setDeletingScript(null)}
          onConfirm={deleteScript}
        />
      ) : null}

      {success ? (
        <div className="admin-toast" role="status">
          <CheckCircle2 size={20} aria-hidden="true" />
          <span>
            <strong>Sukses</strong>
            {success}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function AdminOverview({
  content,
  onCreate,
}: {
  content: ContentData;
  onCreate: () => void;
}) {
  const published = content.scripts.filter((script) => script.published).length;
  const recent = content.scripts
    .slice()
    .sort(
      (first, second) =>
        new Date(second.updatedAt).getTime() -
        new Date(first.updatedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>Ringkasan</p>
          <h1>Selamat datang kembali</h1>
          <span>Ringkasan konten yang tersinkron secara real-time.</span>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={onCreate}
        >
          <Plus size={17} aria-hidden="true" />
          Tambah Skrip
        </button>
      </div>
      <SummaryTiles
        total={content.scripts.length}
        published={published}
        drafts={content.scripts.length - published}
      />
      <section className="admin-panel">
        <div className="admin-panel__heading">
          <div>
            <h2>Baru diperbarui</h2>
            <p>Lima konten dengan perubahan paling baru.</p>
          </div>
        </div>
        <div className="recent-list">
          {recent.map((script) => (
            <article key={script.id}>
              <img src={assetUrl(script.thumbnail)} alt="" />
              <div>
                <h3>{script.title}</h3>
                <p>{script.game}</p>
              </div>
              <span className={script.published ? "is-published" : "is-draft"}>
                {script.published ? "Terbit" : "Draft"}
              </span>
              <time>{formatDate(script.updatedAt)}</time>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function SummaryTiles({
  total,
  published,
  drafts,
}: {
  total: number;
  published: number;
  drafts: number;
}) {
  const tiles = [
    {
      label: "Total Skrip",
      value: total,
      detail: "Semua konten terdaftar",
      icon: FileText,
      tone: "blue",
    },
    {
      label: "Terbit",
      value: published,
      detail: "Tampil di website",
      icon: Send,
      tone: "green",
    },
    {
      label: "Draft",
      value: drafts,
      detail: "Belum dipublikasikan",
      icon: FileClock,
      tone: "purple",
    },
  ];

  return (
    <div className="summary-tiles">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <article key={tile.label}>
            <div className={`summary-tiles__icon is-${tile.tone}`}>
              <Icon size={22} aria-hidden="true" />
            </div>
            <div>
              <p>{tile.label}</p>
              <strong>{tile.value}</strong>
              <span>{tile.detail}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

interface ScriptManagerProps {
  content: ContentData;
  onCreate: () => void;
  onEdit: (script: ScriptItem) => void;
  onPreview: (script: ScriptItem) => void;
  onDelete: (script: ScriptItem) => void;
}

function ScriptManager({
  content,
  onCreate,
  onEdit,
  onPreview,
  onDelete,
}: ScriptManagerProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const published = content.scripts.filter((script) => script.published).length;
  const categories = useMemo(
    () =>
      Array.from(
        new Set(content.scripts.map((script) => script.category)),
      ).sort(),
    [content.scripts],
  );
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return content.scripts.filter((script) => {
      const matchesQuery =
        !normalizedQuery ||
        [script.title, script.game, script.category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesStatus =
        status === "all" ||
        (status === "published" ? script.published : !script.published);
      const matchesCategory =
        category === "all" || script.category === category;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [category, content.scripts, query, status]);

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>Kelola Skrip</p>
          <h1>Konten Publik</h1>
          <span>Kelola semua skrip yang tampil di website.</span>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={onCreate}
        >
          <Plus size={17} aria-hidden="true" />
          Tambah Skrip
        </button>
      </div>

      <SummaryTiles
        total={content.scripts.length}
        published={published}
        drafts={content.scripts.length - published}
      />

      <section className="admin-panel">
        <div className="manager-toolbar">
          <label className="search-control">
            <span className="sr-only">Cari skrip admin</span>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              placeholder="Cari judul skrip atau game..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Filter status publikasi</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">Semua status</option>
              <option value="published">Terbit</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filter kategori</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">Semua kategori</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <button
            className="button button--ghost button--small"
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("all");
              setCategory("all");
            }}
          >
            <RefreshCw size={15} aria-hidden="true" />
            Reset
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Skrip</th>
                <th>Kategori</th>
                <th>Status Key</th>
                <th>Publikasi</th>
                <th>Terakhir diperbarui</th>
                <th className="admin-table__actions-heading">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((script) => (
                <tr key={script.id}>
                  <td data-label="Skrip">
                    <div className="admin-script-cell">
                      <img src={assetUrl(script.thumbnail)} alt="" />
                      <span>
                        <strong>{script.title}</strong>
                        <small>{script.game}</small>
                      </span>
                    </div>
                  </td>
                  <td data-label="Kategori">
                    <span className="category-chip">{script.category}</span>
                  </td>
                  <td data-label="Status Key">
                    <KeyBadge value={script.keySystem} />
                  </td>
                  <td data-label="Publikasi">
                    <span
                      className={
                        script.published
                          ? "publication publication--live"
                          : "publication publication--draft"
                      }
                    >
                      <CircleDot size={13} aria-hidden="true" />
                      {script.published ? "Terbit" : "Draft"}
                    </span>
                  </td>
                  <td data-label="Diperbarui">
                    <time>{formatDate(script.updatedAt)}</time>
                  </td>
                  <td data-label="Aksi">
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        aria-label={`Edit ${script.title}`}
                        onClick={() => onEdit(script)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Pratinjau ${script.title}`}
                        onClick={() => onPreview(script)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="is-danger"
                        type="button"
                        aria-label={`Hapus ${script.title}`}
                        onClick={() => onDelete(script)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? (
            <div className="admin-empty">
              <Files size={28} aria-hidden="true" />
              <h2>Tidak ada konten</h2>
              <p>Ubah pencarian atau filter yang sedang aktif.</p>
            </div>
          ) : null}
        </div>
        <div className="admin-table-footer">
          Menampilkan {filtered.length} dari {content.scripts.length} skrip
        </div>
      </section>
    </>
  );
}

function ExecutorManager({
  content,
  saving,
  onSave,
}: {
  content: ContentData;
  saving: boolean;
  onSave: (items: ExecutorItem[]) => Promise<void>;
}) {
  const [items, setItems] = useState(() =>
    content.executors.map((item) => ({ ...item })),
  );

  useEffect(() => {
    setItems(content.executors.map((item) => ({ ...item })));
  }, [content.executors]);

  const update = (
    id: string,
    field: keyof ExecutorItem,
    value: string | number,
  ) =>
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );

  const save = async () => {
    await onSave(items);
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>Status Eksekutor</p>
          <h1>Kompatibilitas Publik</h1>
          <span>Perbarui status dan jumlah skrip kompatibel.</span>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={() => void save()}
          disabled={saving}
        >
          <ShieldCheck size={17} aria-hidden="true" />
          {saving ? "Menyimpan…" : "Simpan Status"}
        </button>
      </div>
      <div className="executor-admin-grid">
        {items.map((executor) => (
          <article key={executor.id}>
            <div className="executor-admin-grid__heading">
              <div>
                <h2>{executor.name}</h2>
                <p>{executor.platforms.join(" / ")}</p>
              </div>
              <ShieldCheck size={21} aria-hidden="true" />
            </div>
            <label>
              Status
              <select
                value={executor.status}
                onChange={(event) =>
                  update(
                    executor.id,
                    "status",
                    event.target.value as ExecutorState,
                  )
                }
              >
                <option value="online">Online</option>
                <option value="updated">Updated</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </label>
            <label>
              Jumlah skrip kompatibel
              <input
                type="number"
                min="0"
                value={executor.compatibleScripts}
                onChange={(event) =>
                  update(
                    executor.id,
                    "compatibleScripts",
                    Number(event.target.value),
                  )
                }
              />
            </label>
            <label>
              Deskripsi
              <textarea
                rows={4}
                value={executor.description}
                onChange={(event) =>
                  update(executor.id, "description", event.target.value)
                }
              />
            </label>
          </article>
        ))}
      </div>
    </>
  );
}

function AdminSettings({
  username,
  content,
  onSuccess,
}: {
  username: string;
  content: ContentData;
  onSuccess: (message: string) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (nextPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }
    if (nextPassword !== confirmation) {
      setError("Konfirmasi password baru tidak sama.");
      return;
    }

    setBusy(true);
    try {
      await changeAdminPassword(currentPassword, nextPassword);
      setCurrentPassword("");
      setNextPassword("");
      setConfirmation("");
      onSuccess("Password admin berhasil diganti.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Password tidak berhasil diganti.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>Pengaturan</p>
          <h1>Akun &amp; Sinkronisasi</h1>
          <span>Kelola keamanan admin dan status backend real-time.</span>
        </div>
      </div>
      <div className="settings-stack">
        <section className="admin-panel settings-panel">
          <div className="settings-panel__icon">
            <Database size={28} aria-hidden="true" />
          </div>
          <div>
            <h2>Database real-time</h2>
            <p>
              Terhubung sebagai <strong>@{username}</strong>
            </p>
          </div>
          <span className="settings-live">
            <i aria-hidden="true" />
            Online
          </span>
          <dl>
            <div>
              <dt>Hak akses</dt>
              <dd>Administrator</dd>
            </div>
            <div>
              <dt>Sinkronisasi</dt>
              <dd>Real-time</dd>
            </div>
            <div>
              <dt>Versi schema</dt>
              <dd>v{content.version}</dd>
            </div>
            <div>
              <dt>Update terakhir</dt>
              <dd>{formatDate(content.updatedAt)}</dd>
            </div>
          </dl>
          <div className="settings-panel__notice">
            <Settings size={18} aria-hidden="true" />
            <p>
              Setiap tambah, edit, hapus, dan perubahan status langsung
              disinkronkan ke seluruh pengunjung tanpa menunggu deploy ulang.
            </p>
          </div>
        </section>

        <section className="admin-panel settings-panel settings-panel--password">
          <div className="settings-panel__icon">
            <KeyRound size={28} aria-hidden="true" />
          </div>
          <div>
            <h2>Ganti password admin</h2>
            <p>Gunakan minimal 8 karakter dan jangan bagikan ke orang lain.</p>
          </div>
          <form className="settings-password-form" onSubmit={submitPassword}>
            <label>
              Password saat ini
              <input
                required
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
            <div className="form-grid form-grid--two">
              <label>
                Password baru
                <input
                  required
                  minLength={8}
                  type="password"
                  value={nextPassword}
                  onChange={(event) => setNextPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </label>
              <label>
                Ulangi password baru
                <input
                  required
                  minLength={8}
                  type="password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  autoComplete="new-password"
                />
              </label>
            </div>
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
            <button
              className="button button--primary"
              type="submit"
              disabled={busy}
            >
              <KeyRound size={16} aria-hidden="true" />
              {busy ? "Mengganti…" : "Ganti Password"}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
