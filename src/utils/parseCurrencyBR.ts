export function parseCurrencyBR(value: string): number {
  if (!value) return 0;

  return Number(
    value
      .replace(/\s/g, '')
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.')
  );
}
