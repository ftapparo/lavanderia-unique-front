import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Button, Input, Label } from "@/components/ui/primitives";

const RESET_IDENTITY_KEY = "reset_identity";
const RESET_REQUESTED_AT_KEY = "reset_requested_at";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const normalizedIdentity = identity.trim().toLowerCase();
    if (!normalizedIdentity) {
      setError("Informe seu e-mail.");
      return;
    }

    setLoading(true);
    try {
      await api.auth.forgotPassword({ identity: normalizedIdentity });
      const requestedAt = Date.now();
      sessionStorage.setItem(RESET_IDENTITY_KEY, normalizedIdentity);
      sessionStorage.setItem(RESET_REQUESTED_AT_KEY, String(requestedAt));
      navigate("/resgatar-conta", {
        replace: true,
        state: { identity: normalizedIdentity, requestedAt },
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao solicitar codigo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-6">
        <div className="space-y-1 text-center">
          <h1 className="typo-section-title text-foreground">Recuperar conta</h1>
          <p className="typo-caption text-muted-foreground">
            Um codigo PIN sera enviado para seu e-mail para recuperar o acesso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-identity">E-mail</Label>
            <Input
              id="forgot-identity"
              type="email"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="Digite seu e-mail"
              autoFocus
              disabled={loading}
            />
          </div>

          {error ? <div className="state-danger-soft rounded-md border p-3 typo-body font-medium">{error}</div> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Solicitando..." : "Solicitar codigo"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="w-full text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Voltar para login
        </button>
      </div>
    </div>
  );
}

