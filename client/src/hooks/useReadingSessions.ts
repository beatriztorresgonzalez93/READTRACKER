// Hook de estado para historial: carga/borrado de sesiones y manejo unificado de errores.
import { useCallback, useEffect, useState } from "react";
import { deleteReadingSession, getReadableErrorMessage, getReadingSessions } from "../api/client";
import { ReadingSession } from "../types/readingSession";

interface UseReadingSessionsOptions {
  onDeleteSuccess?: (deletedSessionId: string) => Promise<void> | void;
}

export const useReadingSessions = (options?: UseReadingSessionsOptions) => {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReadingSessions();
      setSessions(data);
    } catch (err) {
      setSessions([]);
      setError(getReadableErrorMessage(err, "No se pudo cargar el historial de lectura."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const removeSession = useCallback(
    async (sessionId: string) => {
      if (deletingSessionId !== null) return;
      try {
        setDeletingSessionId(sessionId);
        setError(null);
        await deleteReadingSession(sessionId);
        setSessions((current) => current.filter((session) => session.id !== sessionId));
        if (options?.onDeleteSuccess) {
          await options.onDeleteSuccess(sessionId);
        }
      } catch (err) {
        setError(getReadableErrorMessage(err, "No se pudo borrar la sesión."));
      } finally {
        setDeletingSessionId(null);
      }
    },
    [deletingSessionId, options]
  );

  return {
    sessions,
    loading,
    error,
    deletingSessionId,
    loadSessions,
    removeSession
  };
};
