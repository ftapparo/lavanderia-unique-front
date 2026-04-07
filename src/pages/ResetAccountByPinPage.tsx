import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Button, Input, InputOTP, InputOTPGroup, InputOTPSlot, Label } from "@/components/ui/primitives";

const RESET_IDENTITY_KEY = "reset_identity";
const RESET_REQUESTED_AT_KEY = "reset_requested_at";
const RESEND_COOLDOWN_SECONDS = 120;

const resolveRequestedAt = (value: unknown): number => {
  const asNumber = Number(value);
  return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : Date.now();
};

export default function ResetAccountByPinPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as { identity?: string; requestedAt?: number };

  const identity = useMemo(() => {
    const fromState = String(locationState.identity || "").trim().toLowerCase();
    if (fromState) return fromState;
    return String(sessionStorage.getItem(RESET_IDENTITY_KEY) || "").trim().toLowerCase();
  }, [locationState.identity]);

  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requestedAt, setRequestedAt] = useState(() => {
    if (locationState.requestedAt) return resolveRequestedAt(locationState.requestedAt);
    return resolveRequestedAt(sessionStorage.getItem(RESET_REQUESTED_AT_KEY));
  });
  const [remainingSeconds, setRemainingSeconds] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (!identity) return;
    sessionStorage.setItem(RESET_IDENTITY_KEY, identity);
  }, [identity]);

  useEffect(() => {
    sessionStorage.setItem(RESET_REQUESTED_AT_KEY, String(requestedAt));
    const tick = () => {
      const elapsed = Math.floor((Date.now() - requestedAt) / 1000);
      setRemainingSeconds(Math.max(0, RESEND_COOLDOWN_SECONDS - elapsed));
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [requestedAt]);

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!identity) {
      setError("Sessao de recuperacao invalida. Solicite um novo codigo.");
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      setError("Informe o PIN com 6 digitos.");
      return;
    }
    if (!newPassword.trim()) {
      setError("Informe a nova senha.");
      return;
    }
    if (newPassword.trim().length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas nao coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword({ identity, pin, newPassword: newPassword.trim() });
      sessionStorage.removeItem(RESET_IDENTITY_KEY);
      sessionStorage.removeItem(RESET_REQUESTED_AT_KEY);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!identity || remainingSeconds > 0) return;
    setError("");
    setSuccess("");
    setResending(true);
    try {
      await api.auth.forgotPassword({ identity });
      const now = Date.now();
      setRequestedAt(now);
      setPin("");
      setSuccess("Codigo reenviado. Verifique seu e-mail.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao reenviar codigo.");
    } finally {
      setResending(false);
    }
  };

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center space-y-4">
          <p className="typo-body text-foreground">Nao encontramos uma solicitacao ativa de recuperacao.</p>
          <Button type="button" className="w-full" onClick={() => navigate("/esqueci-senha", { replace: true })}>
            Solicitar codigo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-6">
        <div className="space-y-1 text-center">
          <h1 className="typo-section-title text-foreground">Resgatar conta</h1>
          <p className="typo-caption text-muted-foreground">Digite o codigo PIN recebido e informe sua nova senha.</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label>Codigo PIN</Label>
            <InputOTP
              maxLength={6}
              value={pin}
              onChange={(value) => setPin(value.replace(/\D/g, "").slice(0, 6))}
              disabled={loading}
              autoFocus
            >
              <InputOTPGroup className="w-full justify-between">
                <InputOTPSlot index={0} className="h-11 w-11 rounded-md border border-input" />
                <InputOTPSlot index={1} className="h-11 w-11 rounded-md border border-input" />
                <InputOTPSlot index={2} className="h-11 w-11 rounded-md border border-input" />
                <InputOTPSlot index={3} className="h-11 w-11 rounded-md border border-input" />
                <InputOTPSlot index={4} className="h-11 w-11 rounded-md border border-input" />
                <InputOTPSlot index={5} className="h-11 w-11 rounded-md border border-input" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar nova senha</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              disabled={loading}
            />
          </div>

          {error ? <div className="state-danger-soft rounded-md border p-3 typo-body font-medium">{error}</div> : null}
          {success ? <div className="rounded-md border border-border bg-muted/40 p-3 typo-caption text-muted-foreground">{success}</div> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Redefinindo..." : "Redefinir senha"}
          </Button>
        </form>

        <div className="text-center space-y-1">
          {remainingSeconds > 0 ? (
            <p className="typo-caption text-muted-foreground">
              Reenviar codigo em {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, "0")}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              {resending ? "Reenviando..." : "Reenviar codigo"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

