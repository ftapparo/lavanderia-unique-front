const readEnv = (value: string | undefined, fallback: string): string => {
  const normalized = (value || "").trim();
  return normalized || fallback;
};

export const APP_NAME = readEnv(import.meta.env.VITE_APP_NAME, "Template Front");
export const APP_SHORT_NAME = readEnv(import.meta.env.VITE_APP_SHORT_NAME, "Template");
export const APP_DESCRIPTION = readEnv(import.meta.env.VITE_APP_DESCRIPTION, "Template administrativo");
export const APP_THEME_STORAGE_KEY = readEnv(import.meta.env.VITE_THEME_STORAGE_KEY, "template-theme");
export const APP_AUTH_STORAGE_PREFIX = readEnv(import.meta.env.VITE_AUTH_STORAGE_PREFIX, "template_auth");
export const APP_DEFAULT_USERNAME = readEnv(import.meta.env.VITE_DEFAULT_USERNAME, "admin");
export const APP_DEFAULT_PASSWORD = readEnv(import.meta.env.VITE_DEFAULT_PASSWORD, "admin123");
export const APP_LOGO_LIGHT = readEnv(import.meta.env.VITE_LOGO_LIGHT, "/logo-template.png");
export const APP_LOGO_DARK = readEnv(import.meta.env.VITE_LOGO_DARK, "/logo-template-white.png");
export const APP_LOGIN_BACKGROUND = readEnv(import.meta.env.VITE_LOGIN_BG, "/background-template.png");
export const APP_API_BASE_URL = readEnv(import.meta.env.VITE_API_BASE_URL, "http://localhost:3000/v1/api");

export const AUTH_STORAGE_KEYS = {
  auth: `${APP_AUTH_STORAGE_PREFIX}_auth`,
  user: `${APP_AUTH_STORAGE_PREFIX}_user`,
  rememberMe: `${APP_AUTH_STORAGE_PREFIX}_remember_me`,
} as const;
