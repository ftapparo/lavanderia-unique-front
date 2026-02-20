import { describe, expect, it, vi, beforeEach } from "vitest";

const loadModule = async () => {
  vi.resetModules();
  return await import("@/config/app-config");
};

describe("app-config", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses fallback defaults when env is empty", async () => {
    const config = await loadModule();

    expect(config.APP_NAME).toBe("Template Front");
    expect(config.APP_SHORT_NAME).toBe("Template");
    expect(config.APP_API_BASE_URL.length).toBeGreaterThan(0);
    expect(config.AUTH_STORAGE_KEYS.auth).toContain("_auth");
  });

  it("reads custom values from env", async () => {
    vi.stubEnv("VITE_APP_NAME", "Meu App");
    vi.stubEnv("VITE_AUTH_STORAGE_PREFIX", "tpl");

    const config = await loadModule();

    expect(config.APP_NAME).toBe("Meu App");
    expect(config.AUTH_STORAGE_KEYS.user).toBe("tpl_user");
  });
});
