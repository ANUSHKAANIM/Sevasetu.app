// Deterministic color assignment for people without a photo, so avatars
// stay visually distinct and consistent across renders without needing
// real profile photography (which this MVP deliberately doesn't collect
// or fabricate — see docs/LEGAL_AND_COMPLIANCE.md on identity data).
const AVATAR_PALETTE = [
  "#10513c", // primary bottle green
  "#c98a3c", // accent gold
  "#1a7a4c", // success green
  "#b8800f", // warm amber
  "#2f6f5e", // teal-green
  "#a8763a", // clay
  "#3d6b4f", // moss
  "#8a5a2b", // umber
];

export function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function initialsFor(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
