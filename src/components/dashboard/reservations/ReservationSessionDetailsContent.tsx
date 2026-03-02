import type { LaundrySessionDetailsPayload } from "@/services/api";

type ReservationSessionDetailsContentProps = {
  session: LaundrySessionDetailsPayload;
  formatDateTime: (value: string) => string;
};

export default function ReservationSessionDetailsContent({ session, formatDateTime }: ReservationSessionDetailsContentProps) {
  return (
    <div className="space-y-2 typo-caption">
      <p><strong>Par de maquinas:</strong> {session.machinePairName}</p>
      <p><strong>Morador:</strong> {session.userName}</p>
      <p><strong>Apartamento:</strong> {session.unitName}</p>
      <p><strong>Status da sessao:</strong> {session.status}</p>
      <p><strong>Check-in:</strong> {formatDateTime(session.checkinAt)}</p>

      <div className="space-y-2 rounded-md border p-2">
        {session.devices.map((device) => (
          <div key={device.deviceId} className="rounded border p-2">
            <p><strong>{device.machineType === "WASHER" ? "Lavadora" : "Secadora"}:</strong> {device.machineName}</p>
            <p><strong>Energia:</strong> {device.isOn ? "Ligada" : "Desligada"}</p>
            <p><strong>Potencia:</strong> {device.powerWatts} W</p>
            <p><strong>Consumo:</strong> {device.energyKwh} kWh</p>
          </div>
        ))}
      </div>
    </div>
  );
}
