/** A page number from the address ("2" → 2), or null when it isn't a sensible one. */
export function pageNumber(raw: string | undefined | null) {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 9999 ? n : null;
}
