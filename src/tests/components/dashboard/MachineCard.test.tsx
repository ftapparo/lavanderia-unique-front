import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MachineCard from "@/components/dashboard/machines/MachineCard";
import type { MachinePayload } from "@/services/api";

const machine: MachinePayload = {
  id: "9f5a37f6-0c17-49f5-8be7-1174cbf2f63f",
  number: 12,
  brand: "LG",
  model: "Turbo",
  name: "Lavadora 12",
  type: "WASHER",
  tuyaDeviceId: "tuya-123",
  active: true,
};

describe("MachineCard", () => {
  it("renders qr code with machine payload and handles actions", () => {
    const onEdit = vi.fn();
    const onToggleActive = vi.fn();
    const onRemove = vi.fn();

    render(
      <MachineCard
        machine={machine}
        onEdit={onEdit}
        onToggleActive={onToggleActive}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText("QR Code da maquina")).toBeInTheDocument();
    expect(screen.getByText(`machine:${machine.id}`)).toBeInTheDocument();

    const qrImage = screen.getByRole("img", { name: `QR Code da maquina ${machine.number}` });
    expect(qrImage).toHaveAttribute("src", expect.stringContaining(encodeURIComponent(`machine:${machine.id}`)));

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Inativar" }));
    fireEvent.click(screen.getByRole("button", { name: "Remover" }));

    expect(onEdit).toHaveBeenCalledWith(machine);
    expect(onToggleActive).toHaveBeenCalledWith(machine);
    expect(onRemove).toHaveBeenCalledWith(machine);
  });
});
