import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { api, setApiAuthToken, type ApiUser } from "@/services/api";
import { AUTH_STORAGE_KEYS } from "@/config/app-config";

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  profile: ApiUser | null;
  accessToken: string | null;
  login: (identity: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (input: { name: string; cpf: string; email: string; phone?: string; password: string; rememberMe?: boolean }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ACCESS_TOKEN_KEY = AUTH_STORAGE_KEYS.auth;
const USER_KEY = AUTH_STORAGE_KEYS.user;
const REFRESH_TOKEN_KEY = `${AUTH_STORAGE_KEYS.auth}_refresh`;

const loadAuthSnapshot = () => {
  const localToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const localUser = localStorage.getItem(USER_KEY);
  const localRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (localToken && localUser) {
    return { token: localToken, user: localUser, refreshToken: localRefreshToken, persistent: true };
  }

  const sessionToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  const sessionUser = sessionStorage.getItem(USER_KEY);
  const sessionRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  if (sessionToken && sessionUser) {
    return { token: sessionToken, user: sessionUser, refreshToken: sessionRefreshToken, persistent: false };
  }

  return { token: null, user: null, refreshToken: null, persistent: false };
};

const clearStorages = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadAuthSnapshot();

  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initial.token));
  const [user, setUser] = useState<string | null>(initial.user);
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(initial.token);

  useEffect(() => {
    setApiAuthToken(accessToken);
  }, [accessToken]);

  const persist = (token: string, refreshToken: string, userName: string, rememberMe: boolean) => {
    const targetStorage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    targetStorage.setItem(ACCESS_TOKEN_KEY, token);
    targetStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    targetStorage.setItem(USER_KEY, userName);

    otherStorage.removeItem(ACCESS_TOKEN_KEY);
    otherStorage.removeItem(REFRESH_TOKEN_KEY);
    otherStorage.removeItem(USER_KEY);
  };

  const login = useCallback(async (identity: string, password: string, rememberMe = false) => {
    if (!identity.trim() || !password.trim()) {
      return { success: false, error: "Informe identificacao e senha." };
    }

    try {
      const payload = await api.auth.login({
        identity: identity.trim(),
        password: password.trim(),
      });

      persist(payload.accessToken, payload.refreshToken, payload.user.name, rememberMe);
      setAccessToken(payload.accessToken);
      setIsAuthenticated(true);
      setUser(payload.user.name);
      setProfile(payload.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Falha no login." };
    }
  }, []);

  const register = useCallback(async (input: { name: string; cpf: string; email: string; phone?: string; password: string; rememberMe?: boolean }) => {
    try {
      const payload = await api.auth.register({
        name: input.name,
        cpf: input.cpf,
        email: input.email,
        phone: input.phone,
        password: input.password,
      });

      persist(payload.accessToken, payload.refreshToken, payload.user.name, Boolean(input.rememberMe));
      setAccessToken(payload.accessToken);
      setIsAuthenticated(true);
      setUser(payload.user.name);
      setProfile(payload.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Falha no cadastro." };
    }
  }, []);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setUser(null);
    setProfile(null);
    setAccessToken(null);
    clearStorages();
  }, []);

  useEffect(() => {
    const syncProfile = async () => {
      if (!accessToken) {
        return;
      }

      try {
        const me = await api.auth.me();
        setProfile(me);
        setUser(me.name);
      } catch {
        await logout();
      }
    };

    void syncProfile();
  }, [accessToken, logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, profile, accessToken, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
