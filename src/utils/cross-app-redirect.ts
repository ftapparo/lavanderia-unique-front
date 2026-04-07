import { APP_MOBILE_URL } from "@/config/app-config";
import { isMobileDevice } from "@/utils/device";

type LocationLike = Pick<Location, "origin" | "href" | "replace">;

const getRootUrl = (urlValue: string): string | null => {
  try {
    return new URL("/", urlValue).toString();
  } catch {
    return null;
  }
};

export const redirectToMobileAppIfNeeded = (locationRef?: LocationLike): boolean => {
  if (typeof window === "undefined" && !locationRef) {
    return false;
  }

  const currentLocation = locationRef || window.location;

  if (!isMobileDevice()) {
    return false;
  }

  const targetUrl = getRootUrl(APP_MOBILE_URL);
  if (!targetUrl) {
    return false;
  }

  const targetOrigin = new URL(targetUrl).origin;
  if (targetOrigin === currentLocation.origin && currentLocation.href === targetUrl) {
    return false;
  }

  currentLocation.replace(targetUrl);
  return true;
};
