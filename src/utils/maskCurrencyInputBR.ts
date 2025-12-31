export function maskCurrencyInputBR(raw: string): string {
  // remove tudo que não for número
  const digits = raw.replace(/\D/g, '');

  if (!digits) return '';

  // interpreta como centavos
  const number = Number(digits) / 100;

  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
