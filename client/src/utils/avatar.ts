// Avatar helpers — emoji avatars are replaced by initial-monograms in a solid
// colour. Colour is either the player's own picked swatch (stored locally) or,
// for everyone else, derived deterministically from their name so the lobby
// stays colourful and stable without sending avatar data over the wire.

export const AVATAR_COLORS = [
  "#c6f432", // lime
  "#5ac8fa", // sky
  "#ff6b5e", // coral
  "#ffd23f", // amber
  "#a78bfa", // violet
  "#4ad66d", // green
] as const;

const COLOR_STORAGE_KEY = "hangGuy_avatarColor";

/** First letters of the first two words, uppercased. Falls back to "?" */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  const first = parts[0][0] ?? "";
  const second = parts.length > 1 ? parts[1][0] : "";
  return (first + second).toUpperCase();
}

/** Stable colour for a name — same input always yields the same swatch. */
export function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getStoredAvatarColor(): string | null {
  return localStorage.getItem(COLOR_STORAGE_KEY);
}

export function setStoredAvatarColor(color: string): void {
  localStorage.setItem(COLOR_STORAGE_KEY, color);
}
