import {
  CheckCircle2,
  CircleDot,
  Clock3,
  ExternalLink,
  Eye,
  FileClock,
  Files,
  FileText,
  GitBranch,
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
import { assetUrl } from "../lib/assets";
import {
  adminDefaults,
  REPOSITORY_KEY,
  SESSION_KEY,
} from "../lib/config";
import { formatDate, formatNumber } from "../lib/format";
import {
  getAuthenticatedUser,
  getContentFile,
  getRepository,
  updateContentFile,
} from "../lib/github";
import type {
  ContentData,
  ExecutorItem,
  ExecutorState,
  GitHubConnection,
  ScriptItem,
} from "../types";

interface AdminPageProps {
  initialContent: ContentData | null;
  onContentChange: (content: ContentData) => void;
}

const loadSession = () => {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? (JSON.parse(saved) as GitHubConnection) : null;
  } catch {
    return null;
  }
};

export function AdminPage({
  initialContent,
  onContentChange,
}: AdminPageProps) {
  const [connection, setConnection] = useState<GitHubConnection | null>(null);
  const [content, setContent] = useState<ContentData | null>(initialContent);
  const [sha, setSha] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [commitUrl, setCommitUrl] = useState("");

  const connect = useCallback(
    async (value: ConnectionFormValue, restoredLogin?: string) => {
      setLoading(true);
      setError("");
      try {
        const [user, repository] = await Promise.all([
          getAuthenticatedUser(value.token),
          getRepository(value.owner, value.repo, value.token),
        ]);
        const allowedLogin = adminDefaults.allowedLogin.trim().toLowerCase();
        if (allowedLogin && user.login.toLowerCase() !== allowedLogin) {
          throw new Error(
            `Akun @${user.login} bukan admin yang dikonfigurasi untuk situs ini.`,
          );
        }
        if (repository.permissions?.push === false) {
          throw new Error("Akun GitHub ini tidak memiliki akses tulis.");
        }

        const resolvedConnection: GitHubConnection = {
          ...value,
          branch: value.branch || repository.default_branch,
          login: restoredLogin || user.login,
        };
        const file = await getContentFile(resolvedConnection);

        setConnection(resolvedConnection);
        setContent(file.data);
        setSha(file.sha);
        onContentChange(file.data);
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify(resolvedConnection),
        );
        localStorage.setItem(
          REPOSITORY_KEY,
          JSON.stringify({
            owner: resolvedConnection.owner,
            repo: resolvedConnection.repo,
            branch: resolvedConnection.branch,
            contentPath: resolvedConnection.contentPath,
          }),
        );
      } catch (reason) {
        sessionStorage.removeItem(SESSION_KEY);
        setError(
          reason instanceof Error
            ? reason.message
            : "Koneksi GitHub tidak berhasil.",
        );
      } finally {
        setLoading(false);
      }
    },
    [onContentChange],
  );

  useEffect(() => {
    const saved = loadSession();
    if (!saved) return;
    void connect(
      {
        owner: saved.owner,
        repo: saved.repo,
        branch: saved.branch,
        contentPath: saved.contentPath,
        token: saved.token,
      },
      saved.login,
    );
  }, [connect]);

  const commitContent = async (next: ContentData, message: string) => {
    if (!connection || !sha) {
      throw new Error("Sesi admin belum terhubung.");
    }
    setSaving(true);
    setError("");
    try {
      const stampedContent = {
        ...next,
        updatedAt: new Date().toISOString(),
      };
      const result = await updateContentFile(
        connection,
        stampedContent,
        sha,
        message,
      );
      setSha(result.sha);
      setCommitUrl(result.commitUrl);
      setContent(stampedContent);
      onContentChange(stampedContent);
      setSuccess("Perubahan berhasil dikomit ke GitHub.");
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

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setConnection(null);
    setSha("");
    setCommitUrl("");
    setSuccess("");
    setError("");
  };

  if (!connection || !content) {
    return (
      <AdminConnection loading={loading} error={error} onConnect={connect} />
    );
  }

  return (
    <AdminDashboard
      connection={connection}
      content={content}
      saving={saving}
      error={error}
      success={success}
      commitUrl={commitUrl}
      onDismissError={() => setError("")}
      onCommit={commitContent}
      onLogout={logout}
    />
  );
}

interface AdminDashboardProps {
  connection: GitHubConnection;
  content: ContentData;
  saving: boolean;
  error: string;
  success: string;
  commitUrl: string;
  onDismissError: () => void;
  onCommit: (content: ContentData, message: string) => Promise<void>;
  onLogout: () => void;
}

function AdminDashboard({
  connection,
  content,
  saving,
  error,
  success,
  commitUrl,
  onDismissError,
  onCommit,
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
    const exists = content.scripts.some((item) => item.id === script.id);
    const nextScripts = exists
      ? content.scripts.map((item) => (item.id === script.id ? script : item))
      : [script, ...content.scripts];
    await onCommit(
      { ...content, scripts: nextScripts },
      exists
        ? `content: perbarui ${script.title}`
        : `content: tambah ${script.title}`,
    );
    closeEditor();
  };

  const deleteScript = async () => {
    if (!deletingScript) return;
    await onCommit(
      {
        ...content,
        scripts: content.scripts.filter(
          (script) => script.id !== deletingScript.id,
        ),
      },
      `content: hapus ${deletingScript.title}`,
    );
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
            <GitBranch size={18} aria-hidden="true" />
            <span>
              <strong>GitHub terhubung</strong>
              {connection.owner}/{connection.repo}
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
              onCommit={onCommit}
            />
          ) : null}
          {section === "settings" ? (
            <AdminSettings connection={connection} content={content} />
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
          description={`Yakin ingin menghapus “${deletingScript.title}”? Perubahan akan langsung dikomit ke GitHub.`}
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
          {commitUrl ? (
            <a href={commitUrl} target="_blank" rel="noreferrer">
              Lihat commit
            </a>
          ) : null}
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
          <span>Ringkasan konten yang dikelola dari satu repositori.</span>
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
  onCommit,
}: {
  content: ContentData;
  saving: boolean;
  onCommit: (content: ContentData, message: string) => Promise<void>;
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
    await onCommit(
      {
        ...content,
        executors: items.map((item) => ({
          ...item,
          updatedAt: new Date().toISOString(),
        })),
      },
      "content: perbarui status eksekutor",
    );
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
  connection,
  content,
}: {
  connection: GitHubConnection;
  content: ContentData;
}) {
  const repositoryUrl = `https://github.com/${connection.owner}/${connection.repo}`;
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>Pengaturan</p>
          <h1>Repository &amp; Publikasi</h1>
          <span>Detail koneksi yang digunakan selama sesi ini.</span>
        </div>
      </div>
      <section className="admin-panel settings-panel">
        <div className="settings-panel__icon">
          <GitBranch size={28} aria-hidden="true" />
        </div>
        <div>
          <h2>
            {connection.owner}/{connection.repo}
          </h2>
          <p>
            Terhubung sebagai <strong>@{connection.login}</strong>
          </p>
        </div>
        <dl>
          <div>
            <dt>Branch</dt>
            <dd>{connection.branch}</dd>
          </div>
          <div>
            <dt>Path konten</dt>
            <dd>{connection.contentPath}</dd>
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
        <a
          className="button button--secondary"
          href={repositoryUrl}
          target="_blank"
          rel="noreferrer"
        >
          Buka repository
          <ExternalLink size={15} aria-hidden="true" />
        </a>
        <div className="settings-panel__notice">
          <Settings size={18} aria-hidden="true" />
          <p>
            Token tidak pernah ditulis ke repository. Untuk mengganti repository
            atau token, pilih “Keluar”, lalu hubungkan kembali.
          </p>
        </div>
      </section>
    </>
  );
}
