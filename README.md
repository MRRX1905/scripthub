# ScriptHub Indonesia

Direktori skrip game dengan situs publik read-only dan satu konsol admin. Proyek ini dibangun menggunakan React, TypeScript, Vite, dan GitHub Pages.

## Model akses

- Pengunjung publik hanya dapat mencari, memfilter, membaca detail, melihat kompatibilitas, dan menyalin kode yang sudah diterbitkan.
- Tidak ada akun pengunjung, profil kreator, bookmark, follow, komentar, atau tombol unggah di situs publik.
- Hanya pemilik repositori yang memiliki fine-grained GitHub token dengan permission `Contents: Read and write` yang dapat memakai `/#/admin`.
- Token GitHub tidak pernah dibundel saat build dan hanya disimpan di `sessionStorage`.
- Perubahan admin memperbarui `public/data/content.json` melalui GitHub Contents API. Commit baru memicu workflow GitHub Pages.

## Menjalankan secara lokal

Persyaratan: Node.js versi LTS terbaru.

```bash
npm install
npm run dev
```

Build produksi:

```bash
npm run build
npm run preview
```

## Konfigurasi admin

Salin `.env.example` menjadi `.env.local`, lalu isi:

```dotenv
VITE_GITHUB_OWNER=nama-akun-github
VITE_GITHUB_REPO=nama-repository
VITE_GITHUB_BRANCH=main
VITE_GITHUB_ADMIN_LOGIN=nama-akun-github
VITE_GITHUB_CONTENT_PATH=public/data/content.json
```

Variabel ini hanya mengisi otomatis form koneksi; jangan pernah menyimpan token GitHub dalam `.env`, source code, atau repository.

Untuk mengelola konten:

1. Buat fine-grained personal access token di GitHub.
2. Batasi token hanya ke repository ScriptHub.
3. Berikan repository permission `Contents: Read and write`.
4. Buka `/#/admin`, masukkan detail repository dan token.
5. Tambah/edit konten, pilih `Draft` atau `Terbit`, lalu simpan.
6. Konsol membuat commit untuk `public/data/content.json`; workflow Pages berjalan otomatis.

## Deploy ke GitHub Pages

1. Buat repository GitHub dan push proyek ini ke branch `main`.
2. Buka **Settings → Pages**.
3. Pada **Build and deployment**, pilih **GitHub Actions**.
4. Jalankan workflow **Deploy ScriptHub to GitHub Pages** atau push commit baru.

`vite.config.ts` otomatis memakai:

- `/` untuk repository bernama `<username>.github.io`.
- `/<nama-repository>/` untuk project site GitHub Pages.
- `VITE_BASE_PATH` jika Anda perlu override manual.

Workflow mengikuti [panduan deployment Vite](https://vite.dev/guide/static-deploy) dan [custom workflow GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Struktur penting

```text
public/data/content.json       Data skrip dan status eksekutor
public/assets/                 Thumbnail lokal
public/design/                 Konsep visual yang menjadi acuan
src/pages/                     Halaman publik dan konsol admin
src/components/admin/          Komponen pengelolaan konten
src/lib/github.ts              Integrasi GitHub Contents API
.github/workflows/deploy.yml   Build dan deployment Pages
```

## Catatan keamanan

- Hak akses sebenarnya ditegakkan oleh permission repository GitHub, bukan password di frontend.
- Gunakan token dengan scope minimum dan masa berlaku singkat.
- Jangan membagikan token lewat chat, issue, commit, screenshot, atau log.
- Status “Ditinjau Admin” bukan jaminan mutlak keamanan alat pihak ketiga; periksa kode dan sumber sebelum publikasi.
