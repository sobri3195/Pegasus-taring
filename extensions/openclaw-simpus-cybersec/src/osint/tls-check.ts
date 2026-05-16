import tls from "node:tls";

export type TlsMetadata = { issuer?: string; validUntil?: string };

export async function collectTlsMetadata(hostname: string): Promise<TlsMetadata> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,
        timeout: 8_000,
        rejectUnauthorized: false,
      },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        resolve({
          issuer: formatIssuer(cert.issuer),
          validUntil: cert.valid_to ? new Date(cert.valid_to).toISOString() : undefined,
        });
      },
    );
    socket.on("timeout", () => {
      socket.destroy();
      resolve({});
    });
    socket.on("error", () => resolve({}));
  });
}

function formatIssuer(issuer?: Record<string, string | string[] | undefined>): string | undefined {
  if (!issuer) return undefined;
  const org = Array.isArray(issuer.O) ? issuer.O.join(", ") : issuer.O;
  const cn = Array.isArray(issuer.CN) ? issuer.CN.join(", ") : issuer.CN;
  return [org, cn].filter(Boolean).join(" / ") || undefined;
}
