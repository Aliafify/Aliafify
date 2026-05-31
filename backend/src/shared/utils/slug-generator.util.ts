const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670]/g;
const UNSAFE_SLUG_CHARS = /[^\p{L}\p{N}]+/gu;

export function generateSeoSlug(value: string, fallback: string): string {
  const slug = value
    .normalize('NFKD')
    .replace(ARABIC_DIACRITICS, '')
    .toLowerCase()
    .trim()
    .replace(UNSAFE_SLUG_CHARS, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return slug || fallback;
}
