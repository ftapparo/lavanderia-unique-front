import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = "tpl_auth";
const USER_KEY = "tpl_user";

const getStoredAuthState = () => {
  const localAuth = localStorage.getItem(AUTH_KEY) === "true";
  const localUser = localStorage.getItem(USER_KEY);
  if (localAuth && localUser) {
    return { isAuthenticated: true, user: localUser };
  }

  const sessionAuth = sessionStorage.getItem(AUTH_KEY) === "true";
  const sessionUser = sessionStorage.getItem(USER_KEY);
  if (sessionAuth && sessionUser) {
    return { isAuthenticated: true, user: sessionUser };
  }

  return { isAuthenticated: false, user: null as string | null };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => getStoredAuthState().isAuthenticated);
  const [user, setUser] = useState<string | null>(() => getStoredAuthState().user);

  const login = useCallback(async (username: string, password: string, rememberMe = false) => {
    const normalizedUser = username.trim().toUpperCase();
    const normalizedPassword = password.trim();

    if (!normalizedUser || !normalizedPassword) {
      return { success: false, error: "Informe usuario e senha." };
    }

    setIsAuthenticated(true);
    setUser(normalizedUser);

    const targetStorage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    targetStorage.setItem(AUTH_KEY, "true");
    targetStorage.setItem(USER_KEY, normalizedUser);
    otherStorage.removeItem(AUTH_KEY);
    otherStorage.removeItem(USER_KEY);

    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
