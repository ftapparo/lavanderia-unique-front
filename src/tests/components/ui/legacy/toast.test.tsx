import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from "@/components/ui/toast";

describe("legacy toast primitives", () => {
  it("renders toast structure", () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Titulo</ToastTitle>
          <ToastDescription>Descricao</ToastDescription>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    expect(screen.getByText("Titulo")).toBeInTheDocument();
    expect(screen.getByText("Descricao")).toBeInTheDocument();
  });
});
