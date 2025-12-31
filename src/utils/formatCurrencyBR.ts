export function formatCurrencyBR(value: number | string): string {
  const numericValue =
    typeof value === 'string'
      ? Number(value.replace(/[^\d.-]/g, ''))
      : value;

  if (isNaN(numericValue)) return 'R$ 0,00';

  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}