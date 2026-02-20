import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AppBar from "@/components/dashboard/AppBar";

const logoutMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: "ADMIN", logout: logoutMock }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<object>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("AppBar", () => {
  beforeEach(() => {
    logoutMock.mockResolvedValue(undefined);
    logoutMock.mockClear();
    navigateMock.mockClear();
  });

  it("renders user and triggers logout navigation", async () => {
    render(<AppBar />);

    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Sair/i }));

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
    });
  });
});
