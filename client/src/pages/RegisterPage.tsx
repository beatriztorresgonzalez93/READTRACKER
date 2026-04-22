// Pantalla para crear cuenta en ReadTracker.
import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { isApiError, useAuth } from "../context/AuthContext";
import { capitalizeWords } from "../utils/textCase";

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

  const inputClassName =
    "border-[#b08a63] bg-[#f8f1e5] text-[#4d311d] placeholder:text-[#8d6d4d] dark:border-[#c4a27b]/70 dark:bg-[#2f160d]/70 dark:text-[#f1dfcf] dark:placeholder:text-[#b99872]";

  return (
    <section className="min-h-full px-4 py-6 text-[#4d311d] dark:text-[#f1dfcf]">
      <div className="mx-auto w-full max-w-md space-y-4">
        <Card className="border border-amber-700/60 bg-[#e9dcc4] text-[#4d311d] dark:border-amber-700/60 dark:bg-[#2f160d]/80 dark:text-[#f1dfcf]">
        <CardHeader className="pb-2">
          <p className="rt-kicker text-[#7a573c] dark:text-[#caa374]">Cuenta nueva</p>
          <h1 className="rt-page-title text-3xl text-[#5a2f1f] dark:text-amber-100">Crear cuenta</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#6f4b2e] dark:text-[#e0ccb4]">Nombre</label>
              <Input
                className={inputClassName}
                value={name}
                onChange={(event) => setName(capitalizeWords(event.target.value))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#6f4b2e] dark:text-[#e0ccb4]">Email</label>
              <Input
                className={inputClassName}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#6f4b2e] dark:text-[#e0ccb4]">
                Contraseña
              </label>
              <Input
                className={inputClassName}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                minLength={6}
                required
              />
            </div>
            {error && <Alert variant="destructive">{error}</Alert>}
            <Button
              type="submit"
              className="w-full border border-[#8e633d] bg-[#8e633d] text-[#f8f1e5] hover:bg-[#7c5534]"
              disabled={submitting}
            >
              {submitting ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>
          <p className="rt-body-copy mt-4 text-[#7a573c] dark:text-[#caa374]">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-semibold text-[#8e633d] hover:underline dark:text-amber-300">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
        </Card>
      </div>
    </section>
  );
};
