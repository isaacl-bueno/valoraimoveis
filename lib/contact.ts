/** Dados de contato genéricos da Valora (Curitiba/PR). */
export const contact = {
  city: "Curitiba",
  state: "PR",
  cityState: "Curitiba, PR",
  addressLine1: "Av. Sete de Setembro, 1500 — Centro",
  addressLine2: "Curitiba/PR",
  addressFull: "Av. Sete de Setembro, 1500 — Centro, Curitiba/PR",
  phoneDisplay: "(41) 3333-1000",
  whatsappDisplay: "(41) 99999-0000",
  /** DDI + DDD + número, sem símbolos */
  whatsappE164: "5541999990000",
  email: "contato@valoraimoveis.com.br",
  creci: "CRECI 12.345-J",
  hoursWeekday: "Segunda a sexta, 09h às 18h",
  hoursSaturday: "Sábado: 09h às 13h",
  mapsUrl: "https://maps.google.com/?q=Av.+Sete+de+Setembro,+1500,+Curitiba,+PR",
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${contact.whatsappE164}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
