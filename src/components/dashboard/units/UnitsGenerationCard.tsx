import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui/primitives";

type UnitsGenerationCardProps = {
  startFloor: string;
  endFloor: string;
  unitsPerFloor: string;
  isSubmitting: boolean;
  onStartFloorChange: (value: string) => void;
  onEndFloorChange: (value: string) => void;
  onUnitsPerFloorChange: (value: string) => void;
  onGenerate: () => void;
};

export default function UnitsGenerationCard({
  startFloor,
  endFloor,
  unitsPerFloor,
  isSubmitting,
  onStartFloorChange,
  onEndFloorChange,
  onUnitsPerFloorChange,
  onGenerate,
}: UnitsGenerationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parametros de Geracao</CardTitle>
        <CardDescription>Informe primeiro andar, ultimo andar e quantidade de unidades por andar.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="start-floor">Primeiro andar</Label>
          <Input id="start-floor" value={startFloor} onChange={(e) => onStartFloorChange(e.target.value)} inputMode="numeric" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-floor">Ultimo andar</Label>
          <Input id="end-floor" value={endFloor} onChange={(e) => onEndFloorChange(e.target.value)} inputMode="numeric" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="units-per-floor">Unidades por andar</Label>
          <Input id="units-per-floor" value={unitsPerFloor} onChange={(e) => onUnitsPerFloorChange(e.target.value)} inputMode="numeric" />
        </div>
        <Button disabled={isSubmitting} onClick={onGenerate}>
          {isSubmitting ? "Gerando..." : "Gerar unidades"}
        </Button>
      </CardContent>
    </Card>
  );
}
