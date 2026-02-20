/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_SHORT_NAME?: string;
  readonly VITE_APP_DESCRIPTION?: string;
  readonly VITE_THEME_STORAGE_KEY?: string;
  readonly VITE_AUTH_STORAGE_PREFIX?: string;
  readonly VITE_DEFAULT_USERNAME?: string;
  readonly VITE_DEFAULT_PASSWORD?: string;
  readonly VITE_LOGO_LIGHT?: string;
  readonly VITE_LOGO_DARK?: string;
  readonly VITE_LOGIN_BG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
