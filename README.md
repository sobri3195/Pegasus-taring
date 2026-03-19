# Pegasus Taring

Pegasus Taring adalah platform gateway, automasi, dan orkestrasi multi-kanal berbasis TypeScript. Proyek ini menyatukan CLI, layanan gateway, antarmuka web, aplikasi desktop/mobile, sistem plugin, serta modul agen untuk membangun alur kerja pesan, AI, media, dan integrasi lintas kanal dalam satu codebase.

## Author dan Kontak

- **Author:** Lettu Kes dr. Muhammad Sobri Maulana, S.Kom, CEH, OSCP, OSCE
- **GitHub:** https://github.com/sobri3195
- **Email:** muhammadsobrimaulana31@gmail.com
- **Website:** https://muhammadsobrimaulana.netlify.app

## Social Media dan Komunitas

- **YouTube:** https://www.youtube.com/@muhammadsobrimaulana6013
- **Telegram:** https://t.me/winlin_exploit
- **TikTok:** https://www.tiktok.com/@dr.sobri
- **WhatsApp Group:** https://chat.whatsapp.com/B8nwRZOBMo64GjTwdXV8Bl

## Dukungan dan Donasi

- **Lynk.id:** https://lynk.id/muhsobrimaulana
- **Trakteer:** https://trakteer.id/g9mkave5gauns962u07t
- **Gumroad:** https://maulanasobri.gumroad.com/
- **KaryaKarsa:** https://karyakarsa.com/muhammadsobrimaulana
- **Nyawer:** https://nyawer.co/MuhammadSobriMaulana

## Tautan Tambahan

- **Sevalla Page:** https://muhammad-sobri-maulana-kvr6a.sevalla.page/
- **Toko Online Sobri:** https://pegasus-shop.netlify.app

## Fitur Utama

- Gateway multi-kanal untuk menghubungkan alur komunikasi, pairing perangkat, routing, dan status layanan.
- CLI lengkap untuk onboarding, konfigurasi, pengelolaan kanal, pengujian, dan automasi operasional.
- Sistem agen dan tool runtime untuk tugas lokal, sandbox, RPC, dan skill berbasis sesi.
- Dukungan plugin dan extension agar provider, kanal, memori, voice, serta integrasi tambahan bisa dipasang secara modular.
- Pipeline media untuk pemrosesan file, pemahaman media, image generation, text-to-speech, dan web search.
- UI dan aplikasi lintas platform melalui web UI, TUI, macOS, iOS, dan Android.
- Infrastruktur pengujian luas mencakup unit test, gateway test, extension test, end-to-end test, dan smoke test lintas environment.

## Modul Inti

### Runtime inti

- `src/cli` dan `src/commands` untuk entrypoint CLI, perintah operasional, dan workflow onboarding.
- `src/gateway`, `src/daemon`, dan `src/process` untuk server gateway, proses layanan, dan supervisi runtime.
- `src/config`, `src/secrets`, dan `src/security` untuk konfigurasi, pengelolaan rahasia, serta boundary keamanan.
- `src/routing`, `src/channels`, dan `src/pairing` untuk orkestrasi kanal, allowlist, transport, dan pairing perangkat.

### Agen dan automasi

- `src/agents` untuk runner agen, auth profile, sandbox, schema, tool, dan skill runtime.
- `src/cron` untuk job terjadwal dan workflow automasi terisolasi.
- `src/hooks` untuk hook bawaan dan ekstensi event-driven.
- `src/sessions` dan `src/context-engine` untuk state sesi dan konteks percakapan/runtime.

### AI, media, dan pemrosesan konten

- `src/providers` dan `extensions/*` untuk provider model, gateway AI, serta integrasi pihak ketiga.
- `src/media`, `src/media-understanding`, `src/image-generation`, dan `src/tts` untuk pipeline media multimodal.
- `src/web-search`, `src/link-understanding`, dan `src/markdown` untuk pengayaan konten, pencarian web, dan normalisasi teks.
- `src/memory` untuk abstraksi memori dan penyimpanan konteks percakapan.

### Antarmuka pengguna

- `src/browser`, `ui/`, dan `src/canvas-host` untuk browser runtime, UI web, dan host A2UI.
- `src/tui` dan `src/terminal` untuk antarmuka terminal interaktif.
- `apps/macos`, `apps/ios`, dan `apps/android` untuk aplikasi native lintas platform.

## Extension dan Integrasi

Direktori `extensions/` berisi modul integrasi yang dapat dipasang terpisah. Cakupannya meliputi:

- Kanal komunikasi seperti Discord, Telegram, Slack, Signal, WhatsApp, LINE, Matrix, IRC, Zalo, dan lainnya.
- Provider model dan gateway seperti Anthropic, OpenAI, Google, Mistral, Ollama, Vercel AI Gateway, Cloudflare AI Gateway, dan lainnya.
- Modul memori, voice, telephony, observability, sandbox, dan utilitas tambahan.

Struktur ini memudahkan pengembangan fitur baru tanpa membebani runtime inti.

## Struktur Direktori Singkat

```text
src/            Source code utama
extensions/     Extension dan plugin modular
apps/           Aplikasi macOS, iOS, dan Android
ui/             Web UI
docs/           Dokumentasi
scripts/        Script build, release, test, dan maintenance
dist/           Hasil build
```

## Menjalankan Proyek

### Prasyarat

- Node.js 22+
- pnpm
- Bun (direkomendasikan untuk sebagian workflow TypeScript)

### Instalasi dependensi

```bash
pnpm install
```

### Menjalankan CLI pengembangan

```bash
pnpm pegasus-taring --help
pnpm dev
```

### Menjalankan UI

```bash
pnpm ui:install
pnpm ui:dev
```

### Menjalankan TUI

```bash
pnpm tui
```

## Build dan Pengujian

### Build

```bash
pnpm build
```

### Pemeriksaan kualitas kode

```bash
pnpm check
pnpm format:check
```

### Menjalankan test

```bash
pnpm test
pnpm test:e2e
pnpm test:extensions
```

## Roadmap Fitur Realistis

Berikut roadmap fitur yang realistis untuk dikembangkan dari fondasi codebase saat ini.
Fokusnya adalah meningkatkan observability, operasional multi-kanal, dan pengalaman konfigurasi tanpa mengubah arsitektur inti.

### Prioritas 90 hari

#### Fase 1 — observability dan debugging

1. **Routing simulator / debugger**
   - Simulasikan pesan masuk berdasarkan channel, peer, account, guild, atau thread.
   - Tampilkan agent yang terpilih, aturan yang match, fallback yang dipakai, dan session key yang terbentuk.
   - Sangat membantu untuk deployment multi-agent dan troubleshooting binding.

2. **Unified channel health dashboard**
   - Ringkasan status semua channel dalam satu layar: connected, degraded, disconnected, auth state, dan last error.
   - Tombol aksi cepat seperti probe ulang, buka pairing, atau buka dokumentasi channel.
   - Cocok sebagai perluasan alami dari command status dan health probe yang sudah ada.

#### Fase 2 — automasi dan memory operations

3. **Cron jobs calendar + run history**
   - Tampilan visual untuk jadwal job, next run, run history, delivery mode, dan tombol run now / pause / duplicate.
   - Memudahkan penggunaan scheduler oleh operator non-teknis.

4. **Memory inspector + pin/forget controls**
   - Jelaskan memory apa yang ikut dipakai saat agent menjawab.
   - Tambahkan aksi untuk pin memory penting, forget memory usang, atau exclude source tertentu.
   - Berguna untuk audit kualitas jawaban dan pemeliharaan workspace jangka panjang.

#### Fase 3 — onboarding extension

5. **Extension catalog + setup wizard**
   - Katalog extension/provider/channel yang tersedia, status instalasi, dependensi, dan quick setup.
   - Ideal untuk menurunkan friksi onboarding saat pengguna ingin menambah channel atau provider baru.

### Dampak yang diharapkan

- Waktu troubleshooting konfigurasi multi-kanal menjadi lebih singkat.
- Onboarding pengguna baru menjadi lebih mudah.
- Operasional cron, memory, dan extension bisa dikelola oleh pengguna yang tidak selalu nyaman dengan CLI.
- Nilai codebase meningkat tanpa perlu refactor besar pada runtime inti.

## Kapan Proyek Ini Cocok Dipakai

Pegasus Taring cocok bila Anda membutuhkan:

- Orkestrasi multi-kanal dalam satu runtime.
- Platform eksperimen untuk agen, tool, skill, dan workflow berbasis sesi.
- Sistem yang bisa diperluas melalui extension tanpa mengubah seluruh inti aplikasi.
- Fondasi untuk build desktop, mobile, web UI, dan terminal dari satu repository.

## Catatan Pengembangan

- Codebase ini besar dan modular, sehingga perubahan sebaiknya mengikuti batas tanggung jawab tiap direktori.
- Untuk pengembangan fitur baru, prioritaskan penempatan logika pada modul yang paling dekat dengan domainnya.
- Untuk integrasi baru, gunakan pola extension agar dependensi tetap terisolasi.
