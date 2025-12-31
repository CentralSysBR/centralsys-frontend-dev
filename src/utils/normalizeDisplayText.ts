export function normalizeDisplayText(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .replace(/(^|\s|\/|-)\S/g, (char) => char.toUpperCase())
    .trim();
}