/** Texto para comparação em buscas: sem acentos e sem diferenciar maiúsculas. */
export function normalize(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
