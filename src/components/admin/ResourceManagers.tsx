import {
  FolderCog,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { slugify } from "../../lib/format";
import type {
  CategoryItem,
  ExecutorItem,
  ExecutorState,
  ScriptItem,
} from "../../types";
import { ConfirmDialog } from "./ConfirmDialog";

interface ExecutorManagerProps {
  items: ExecutorItem[];
  saving: boolean;
  onSave: (item: ExecutorItem) => Promise<void>;
  onDelete: (item: ExecutorItem) => Promise<void>;
}

interface ExecutorDraft extends ExecutorItem {
  clientKey: string;
  platformText: string;
  isNew: boolean;
}

const toExecutorDraft = (item: ExecutorItem): ExecutorDraft => ({
  ...item,
  clientKey: item.id,
  platformText: item.platforms.join(", "),
  isNew: false,
});

export function ExecutorManager({
  items,
  saving,
  onSave,
  onDelete,
}: ExecutorManagerProps) {
  const [drafts, setDrafts] = useState<ExecutorDraft[]>(() =>
    items.map(toExecutorDraft),
  );
  const [deleting, setDeleting] = useState<ExecutorDraft | null>(null);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setDrafts(items.map(toExecutorDraft));
  }, [items]);

  const addExecutor = () => {
    if (drafts.some((item) => item.isNew)) return;
    setDrafts((current) => [
      {
        id: "",
        clientKey: crypto.randomUUID(),
        name: "",
        status: "online",
        platforms: [],
        platformText: "",
        uncPercentage: 0,
        description: "",
        updatedAt: new Date().toISOString(),
        isNew: true,
      },
      ...current,
    ]);
  };

  const update = <Key extends keyof ExecutorDraft>(
    clientKey: string,
    field: Key,
    value: ExecutorDraft[Key],
  ) => {
    setDrafts((current) =>
      current.map((item) =>
        item.clientKey === clientKey ? { ...item, [field]: value } : item,
      ),
    );
  };

  const save = async (draft: ExecutorDraft) => {
    const name = draft.name.trim();
    const description = draft.description.trim();
    const platforms = draft.platformText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!name || !description || !platforms.length) {
      setValidationError(
        "Nama, platform, dan deskripsi eksekutor wajib diisi.",
      );
      return;
    }

    const duplicate = drafts.some(
      (item) =>
        item.clientKey !== draft.clientKey &&
        item.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      setValidationError("Nama eksekutor sudah digunakan.");
      return;
    }

    setValidationError("");
    try {
      await onSave({
        id: draft.id || slugify(name),
        name,
        status: draft.status,
        platforms,
        uncPercentage: Math.min(
          100,
          Math.max(0, Number(draft.uncPercentage) || 0),
        ),
        description,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // Pesan backend ditampilkan oleh panel admin utama.
    }
  };

  const remove = async () => {
    if (!deleting) return;
    if (deleting.isNew) {
      setDrafts((current) =>
        current.filter((item) => item.clientKey !== deleting.clientKey),
      );
      setDeleting(null);
      return;
    }

    try {
      await onDelete(deleting);
      setDeleting(null);
    } catch {
      // Dialog tetap terbuka agar admin dapat meninjau error backend.
    }
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>Kompatibilitas Eksekutor</p>
          <h1>Kelola Eksekutor</h1>
          <span>
            Tambah, edit, dan hapus eksekutor yang tampil di website publik.
          </span>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={addExecutor}
          disabled={saving || drafts.some((item) => item.isNew)}
        >
          <Plus size={17} aria-hidden="true" />
          Tambah Eksekutor
        </button>
      </div>

      {validationError ? (
        <p className="form-error resource-validation" role="alert">
          {validationError}
        </p>
      ) : null}

      <div className="executor-admin-grid">
        {drafts.map((executor) => (
          <article key={executor.clientKey}>
            <div className="executor-admin-grid__heading">
              <div>
                <h2>{executor.name || "Eksekutor baru"}</h2>
                <p>
                  {executor.isNew
                    ? "Lengkapi data sebelum menyimpan."
                    : `ID: ${executor.id}`}
                </p>
              </div>
              <ShieldCheck size={21} aria-hidden="true" />
            </div>

            <label>
              Nama eksekutor
              <input
                required
                value={executor.name}
                onChange={(event) =>
                  update(executor.clientKey, "name", event.target.value)
                }
                placeholder="Contoh: Delta"
              />
            </label>

            <div className="form-grid form-grid--two">
              <label>
                Status
                <select
                  value={executor.status}
                  onChange={(event) =>
                    update(
                      executor.clientKey,
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
                UNC (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={executor.uncPercentage}
                  onChange={(event) =>
                    update(
                      executor.clientKey,
                      "uncPercentage",
                      Number(event.target.value),
                    )
                  }
                />
                <small className="field-hint">
                  Persentase kompatibilitas 0–100.
                </small>
              </label>
            </div>

            <label>
              Platform
              <input
                required
                value={executor.platformText}
                onChange={(event) =>
                  update(executor.clientKey, "platformText", event.target.value)
                }
                placeholder="Android, Windows"
              />
              <small className="field-hint">Pisahkan dengan koma.</small>
            </label>

            <label>
              Deskripsi
              <textarea
                required
                rows={4}
                value={executor.description}
                onChange={(event) =>
                  update(executor.clientKey, "description", event.target.value)
                }
                placeholder="Jelaskan dukungan dan kondisi eksekutor."
              />
            </label>

            <div className="resource-card__actions">
              <button
                className="button button--ghost button--small"
                type="button"
                onClick={() => setDeleting(executor)}
                disabled={saving}
                aria-label={`Hapus eksekutor ${executor.name || "baru"}`}
              >
                <Trash2 size={15} aria-hidden="true" />
                Hapus
              </button>
              <button
                className="button button--primary button--small"
                type="button"
                onClick={() => void save(executor)}
                disabled={saving}
                aria-label={`Simpan eksekutor ${executor.name || "baru"}`}
              >
                <Save size={15} aria-hidden="true" />
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {deleting ? (
        <ConfirmDialog
          title="Hapus eksekutor"
          description={`Hapus “${deleting.name || "eksekutor baru"}”? Referensi kompatibilitas pada skrip akan dibersihkan otomatis.`}
          busy={saving}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      ) : null}
    </>
  );
}

interface CategoryManagerProps {
  items: CategoryItem[];
  scripts: ScriptItem[];
  saving: boolean;
  onSave: (item: CategoryItem) => Promise<void>;
  onDelete: (item: CategoryItem) => Promise<void>;
}

interface CategoryDraft extends CategoryItem {
  clientKey: string;
  isNew: boolean;
}

const toCategoryDraft = (item: CategoryItem): CategoryDraft => ({
  ...item,
  clientKey: item.id,
  isNew: false,
});

export function CategoryManager({
  items,
  scripts,
  saving,
  onSave,
  onDelete,
}: CategoryManagerProps) {
  const [drafts, setDrafts] = useState<CategoryDraft[]>(() =>
    items.map(toCategoryDraft),
  );
  const [deleting, setDeleting] = useState<CategoryDraft | null>(null);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setDrafts(items.map(toCategoryDraft));
  }, [items]);

  const usage = useMemo(
    () =>
      new Map(
        items.map((category) => [
          category.name,
          scripts.filter((script) => script.category === category.name).length,
        ]),
      ),
    [items, scripts],
  );

  const addCategory = () => {
    if (drafts.some((item) => item.isNew)) return;
    setDrafts((current) => [
      {
        id: "",
        clientKey: crypto.randomUUID(),
        name: "",
        updatedAt: new Date().toISOString(),
        isNew: true,
      },
      ...current,
    ]);
  };

  const updateName = (clientKey: string, name: string) => {
    setDrafts((current) =>
      current.map((item) =>
        item.clientKey === clientKey ? { ...item, name } : item,
      ),
    );
  };

  const save = async (draft: CategoryDraft) => {
    const name = draft.name.trim();
    if (!name) {
      setValidationError("Nama kategori wajib diisi.");
      return;
    }

    const duplicate = drafts.some(
      (item) =>
        item.clientKey !== draft.clientKey &&
        item.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      setValidationError("Nama kategori sudah digunakan.");
      return;
    }

    setValidationError("");
    try {
      await onSave({
        id: draft.id || slugify(name),
        name,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // Pesan backend ditampilkan oleh panel admin utama.
    }
  };

  const remove = async () => {
    if (!deleting) return;
    if (deleting.isNew) {
      setDrafts((current) =>
        current.filter((item) => item.clientKey !== deleting.clientKey),
      );
      setDeleting(null);
      return;
    }

    try {
      await onDelete(deleting);
      setDeleting(null);
    } catch {
      // Dialog tetap terbuka agar admin dapat memindahkan skrip bila diperlukan.
    }
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p>Taksonomi Konten</p>
          <h1>Kelola Kategori</h1>
          <span>
            Kategori baru langsung tersedia di editor dan filter katalog.
          </span>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={addCategory}
          disabled={saving || drafts.some((item) => item.isNew)}
        >
          <Plus size={17} aria-hidden="true" />
          Tambah Kategori
        </button>
      </div>

      {validationError ? (
        <p className="form-error resource-validation" role="alert">
          {validationError}
        </p>
      ) : null}

      <section className="admin-panel category-manager">
        <div className="category-manager__heading">
          <FolderCog size={22} aria-hidden="true" />
          <div>
            <h2>Daftar kategori</h2>
            <p>Kategori yang masih dipakai skrip tidak dapat dihapus.</p>
          </div>
        </div>

        <div className="category-manager__list">
          {drafts.map((category) => {
            const usedBy = usage.get(category.name) ?? 0;
            return (
              <article key={category.clientKey}>
                <label>
                  <span className="sr-only">Nama kategori</span>
                  <input
                    required
                    value={category.name}
                    onChange={(event) =>
                      updateName(category.clientKey, event.target.value)
                    }
                    placeholder="Nama kategori"
                  />
                </label>
                <span className="category-manager__usage">
                  {category.isNew
                    ? "Kategori baru"
                    : `${usedBy} skrip menggunakan`}
                </span>
                <div className="resource-card__actions">
                  <button
                    className="button button--ghost button--small"
                    type="button"
                    onClick={() => setDeleting(category)}
                    disabled={saving}
                    aria-label={`Hapus kategori ${category.name || "baru"}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    Hapus
                  </button>
                  <button
                    className="button button--primary button--small"
                    type="button"
                    onClick={() => void save(category)}
                    disabled={saving}
                    aria-label={`Simpan kategori ${category.name || "baru"}`}
                  >
                    <Save size={15} aria-hidden="true" />
                    {saving ? "Menyimpan…" : "Simpan"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {deleting ? (
        <ConfirmDialog
          title="Hapus kategori"
          description={`Hapus kategori “${deleting.name || "baru"}”? Kategori yang masih digunakan skrip akan ditolak oleh database.`}
          busy={saving}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      ) : null}
    </>
  );
}
