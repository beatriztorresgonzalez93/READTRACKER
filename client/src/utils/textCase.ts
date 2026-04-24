// Utilidades de formato de texto para capitalizar cadenas en español.
export const capitalizeFirst = (value: string): string => {
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase("es") + value.slice(1);
};

/**
 * Primera letra de cada trozo separado por espacios (sin usar `\b`: en JS `\b` no trata
 * é, ñ, etc. como “letra de palabra” y acaba mayúsculando en medio de la palabra).
 */
export const capitalizeWords = (value: string): string =>
  value
    .split(/(\s+)/)
    .map((chunk) => {
      if (!chunk || /^\s+$/.test(chunk)) return chunk;
      return chunk.charAt(0).toLocaleUpperCase("es") + chunk.slice(1);
    })
    .join("");
