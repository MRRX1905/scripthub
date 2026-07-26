import {
  Check,
  FileCode2,
  Image,
  Link2,
  Save,
  Upload,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  Fragment,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { assetUrl } from "../../lib/assets";
import { slugify } from "../../lib/format";
import type {
  CategoryItem,
  ExecutorItem,
  KeySystem,
  ScriptItem,
} from "../../types";

interface ScriptEditorProps {
  script: ScriptItem | null;
  executors: ExecutorItem[];
  categories: CategoryItem[];
  knownSlugs: string[];
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (script: ScriptItem) => Promise<void>;
}

const emptyScript = (category = "Lainnya"): ScriptItem => ({
  id: "",
  slug: "",
  title: "",
  game: "",
  category,
  summary: "",
  description: "",
  features: [],
  keySystem: "no-key",
  keyUrl: "",
  executors: [],
  thumbnail: "",
  scriptCode: "",
  verifiedByAdmin: false,
  published: false,
  views: 0,
  updatedAt: new Date().toISOString(),
});

export function ScriptEditor({
  script,
  executors,
  categories,
  knownSlugs,
  open,
  saving,
  onClose,
  onSave,
}: ScriptEditorProps) {
  const [form, setForm] = useState<ScriptItem>(() =>
    emptyScript(categories[0]?.name),
  );
  const [featureText, setFeatureText] = useState("");
  const [error, setError] = useState("");
  const drawerTitleId = useId();
  const isEditing = Boolean(script);
  const originalSlug = script?.slug || "";

  useEffect(() => {
    const value = script
      ? structuredClone(script)
      : emptyScript(categories[0]?.name);
    setForm(value);
    setFeatureText(value.features.join("\n"));
    setError("");
  }, [script, open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, open]);

  const imagePreview = useMemo(
    () => (form.thumbnail ? assetUrl(form.thumbnail) : ""),
    [form.thumbnail],
  );

  const update = <Key extends keyof ScriptItem>(
    field: Key,
    value: ScriptItem[Key],
  ) => setForm((current) => ({ ...current, [field]: value }));

  const toggleExecutor = (name: string) => {
    setForm((current) => ({
      ...current,
      executors: current.executors.includes(name)
        ? current.executors.filter((item) => item !== name)
        : [...current.executors, name],
    }));
  };

  const loadScriptFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5 MB.");
      return;
    }

    update("scriptCode", await file.text());
    setError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const slug = form.slug.trim() || slugify(form.title);
    const isDuplicate =
      slug !== originalSlug && knownSlugs.includes(slug);

    if (!slug) {
      setError("Judul belum dapat diubah menjadi slug yang valid.");
      return;
    }
    if (isDuplicate) {
      setError("Slug sudah dipakai oleh skrip lain.");
      return;
    }
    if (!form.executors.length) {
      setError("Pilih minimal satu eksekutor kompatibel.");
      return;
    }
    const keyUrl = form.keyUrl?.trim() || "";
    if (form.keySystem === "key-required") {
      try {
        const parsedUrl = new URL(keyUrl);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error();
        }
      } catch {
        setError("Link key wajib berupa URL http atau https yang valid.");
        return;
      }
    }

    const nextScript: ScriptItem = {
      ...form,
      id: isEditing ? form.id : slug,
      slug,
      features: featureText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      keyUrl: form.keySystem === "key-required" ? keyUrl : "",
      verifiedByAdmin: form.published,
      updatedAt: new Date().toISOString(),
    };
    setError("");
    await onSave(nextScript);
  };

  return (
    <Fragment>
      {open ? (
        <button
          className="editor-drawer__backdrop"
          type="button"
          aria-label="Tutup editor"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`editor-drawer ${open ? "editor-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={drawerTitleId}
        aria-hidden={!open}
        inert={!open}
      >
      <div className="editor-drawer__header">
        <div>
          <p>{isEditing ? "Perbarui konten" : "Konten baru"}</p>
          <h2 id={drawerTitleId}>{isEditing ? "Edit Skrip" : "Tambah Skrip"}</h2>
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label="Tutup editor"
          onClick={onClose}
        >
          <X size={19} />
        </button>
      </div>
      <form className="editor-form" onSubmit={submit}>
        <label>
          Judul Skrip
          <input
            required
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="Contoh: Hoho Hub v4"
          />
        </label>
        <div className="form-grid form-grid--two">
          <label>
            Nama Game
            <input
              required
              value={form.game}
              onChange={(event) => update("game", event.target.value)}
              placeholder="Blox Fruits"
            />
          </label>
          <label>
            Kategori
            <select
              required
              value={form.category}
              onChange={(event) => update("category", event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Ringkasan
          <input
            required
            maxLength={140}
            value={form.summary}
            onChange={(event) => update("summary", event.target.value)}
            placeholder="Ringkasan singkat untuk kartu katalog"
          />
        </label>
        <label>
          Deskripsi
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Jelaskan fungsi dan catatan penggunaan..."
          />
        </label>
        <label>
          Fitur
          <textarea
            rows={4}
            value={featureText}
            onChange={(event) => setFeatureText(event.target.value)}
            placeholder={"Satu fitur per baris\nAuto Farm\nESP"}
          />
        </label>
        <label>
          Kode Skrip
          <textarea
            required
            className="code-input"
            rows={7}
            value={form.scriptCode}
            onChange={(event) => update("scriptCode", event.target.value)}
            spellCheck={false}
            placeholder="Tempel kode yang sudah ditinjau..."
          />
        </label>
        <label className="file-control">
          <Upload size={17} aria-hidden="true" />
          <span>
            Isi kode dari file
            <small>.lua atau .txt, maksimal 5 MB</small>
          </span>
          <input
            type="file"
            accept=".lua,.txt,text/plain"
            onChange={loadScriptFile}
          />
        </label>
        <fieldset>
          <legend>Status Key</legend>
          <div className="inline-options">
            {[
              ["no-key", "Tanpa Key"],
              ["key-required", "Perlu Key"],
            ].map(([value, label]) => (
              <label key={value} className="radio-card">
                <input
                  type="radio"
                  name="editor-key-system"
                  checked={form.keySystem === value}
                  onChange={() => update("keySystem", value as KeySystem)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {form.keySystem === "key-required" ? (
          <label>
            Link untuk mendapatkan key
            <span className="input-with-icon">
              <Link2 size={16} aria-hidden="true" />
              <input
                required
                type="url"
                inputMode="url"
                value={form.keyUrl || ""}
                onChange={(event) => update("keyUrl", event.target.value)}
                placeholder="https://contoh.com/get-key"
              />
            </span>
            <small className="field-hint">
              Hanya tampil untuk skrip yang memerlukan key.
            </small>
          </label>
        ) : null}
        <fieldset>
          <legend>Kompatibilitas Eksekutor</legend>
          <div className="checkbox-grid">
            {executors.map((executor) => (
              <label key={executor.id}>
                <input
                  type="checkbox"
                  checked={form.executors.includes(executor.name)}
                  onChange={() => toggleExecutor(executor.name)}
                />
                <span>{executor.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          Thumbnail URL atau path aset
          <span className="input-with-icon">
            <Image size={16} aria-hidden="true" />
            <input
              required
              value={form.thumbnail}
              onChange={(event) => update("thumbnail", event.target.value)}
              placeholder="assets/nama-gambar.jpg"
            />
          </span>
        </label>
        {imagePreview ? (
          <div className="editor-image-preview">
            <img
              src={imagePreview}
              alt="Pratinjau thumbnail"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
        ) : null}
        <fieldset>
          <legend>Status Publikasi</legend>
          <div className="inline-options">
            <label className="radio-card">
              <input
                type="radio"
                name="publication-status"
                checked={form.published}
                onChange={() => update("published", true)}
              />
              <span>
                <Check size={15} aria-hidden="true" />
                Terbit
              </span>
            </label>
            <label className="radio-card">
              <input
                type="radio"
                name="publication-status"
                checked={!form.published}
                onChange={() => update("published", false)}
              />
              <span>
                <FileCode2 size={15} aria-hidden="true" />
                Draft
              </span>
            </label>
          </div>
        </fieldset>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="editor-drawer__actions">
          <button
            className="button button--ghost"
            type="button"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            className="button button--primary"
            type="submit"
            disabled={saving}
          >
            <Save size={17} aria-hidden="true" />
            {saving ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </div>
      </form>
      </aside>
    </Fragment>
  );
}
