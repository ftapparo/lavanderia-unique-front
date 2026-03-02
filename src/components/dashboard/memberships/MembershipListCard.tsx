import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import type { MembershipPayload } from "@/services/api";

type MembershipListCardProps = {
  memberships: MembershipPayload[];
  userNameById: (id: string) => string;
  onToggleActive: (membership: MembershipPayload) => void;
};

export default function MembershipListCard({ memberships, userNameById, onToggleActive }: MembershipListCardProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Vinculos Cadastrados</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {memberships.map((membership) => (
          <div key={membership.id} className="rounded-md border p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="typo-label text-primary">{membership.unitCode} - {membership.profile}</p>
                <p className="typo-caption text-muted-foreground">
                  Usuario: {userNameById(membership.userId)} | Vigencia: {membership.startDate} ate {membership.endDate || "indeterminado"}
                </p>
              </div>
              <Button
                size="sm"
                variant={membership.active ? "destructive" : "outline"}
                onClick={() => onToggleActive(membership)}
              >
                {membership.active ? "Desativar" : "Ativar"}
              </Button>
            </div>
          </div>
        ))}
        {memberships.length === 0 ? <p className="typo-caption text-muted-foreground">Nenhum vinculo cadastrado.</p> : null}
      </CardContent>
    </Card>
  );
}
