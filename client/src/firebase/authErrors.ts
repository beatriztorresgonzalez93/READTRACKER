// Mensajes legibles para códigos de error de Firebase Auth.
export function mapFirebaseAuthError(err: unknown): string {
  const code =
    err && typeof err === "object" && "code" in err && typeof (err as { code?: unknown }).code === "string"
      ? (err as { code: string }).code
      : "";
  switch (code) {
    case "auth/email-already-in-use":
      return "Ese correo ya está registrado.";
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/weak-password":
      return "La contraseña es demasiado débil.";
    case "auth/user-disabled":
      return "Esta cuenta está deshabilitada.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
    default:
      return "No se pudo completar el registro o el inicio de sesión.";
  }
}
