import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/primitives";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-muted text-foreground">
      <section className="flex min-h-[52vh] items-end justify-center bg-background px-6 pb-0">
        <h1 className="select-none text-[clamp(8rem,22vw,14rem)] font-extrabold leading-none tracking-tight text-foreground/15">
          404
        </h1>
      </section>

      <section className="flex min-h-[48vh] items-start justify-center bg-muted px-6 py-12">
        <div className="w-full max-w-2xl text-center">
          <h2 className="text-4xl font-medium tracking-tight text-foreground/70 md:text-6xl">
            Desculpe, pagina nao encontrada
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-xl">
            A pagina solicitada nao pode ser encontrada.
          </p>
          <Button className="mt-10" onClick={() => navigate("/", { replace: true })}>
            Voltar para o inicio
          </Button>
        </div>
      </section>
    </main>
  );
}
