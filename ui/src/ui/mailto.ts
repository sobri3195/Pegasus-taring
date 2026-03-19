export function buildMailtoUrl(params: { to: string; subject: string; body: string }): string {
  const to = params.to.trim();
  const subject = encodeURIComponent(params.subject);
  const body = encodeURIComponent(params.body);
  return `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}`;
}

export function openMailtoDraft(params: { to: string; subject: string; body: string }) {
  const href = buildMailtoUrl(params);
  if (typeof window !== "undefined") {
    window.location.href = href;
  }
}
