import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirectToMobileAppIfNeeded } from "@/utils/cross-app-redirect";
import { isMobileDevice } from "@/utils/device";

vi.mock("@/config/app-config", () => ({
  APP_MOBILE_URL: "http://localhost/mobile",
}));

vi.mock("@/utils/device", () => ({
  isMobileDevice: vi.fn(),
}));

describe("redirectToMobileAppIfNeeded", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to APP on mobile devices", () => {
    vi.mocked(isMobileDevice).mockReturnValue(true);
    const replaceMock = vi.fn();
    const locationMock = {
      origin: "http://localhost",
      href: "http://localhost/dashboard",
      replace: replaceMock,
    };

    const redirected = redirectToMobileAppIfNeeded(locationMock);

    expect(redirected).toBe(true);
    expect(replaceMock).toHaveBeenCalledWith("http://localhost/");
  });

  it("does not redirect on desktop devices", () => {
    vi.mocked(isMobileDevice).mockReturnValue(false);
    const replaceMock = vi.fn();
    const locationMock = {
      origin: "http://localhost",
      href: "http://localhost/dashboard",
      replace: replaceMock,
    };

    const redirected = redirectToMobileAppIfNeeded(locationMock);

    expect(redirected).toBe(false);
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
