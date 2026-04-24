// Diálogo de ficha personal desde el header (nombre, apellidos, correo, foto, fechas de alta).
import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import { getReadableErrorMessage, type UpdateProfileBody } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { fileToAvatarDataUrl } from "../utils/avatarImage";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
import { Input } from "./ui/input";

const formatMemberDate = (iso: string) => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(d);
  } catch {
    return "—";
  }
};

const formatShortDate = (iso: string) => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return "—";
  }
};

export const UserProfileDialog = () => {
  const { user, updateProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const syncFromUser = useCallback(() => {
    if (!user) return;
    setName(user.name);
    setLastName(user.lastName ?? "");
    setAvatarUrl(user.avatarUrl ?? null);
    setError(null);
  }, [user]);

  useEffect(() => {
    if (open && user) syncFromUser();
  }, [open, user, syncFromUser]);

  if (!user) return null;

  const displayGreeting = user.name;

  const onPickFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setAvatarUrl(dataUrl);
    } catch (e) {
      setError(getReadableErrorMessage(e, "No se pudo usar esa imagen."));
    }
  };

  const onSave = async () => {
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      const body: UpdateProfileBody = {
        name: trimmedName,
        lastName: lastName.trim(),
        avatarUrl: avatarUrl ?? null
      };
      await updateProfile(body);
      setOpen(false);
    } catch (e) {
      setError(getReadableErrorMessage(e, "No se pudo guardar el perfil."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex max-w-[11rem] items-center gap-2 rounded-md border border-amber-600/50 bg-amber-950/25 px-2 py-1 text-left font-['Fraunces',serif] text-base font-semibold tracking-tight text-amber-100 transition hover:bg-amber-900/35 sm:max-w-none sm:border-transparent sm:bg-transparent sm:px-1 sm:py-0 sm:text-lg"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-500/50 bg-amber-950/50 sm:h-12 sm:w-12">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <User className="h-5 w-5 text-amber-200/90 sm:h-6 sm:w-6" aria-hidden />
          )}
        </span>
        <span className="min-w-0 truncate sm:inline">
          Hola, <span className="whitespace-nowrap">{displayGreeting}</span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[min(90vh,640px)] overflow-y-auto border border-[#c69253] bg-[#f8f1e5] text-[#4d311d] sm:max-w-md"
          showCloseButton
        >
          <DialogHeader className="border-b border-[#c4a27b]/60 pb-3 text-left">
            <DialogTitle className="font-['Fraunces',serif] text-xl text-[#5a2f1f]">Tu ficha</DialogTitle>
            <DialogDescription className="text-[#7a573c]">
              Datos de tu cuenta en Scriptorium. El correo no se puede cambiar aquí.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-1">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-[#8e633d] bg-[#efe3cd] shadow-inner">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#7a573c]">
                    <User className="h-10 w-10 opacity-70" />
                  </div>
                )}
              </div>
              <div className="flex w-full flex-col gap-2 text-center sm:text-left">
                <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={onPickFile} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-[#8e633d] bg-white/80 text-[#5a2f1f] hover:bg-[#ead9bd]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Cambiar foto
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[#8e633d] hover:bg-[#ead9bd]/80"
                    onClick={() => setAvatarUrl(null)}
                  >
                    Quitar foto
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="profile-first-name" className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a573c]">
                Nombre
              </label>
              <Input
                id="profile-first-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="given-name"
                className="border-[#c4a27b] bg-white/90 text-[#4d311d]"
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="profile-last-name" className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a573c]">
                Apellidos
              </label>
              <Input
                id="profile-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                className="border-[#c4a27b] bg-white/90 text-[#4d311d]"
              />
            </div>

            <div className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a573c]">Correo</span>
              <Input readOnly value={user.email} className="border-[#c4a27b]/80 bg-[#efe3cd]/80 text-[#5a2f1f]" />
            </div>

            <div className="rounded-lg border border-[#c4a27b]/50 bg-[#f5ecde]/80 px-3 py-2.5 text-sm text-[#5a2f1f]">
              <p>
                <span className="font-semibold text-[#7a573c]">Miembro desde: </span>
                {formatMemberDate(user.createdAt)}
              </p>
              <p className="mt-1 text-xs text-[#7a573c]">
                Fecha de alta de la cuenta: <span className="font-medium text-[#5a2f1f]">{formatShortDate(user.createdAt)}</span>
              </p>
            </div>

            {error && <p className="text-sm text-rose-800">{error}</p>}
          </div>

          <DialogFooter className="!mx-0 !mb-0 flex-col gap-2 border-t border-[#c4a27b]/60 bg-[#f5ecde]/50 pt-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-[#8e633d] text-[#5a2f1f]"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cerrar
            </Button>
            <Button
              type="button"
              className="bg-[#8e633d] text-[#f8f1e5] hover:bg-[#7c5534]"
              onClick={() => void onSave()}
              disabled={saving}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
