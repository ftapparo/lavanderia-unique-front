const MOBILE_USER_AGENT_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const isMobileViewport = typeof window.matchMedia === "function"
    ? window.matchMedia("(max-width: 767px)").matches
    : window.innerWidth <= 767;
  const isMobileUserAgent = MOBILE_USER_AGENT_REGEX.test(navigator.userAgent || "");

  return isMobileViewport || isMobileUserAgent;
};

