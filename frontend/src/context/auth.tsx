"use client";

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";

interface User {
  id: number;
  username: string;
  createdAt: string;
  dbType: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loadingUser: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loadingUser: true,
  login: async () => {},
  logout: () => {},
});

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9080";

  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token invalid or expired
        logout();
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
      logout();
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedToken = window.localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    } else {
      setLoadingUser(false);
    }
  }, []);

  const login = async (newToken: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("token", newToken);
    }
    setToken(newToken);
    setLoadingUser(true);
    await fetchProfile(newToken);
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
    }
    setToken(null);
    setUser(null);
    setLoadingUser(false);
  };

  return (
    <AuthContext.Provider value={{ token, user, loadingUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
