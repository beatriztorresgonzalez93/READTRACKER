export const capitalizeFirst = (value: string): string => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const capitalizeWords = (value: string): string =>
  value.replace(/\b([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g, (letter) => letter.toUpperCase());
