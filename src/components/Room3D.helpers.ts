/** Extrai largura x profundidade de textos como "5,40 x 3,80 m". */
export function parseDimensions(text: string): [number, number] {
  const m = text.replace(",", ".").match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  const w = m ? Number(m[1]) : 4.2;
  const d = m ? Number(m[2]) : 3.4;
  return [Math.min(Math.max(w, 1.8), 12), Math.min(Math.max(d, 1.8), 12)];
}
