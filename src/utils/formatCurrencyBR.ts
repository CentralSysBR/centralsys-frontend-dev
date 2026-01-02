/**
 * Formata um valor inteiro em centavos para "R$ 0,00".
 */
export function formatCurrencyBR(valueCentavos: number | null | undefined): string {
  const centavos = typeof valueCentavos === "number" && Number.isFinite(valueCentavos) ? valueCentavos : 0;
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}
