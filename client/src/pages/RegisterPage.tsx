// Pantalla para crear cuenta en ReadTracker.
import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { isApiError, useAuth } from "../context/AuthContext";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(isApiError(err) ? err.message : "No se pudo crear la cuenta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md space-y-4">
      <Card className="bg-white/90 dark:bg-slate-900/80">
        <CardHeader className="pb-2">
          <p className="rt-kicker text-slate-500 dark:text-slate-400">Cuenta nueva</p>
          <h1 className="rt-page-title text-3xl text-slate-900 dark:text-slate-100">Crear cuenta</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Nombre</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Contraseña
              </label>
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                minLength={6}
                required
              />
            </div>
            {error && <Alert variant="destructive">{error}</Alert>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>
          <p className="rt-body-copy mt-4 text-slate-600 dark:text-slate-300">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-semibold text-cyan-700 hover:underline dark:text-cyan-300">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
};
