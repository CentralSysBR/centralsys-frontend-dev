/**
 * Converte input textual (pt-BR) em inteiro (centavos).
 *
 * Exemplos:
 * - "R$ 12,34" -> 1234
 * - "12" -> 1200
 * - "0,99" -> 99
 */
export function parseCurrencyBR(value: string): number {
  if (!value) return 0;

  const clean = value
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");

  const asNumber = Number(clean);
  if (!Number.isFinite(asNumber)) return 0;

  return Math.round(asNumber * 100);
}
