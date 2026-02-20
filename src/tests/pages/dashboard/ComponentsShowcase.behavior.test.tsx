import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ComponentsShowcase from "@/pages/dashboard/ComponentsShowcase";

describe("ComponentsShowcase behaviors", () => {
  it("adds and removes tags from keyboard/blur actions", async () => {
    render(<ComponentsShowcase />);

    const input = screen.getByPlaceholderText("Add tag...");

    fireEvent.change(input, { target: { value: "Node" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("Node")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remover tag Node" }));
    await waitFor(() => {
      expect(screen.queryByText("Node")).not.toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: "Vitest" } });
    fireEvent.blur(input);

    expect(screen.getByText("Vitest")).toBeInTheDocument();
  });
});
