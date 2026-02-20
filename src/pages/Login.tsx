import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BrandLogo from "@/components/BrandLogo";
import { Button, Checkbox, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("tpl_remember_me") === "true");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [identity, setIdentity] = useState("admin@unique.local");
  const [password, setPassword] = useState("admin123");

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    localStorage.setItem("tpl_remember_me", String(rememberMe));
    const result = await login(identity, password, rememberMe);

    setLoading(false);
    if (result.success) {
      navigate("/dashboard", { replace: true });
      return;
    }

    setError(result.error || "Falha ao autenticar.");
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    localStorage.setItem("tpl_remember_me", String(rememberMe));
    const result = await register({
      name,
      cpf,
      email,
      phone,
      password: registerPassword,
      rememberMe,
    });

    setLoading(false);
    if (result.success) {
      navigate("/dashboard", { replace: true });
      return;
    }

    setError(result.error || "Falha ao cadastrar.");
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background sm:bg-transparent">
      <div className="absolute inset-0 z-0 hidden sm:block">
        <img
          src="/background-template.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full scale-[1.2] object-cover blur-[10px]"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/35 via-primary/10 to-primary-dark/45" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-8 sm:px-4 sm:py-10">
        <div className="mx-auto w-full max-w-[460px]">
          <div className="w-full p-0 sm:rounded-2xl sm:border sm:border-border sm:bg-card sm:p-6 sm:shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-4 mt-3 flex items-center justify-center">
                <BrandLogo className="h-20 w-auto max-w-[400px]" fallbackClassName="h-20 w-20" />
              </div>
              <p className="mb-0 typo-section-title text-primary dark:text-white">Lavanderia Unique</p>
              <p className="typo-caption">Controle de uso da lavanderia condominial</p>
            </div>

            <div className="mt-3 p-0 sm:rounded-xl sm:bg-card sm:p-6">
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Cadastrar</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="identity" className="typo-label text-foreground">E-mail ou CPF</Label>
                      <Input
                        id="identity"
                        value={identity}
                        onChange={(e) => setIdentity(e.target.value)}
                        required
                        className="h-9"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password" className="typo-label text-foreground">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-9"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(Boolean(checked))} />
                      <Label htmlFor="remember-me" className="cursor-pointer typo-caption text-foreground">Lembrar de mim</Label>
                    </div>

                    {error ? <div className="state-danger-soft rounded-md border p-3 typo-body font-medium">{error}</div> : null}

                    <Button type="submit" className="h-11 w-full" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {loading ? "Processando..." : "Entrar"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-4">
                  <form onSubmit={handleRegister} className="space-y-3">
                    <div>
                      <Label htmlFor="name" className="typo-label text-foreground">Nome completo</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="h-9" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="cpf" className="typo-label text-foreground">CPF</Label>
                        <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} required className="h-9" />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="typo-label text-foreground">Telefone</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="typo-label text-foreground">E-mail</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-9" />
                    </div>
                    <div>
                      <Label htmlFor="registerPassword" className="typo-label text-foreground">Senha</Label>
                      <Input
                        id="registerPassword"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        className="h-9"
                      />
                    </div>

                    {error ? <div className="state-danger-soft rounded-md border p-3 typo-body font-medium">{error}</div> : null}

                    <Button type="submit" className="h-11 w-full" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {loading ? "Processando..." : "Criar conta"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
