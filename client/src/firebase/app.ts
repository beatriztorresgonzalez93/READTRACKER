// Inicialización de Firebase (Auth) — mismo proyecto que la app móvil y el backend Admin SDK.
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

function readWebConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim() ?? "";
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? "";
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? "";
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ?? "";
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "";
  const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim() ?? "";
  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error(
      "Falta la configuración web de Firebase (VITE_FIREBASE_*). En Firebase Console → Configuración del proyecto → Tus apps, copia el objeto firebaseConfig."
    );
  }
  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId
  };
}

const app: FirebaseApp = initializeApp(readWebConfig());
export const firebaseAuth: Auth = getAuth(app);
