// Logger mínimo para depuración en logs de plataforma (p. ej. Render).
export function logError(scope: string, err: unknown): void {
  console.error(`[ReadTracker] ${scope}`, err);
}
