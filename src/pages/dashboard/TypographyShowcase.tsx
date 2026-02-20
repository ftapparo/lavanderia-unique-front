import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/primitives";

const textStyles = [
  { name: "typo-page-title", sample: "Titulo de Pagina", use: "Headlines principais da tela" },
  { name: "typo-page-subtitle", sample: "Subtitulo de pagina para contexto", use: "Texto de apoio do header" },
  { name: "typo-section-title", sample: "Titulo de Secao", use: "Cabecalhos internos de blocos" },
  { name: "typo-card-title", sample: "Titulo de Card", use: "Titulos padrao de componentes" },
  { name: "typo-card-subtitle", sample: "Descricao curta de card", use: "Descricao secundaria em cards" },
  { name: "typo-body", sample: "Texto base para conteudo e descricao.", use: "Paragrafos e textos comuns" },
  { name: "typo-caption", sample: "Legenda e metadado", use: "Metadados e explicacoes pequenas" },
  { name: "typo-label", sample: "Label de campo", use: "Rotulos de formulario e chaves" },
  { name: "typo-stat-value", sample: "12.480", use: "Indicadores numericos e KPIs" },
];

const weightSamples = [
  { weight: 300, label: "Light 300" },
  { weight: 400, label: "Regular 400" },
  { weight: 500, label: "Medium 500" },
  { weight: 600, label: "Semibold 600" },
  { weight: 700, label: "Bold 700" },
  { weight: 800, label: "Extrabold 800" },
];

const trackingSamples = [
  { className: "tracking-tight", label: "tracking-tight", value: "-0.025em" },
  { className: "tracking-normal", label: "tracking-normal", value: "0" },
  { className: "tracking-wide", label: "tracking-wide", value: "0.025em" },
];

export default function TypographyShowcase() {
  return (
    <PageContainer>
      <PageHeader
        title="Tipografia"
        description="Catalogo de fontes e variacoes do template (familia, pesos, espacamento e estilos utilitarios)."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Familias de Fonte</CardTitle>
            <CardDescription>Fontes registradas e usadas no projeto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-card p-4">
              <p className="typo-label text-muted-foreground">Sans (Geist)</p>
              <p className="text-2xl font-semibold">
                The quick brown fox jumps over the lazy dog 1234567890
              </p>
            </div>
            <div className="rounded-md border bg-card p-4">
              <p className="typo-label text-muted-foreground">Mono (Geist Mono)</p>
              <p className="font-mono text-lg">
                const apiVersion = &quot;v1&quot;; // 200 OK - template
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pesos Disponiveis</CardTitle>
            <CardDescription>Escala principal para hierarquia visual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {weightSamples.map((item) => (
              <div key={item.weight} className="rounded-md border bg-card px-3 py-2">
                <p style={{ fontWeight: item.weight }}>
                  {item.label} - Modelo de texto para testes de leitura e contraste
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estilos Tipograficos do Template</CardTitle>
          <CardDescription>Classes utilitarias prontas para uso nas telas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Classe</TableHead>
                <TableHead>Exemplo</TableHead>
                <TableHead>Uso recomendado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {textStyles.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-mono text-xs">{item.name}</TableCell>
                  <TableCell>
                    <p className={item.name}>{item.sample}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.use}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Espacamento entre Letras</CardTitle>
            <CardDescription>Opcoes comuns de tracking para ajustes finos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {trackingSamples.map((item) => (
              <div key={item.label} className="rounded-md border bg-card px-3 py-2">
                <p className="typo-label text-muted-foreground">{item.label} ({item.value})</p>
                <p className={item.className}>Template UI typography sample</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Altura de Linha</CardTitle>
            <CardDescription>Comparativo para leitura em blocos de texto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border bg-card px-3 py-2">
              <p className="typo-label text-muted-foreground">leading-tight</p>
              <p className="leading-tight">
                Linha mais compacta para titulos curtos e blocos pequenos de destaque.
              </p>
            </div>
            <div className="rounded-md border bg-card px-3 py-2">
              <p className="typo-label text-muted-foreground">leading-normal</p>
              <p className="leading-normal">
                Linha equilibrada para uso geral no dia a dia do dashboard.
              </p>
            </div>
            <div className="rounded-md border bg-card px-3 py-2">
              <p className="typo-label text-muted-foreground">leading-relaxed</p>
              <p className="leading-relaxed">
                Linha mais aberta para textos longos e instrucoes mais densas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
