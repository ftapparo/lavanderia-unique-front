import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/lib/notify";
import { Button, Input, InputOTP, InputOTPGroup, InputOTPSlot, Label } from "@/components/ui/primitives";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { clearMustChangePassword, logout, profile } = useAuth();
  const usingPin = Boolean(profile?.hasPin);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.auth.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    onSuccess: () => {
      clearMustChangePassword();
      notify.success("Senha alterada com sucesso.", {
        description: "Voce ja pode usar sua nova senha normalmente.",
      });
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      notify.error("Falha ao alterar senha.", {
        description: error instanceof Error ? error.message : "Erro.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.newPassword.trim()) return;
    if (usingPin) {
      if (!/^\d{6}$/.test(form.currentPassword.trim())) {
        notify.error("Informe o PIN de 6 digitos.");
        return;
      }
    } else if (!form.currentPassword.trim()) {
      notify.error("Informe a senha atual.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      notify.error("As senhas nao coincidem.");
      return;
    }
    if (form.newPassword.trim().length < 6) {
      notify.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Troca de senha obrigatoria</h1>
          <p className="text-sm text-muted-foreground">
            {usingPin
              ? "Digite o PIN temporario recebido e defina sua nova senha."
              : "Informe sua senha atual e defina uma nova senha para continuar."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{usingPin ? "PIN de acesso" : "Senha atual"}</Label>
            {usingPin ? (
              <InputOTP
                maxLength={6}
                value={form.currentPassword}
                onChange={(value) => setForm({ ...form, currentPassword: value.replace(/\D/g, "").slice(0, 6) })}
                disabled={mutation.isPending}
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
            ) : (
              <Input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                placeholder="Digite sua senha atual"
                autoFocus
                disabled={mutation.isPending}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Nova senha</Label>
            <Input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Minimo 6 caracteres"
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>Confirmar nova senha</Label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Repita a nova senha"
              disabled={mutation.isPending}
            />
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Alterando..." : "Alterar senha"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => logout()}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Sair e entrar com outro usuario
          </button>
        </div>
      </div>
    </div>
  );
}
