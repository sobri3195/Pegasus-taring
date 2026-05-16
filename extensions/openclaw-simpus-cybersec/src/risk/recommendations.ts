export const recommendations = {
  database:
    "Batasi port database ke jaringan internal/VPN, aktifkan firewall, audit akun database, dan pastikan backup terenkripsi.",
  remote: "Batasi remote access dengan VPN, MFA, allowlist IP, dan monitoring login.",
  web: "Tinjau exposure web, aktifkan HTTPS, hardening header, dan batasi panel admin dari internet.",
  docs: "Lindungi dokumentasi API dengan autentikasi atau pindahkan ke jaringan internal.",
  git: "Blokir akses ke direktori .git di web server dan rotasi secret jika source pernah terekspos.",
  tls: "Perbarui sertifikat TLS dan pantau masa berlaku sebelum jatuh tempo.",
  headers: "Tambahkan security headers standar melalui reverse proxy atau aplikasi.",
};
