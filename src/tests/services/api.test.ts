import { beforeEach, describe, expect, it, vi } from "vitest";
import * as axiosModule from "axios";
import { api } from "@/services/api";

vi.mock("axios", () => {
  const request = vi.fn();
  const requestUse = vi.fn();

  return {
    default: {
      create: vi.fn(() => ({ request, interceptors: { request: { use: requestUse } } })),
      isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
    },
    create: vi.fn(() => ({ request, interceptors: { request: { use: requestUse } } })),
    isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
    __request: request,
    __requestUse: requestUse,
  };
});

describe("api service", () => {
  const getRequestMock = () => (axiosModule as unknown as { __request: ReturnType<typeof vi.fn> }).__request;

  beforeEach(() => {
    getRequestMock().mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("returns health payload from response.data.data", async () => {
    const payload = { status: "API Funcionando!", environment: "development" };

    getRequestMock().mockResolvedValue({
      data: {
        data: payload,
        message: null,
        errors: null,
      },
    });

    await expect(api.health()).resolves.toEqual(payload);
  });

  it("calls healthcheck endpoint", async () => {
    const payload = { status: "ok", environment: "test" };

    getRequestMock().mockResolvedValue({ data: { data: payload, message: null, errors: null } });

    await expect(api.healthcheck()).resolves.toEqual(payload);

    expect(getRequestMock()).toHaveBeenCalledWith(expect.objectContaining({ method: "GET", url: "/healthcheck" }));
  });

  it("maps axios error fallback when payload is string", async () => {
    getRequestMock().mockRejectedValue({
      isAxiosError: true,
      message: "Bad Gateway",
      response: {
        status: 502,
        data: "Falha geral",
      },
    });

    await expect(api.health()).rejects.toMatchObject({
      message: "Falha geral",
      status: 502,
    });
  });

  it("maps axios http error with status and payload", async () => {
    getRequestMock().mockRejectedValue({
      isAxiosError: true,
      message: "Bad Gateway",
      response: {
        status: 502,
        data: { message: "Falha no gateway" },
      },
    });

    await expect(api.health()).rejects.toMatchObject({
      message: "Falha no gateway",
      status: 502,
      payload: { message: "Falha no gateway" },
    });
  });

  it("maps non-axios error into ApiError", async () => {
    getRequestMock().mockRejectedValue(new Error("boom"));

    await expect(api.health()).rejects.toMatchObject({
      message: "boom",
    });
  });
});
