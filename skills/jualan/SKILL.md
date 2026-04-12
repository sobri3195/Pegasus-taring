---
name: jualan
description: Workflow jualan sederhana untuk katalog, keranjang, checkout, pembayaran manual, dan invoice.
metadata:
  {
    "openclaw":
      {
        "emoji": "🛍️",
        "notes": "Skill ini dipakai untuk alur jualan MVP berbasis chat tanpa integrasi payment gateway.",
      },
  }
---

# Jualan (MVP)

Gunakan skill ini saat user ingin flow **jualan end-to-end sederhana**: lihat produk, pilih barang, checkout, kirim invoice, lalu konfirmasi pembayaran.

## Cakupan fitur

1. **Katalog produk**
   - Tampilkan daftar produk dengan format:
     - `kode`, `nama`, `harga`, `stok`, `deskripsi singkat`.
   - Saat stok 0, tandai sebagai `Habis`.

2. **Keranjang + checkout**
   - Ambil item dari user dengan format: `kode x jumlah`.
   - Validasi stok sebelum checkout.
   - Hitung subtotal per item + total belanja.

3. **Order via chat**
   - Gunakan langkah pesan berikut:
     1) `Pilih produk`
     2) `Konfirmasi keranjang`
     3) `Isi data pengiriman`
     4) `Ringkasan pesanan`

4. **Pembayaran (manual transfer)**
   - Tawarkan metode:
     - `Transfer Bank`
     - `E-Wallet`
   - Kirim instruksi bayar dengan nominal tepat dan batas waktu.

5. **Invoice + notifikasi admin**
   - Generate invoice teks dengan elemen:
     - Nomor invoice
     - Tanggal
     - Data pembeli
     - Daftar item
     - Ongkir
     - Total akhir
     - Status (`Menunggu Pembayaran` / `Dibayar` / `Diproses`)
   - Saat order dibuat, kirim ringkasan notifikasi admin.

## Template respons

### Katalog

- Judul: `📦 Katalog Produk`
- Tiap produk:
  - `[{kode}] {nama}`
  - `Harga: Rp{harga}`
  - `Stok: {stok}`
  - `{deskripsi}`

### Ringkasan checkout

- `🛒 Ringkasan Pesanan`
- Daftar item (`nama x qty = subtotal`)
- `Subtotal` / `Ongkir` / `Total`
- `Metode Pembayaran`

### Invoice

- `🧾 Invoice #{invoiceId}`
- `Tanggal: {tanggal}`
- `Pembeli: {nama} | {telepon}`
- `Alamat: {alamat}`
- Daftar item + nominal
- `Total Bayar: Rp{total}`
- `Status: Menunggu Pembayaran`
- `Silakan kirim bukti transfer untuk verifikasi.`

## Aturan penting

- Gunakan bahasa Indonesia yang jelas dan ramah.
- Jangan proses checkout bila stok tidak cukup.
- Jangan ubah harga setelah invoice dibuat tanpa persetujuan user.
- Jika data pengiriman belum lengkap, minta data wajib:
  - nama penerima
  - nomor HP
  - alamat lengkap

## Contoh alur cepat

1) User: "Mau beli"
2) Agent: kirim katalog
3) User: "BRG-01 x2, BRG-03 x1"
4) Agent: validasi stok + kirim ringkasan keranjang
5) User: konfirmasi + isi alamat
6) Agent: kirim invoice + instruksi pembayaran
7) Agent: kirim notifikasi ringkas ke admin
