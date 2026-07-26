# ScriptHub Indonesia

Direktori skrip game dengan situs publik read-only dan satu konsol admin. Proyek
ini dibangun menggunakan React, TypeScript, Vite, Supabase, dan GitHub Pages.

## Model akses

- Pengunjung publik hanya dapat mencari, memfilter, membaca detail, melihat
  kompatibilitas, dan menyalin skrip yang sudah diterbitkan.
- Tidak ada akun pengunjung atau tombol unggah pada situs publik.
- Hanya akun Supabase Auth dengan `app_metadata.role = "admin"` yang dapat
  menambah, mengedit, menerbitkan, atau menghapus konten.
- Row Level Security membatasi draft dan seluruh operasi tulis dari pengunjung.
- Perubahan pada skrip dan status eksekutor dikirim ke browser melalui Supabase
  Realtime tanpa deploy ulang.
- Admin dapat mengganti password langsung dari menu **Pengaturan**.

## Menjalankan secara lokal

Persyaratan: Node.js versi LTS terbaru.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Isi `.env.local` dengan URL dan publishable key Supabase:

```dotenv
VITE_SUPABASE_URL=https://project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_EMAIL=ztropixsantuy@gmail.com
```

Jangan pernah memasukkan `service_role`, secret key, atau password admin ke
repository. Publishable key memang dirancang untuk aplikasi browser; keamanan
operasi tetap ditegakkan oleh Row Level Security.

Build produksi:

```bash
npm run build
npm run preview
```

## Database

Migration berada di:

```text
supabase/migrations/20260726060105_create_scripthub_realtime_content.sql
```

Migration tersebut membuat tabel `scripts` dan `executors`, data awal, grant
Data API, kebijakan RLS, dan publikasi Realtime.

## Konsol admin

Buka:

```text
/#/admin
```

Alur yang tersedia:

1. Login menggunakan username dan password admin.
2. Tambah skrip baru sebagai draft atau langsung terbit.
3. Edit, preview, terbitkan, atau hapus skrip.
4. Perbarui status eksekutor.
5. Ganti password dari menu **Pengaturan**.
6. Setiap perubahan langsung terlihat oleh semua browser yang sedang membuka
   situs.

## Deploy ke GitHub Pages

Repository memakai workflow `.github/workflows/deploy.yml`. Tambahkan GitHub
Actions repository variables berikut:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_ADMIN_EMAIL`

Lalu pilih **Settings → Pages → GitHub Actions**. Push ke branch `main` akan
menjalankan build dan deploy otomatis.

`vite.config.ts` otomatis memakai:

- `/` untuk repository bernama `<username>.github.io`.
- `/<nama-repository>/` untuk project site GitHub Pages.
- `VITE_BASE_PATH` jika perlu override manual.

## Struktur penting

```text
src/lib/supabase.ts            Supabase browser client
src/lib/admin.ts               Login, logout, dan ganti password
src/lib/content.ts             CRUD dan subscription real-time
src/pages/AdminPage.tsx        Konsol admin
supabase/migrations/           Schema, RLS, seed, dan Realtime
.github/workflows/deploy.yml   Build dan deployment Pages
```
