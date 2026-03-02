import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import type { UnitPayload, UserListItemPayload } from "@/services/api";

type MembershipCreateCardProps = {
  userId: string;
  unitId: string;
  profile: string;
  startDate: string;
  endDate: string;
  users: UserListItemPayload[];
  units: UnitPayload[];
  isSubmitting: boolean;
  onUserIdChange: (value: string) => void;
  onUnitIdChange: (value: string) => void;
  onProfileChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSubmit: () => void;
};

export default function MembershipCreateCard({
  userId,
  unitId,
  profile,
  startDate,
  endDate,
  users,
  units,
  isSubmitting,
  onUserIdChange,
  onUnitIdChange,
  onProfileChange,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
}: MembershipCreateCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Vinculo</CardTitle>
        <CardDescription>Crie vinculos entre usuario e unidade.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Usuario</Label>
          <Select value={userId} onValueChange={onUserIdChange}>
            <SelectTrigger><SelectValue placeholder="Selecione um usuario" /></SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>{user.name} ({user.email})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Unidade</Label>
          <Select value={unitId} onValueChange={onUnitIdChange}>
            <SelectTrigger><SelectValue placeholder="Selecione uma unidade" /></SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>{unit.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Perfil</Label>
          <Input value={profile} onChange={(e) => onProfileChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Data de inicio</Label>
          <Input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Data final (opcional)</Label>
          <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button onClick={onSubmit} disabled={isSubmitting}>Criar Vinculo</Button>
        </div>
      </CardContent>
    </Card>
  );
}
