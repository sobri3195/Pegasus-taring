# OpenClaw SIMPUS Scanner & OSINT Assistant

OpenClaw SIMPUS Scanner & OSINT Assistant adalah extension Pegasus Taring untuk membantu fasilitas kesehatan, puskesmas, klinik, dan vendor SIMPUS melakukan pemetaan risiko keamanan secara aman, ringan, dan defensif.

Extension ini dirancang untuk kondisi nyata di lingkungan faskes:

- budget keamanan terbatas,
- sistem berjalan 24 jam,
- manajemen sering membutuhkan ringkasan risiko yang mudah dipahami,
- audit keamanan perlu dilakukan tanpa mengganggu layanan,
- data keamanan sebaiknya tetap berada di lingkungan lokal/on-premise.

## Tujuan

Fitur ini membantu tim teknis dan manajemen untuk:

- mengetahui port dan service yang terbuka,
- memantau perubahan exposure dari waktu ke waktu,
- melakukan OSINT pasif terhadap domain SIMPUS,
- memeriksa header keamanan HTTP,
- memeriksa metadata TLS certificate,
- mendeteksi indikasi admin panel atau dokumentasi API yang terekspos,
- membuat laporan Markdown/JSON/CSV,
- memberi rekomendasi mitigasi defensif.

## Safety First

Extension ini bukan alat exploit dan bukan pentest framework.

Extension ini tidak melakukan:

- brute force,
- exploit,
- fuzzing agresif,
- credential guessing,
- bypass login,
- pengambilan data pasien,
- DoS,
- evasion,
- scanning target tanpa otorisasi.

Gunakan hanya pada target yang Anda miliki atau telah mendapatkan izin tertulis.

## Fitur

### 1. Light Scanning

Scanner menggunakan pendekatan ringan dan non-destruktif.

Default command Nmap:

```bash
nmap -sV -Pn -T2 --open -oX output.xml TARGET
```

Default ini hanya melakukan service/version detection ringan, tidak menjalankan exploit, brute force, fuzzing, atau NSE intrusive script. Opsi `deepCheck` sengaja default `false` dan membutuhkan acknowledgement eksplisit.

### 2. Asset Registry

Asset registry menyimpan aset SIMPUS/SIMRS/API/website/database/DICOM/gateway dengan metadata owner, lokasi, environment, catatan, dan status otorisasi. Target public hanya boleh diproses bila `ALLOW_PUBLIC_SCAN=true` dan target ditandai authorized.

### 3. Passive OSINT

OSINT yang dilakukan terbatas pada DNS lookup, HTTP status, security headers, TLS metadata, robots.txt, sitemap.xml, security.txt, technology hints dari header/meta generator, dan daftar path aman yang kecil seperti `/admin`, `/login`, `/dashboard`, `/api`, `/swagger`, `/docs`, `/phpmyadmin`, `/server-status`, dan `/.git/`.

Extension tidak melakukan directory brute force, form submit, login bypass, atau download data besar.

### 4. SIMPUS Risk Engine

Risk engine rule-based memberi konteks faskes untuk database exposure, admin panel exposure, API documentation exposure, HTTP tanpa HTTPS, TLS/certificate issue, missing security headers, dan remote access exposure.

### 5. Comparison

Comparison mendeteksi port baru/tertutup, service atau version berubah, risk level naik, security header hilang, TLS mendekati expired, exposed path baru, dan resolved IP berubah.

### 6. Reporting

Laporan tersedia sebagai Markdown, JSON, dan CSV. Markdown berisi executive summary, scope, methodology, asset overview, open ports, OSINT findings, analisis risiko SIMPUS, perubahan sejak scan terakhir, temuan prioritas, rekomendasi 24 jam/7 hari/30 hari, dan safety note.

### 7. Local AI Summary

Optional local LLM summary memakai Ollama lokal saja.

Default:

```bash
OLLAMA_ENABLED=false
```

Jika diaktifkan, hanya hasil scan lokal yang dikirim ke endpoint Ollama lokal (`http://127.0.0.1:11434/api/generate` by default). Tidak ada pengiriman ke cloud.

## CLI

```bash
pnpm pegasus-taring openclaw-simpus init

pnpm pegasus-taring openclaw-simpus asset add \
  --name "SIMPUS Dummy" \
  --target "192.168.1.50" \
  --type "simpus" \
  --environment "dummy" \
  --authorized true

pnpm pegasus-taring openclaw-simpus scan \
  --asset "SIMPUS Dummy"

pnpm pegasus-taring openclaw-simpus osint \
  --target "https://simpus.example.go.id" \
  --authorized true

pnpm pegasus-taring openclaw-simpus report \
  --asset "SIMPUS Dummy" \
  --format markdown

pnpm pegasus-taring openclaw-simpus compare \
  --asset "SIMPUS Dummy"
```

## Storage

Data disimpan lokal sebagai JSON di `~/.openclaw/simpus-cybersec/store.json` atau path `OPENCLAW_SIMPUS_DATA_DIR`.

Disimpan:

- assets,
- scanRuns,
- portFindings,
- osintFindings,
- comparisons,
- reports,
- auditLogs.

Tidak disimpan:

- password,
- token,
- credential,
- data pasien,
- payload login,
- cookie sensitif.

## Audit Log

Setiap aktivitas dicatat dengan command, target, timestamp, mode, status, dan blocked reason bila validator menolak tindakan.

## Safety Validator

Validator menolak target kosong, karakter shell berbahaya, target public tanpa `ALLOW_PUBLIC_SCAN=true`, production asset yang belum authorized, `deepCheck` tanpa flag eksplisit, dan format target di luar allowlist IP/domain/URL.
