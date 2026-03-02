import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import type { MachinePairPayload } from "@/services/api";

type MachinePairListCardProps = {
  pairs: MachinePairPayload[];
};

export default function MachinePairListCard({ pairs }: MachinePairListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pares Cadastrados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pairs.map((pair) => (
          <div key={pair.id} className="rounded-md border p-3">
            <p className="typo-label text-primary">{pair.name}</p>
            <p className="typo-caption text-muted-foreground">
              {pair.washerMachineName} + {pair.dryerMachineName}
            </p>
          </div>
        ))}
        {pairs.length === 0 ? <p className="typo-caption text-muted-foreground">Nenhum par cadastrado.</p> : null}
      </CardContent>
    </Card>
  );
}
