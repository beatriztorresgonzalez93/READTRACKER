// Configuración de Vite para React y Tailwind en el frontend.
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// En Vercel, `VITE_*` se inyecta en tiempo de build; sin URL pública la SPA llama a localhost y falla en el navegador.
// Vitest también carga este config: no aplicar la comprobación ahí (p. ej. shell con VERCEL heredado).
const isVitest = process.env.VITEST === "true" || process.env.VITEST === "1";
if (process.env.VERCEL === "1" && !isVitest) {
  const api = process.env.VITE_API_BASE_URL?.trim() ?? "";
  if (!api) {
    throw new Error(
      "Falta VITE_API_BASE_URL en Vercel. Añádela en Project → Settings → Environment Variables " +
        '(Production y Preview si aplica), valor p. ej. https://readtracker-api.onrender.com/api/v1, y redeploy.'
    );
  }
  if (api.includes("localhost") || api.includes("127.0.0.1")) {
    throw new Error("VITE_API_BASE_URL no puede ser localhost en Vercel: usa la URL pública de tu API.");
  }
  const fbKeys = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_APP_ID"
  ] as const;
  const missingFb = fbKeys.filter((k) => !(process.env[k]?.trim()));
  if (missingFb.length > 0) {
    throw new Error(
      "Faltan variables de Firebase en Vercel (misma app web que en la consola de Firebase): " +
        missingFb.join(", ") +
        ". Añádelas en Project → Settings → Environment Variables y redeploy."
    );
  }
}

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    env: {
      VITE_FIREBASE_API_KEY: "vitest-placeholder-key",
      VITE_FIREBASE_AUTH_DOMAIN: "vitest.firebaseapp.com",
      VITE_FIREBASE_PROJECT_ID: "vitest-project",
      VITE_FIREBASE_STORAGE_BUCKET: "vitest-project.appspot.com",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "000000000000",
      VITE_FIREBASE_APP_ID: "1:000000000000:web:0000000000000000000000"
    }
  },
})
