const DEFAULT_AVATAR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="bg" x1="16" y1="12" x2="114" y2="116" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#22d3ee" />
      <stop offset="52%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#818cf8" />
    </linearGradient>
    <linearGradient id="shine" x1="28" y1="18" x2="92" y2="106" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.36" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="32" fill="url(#bg)" />
  <circle cx="64" cy="54" r="22" fill="#eff6ff" fill-opacity="0.92" />
  <path d="M26 108c6-22 24-32 38-32s32 10 38 32" fill="#eff6ff" fill-opacity="0.92" />
  <circle cx="46" cy="38" r="32" fill="url(#shine)" />
  <circle cx="92" cy="96" r="22" fill="#0f172a" fill-opacity="0.08" />
</svg>`;

export const DEFAULT_AVATAR_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(DEFAULT_AVATAR_SVG.trim())}`;

export function getAvatarUrl(value?: string | null) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || DEFAULT_AVATAR_URL;
}
