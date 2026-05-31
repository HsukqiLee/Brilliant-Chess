"use client";

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { apiUrl, getApiBaseUrl } from "@/lib/api";

interface User {
  id: number;
  username: string;
  createdAt: string;
  dbType: string;
}

interface AuthContextType {
  user: User | null;
  loadingUser: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loadingUser: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const apiBaseUrl = getApiBaseUrl();

  const clearSession = () => {
    setUser(null);
    setLoadingUser(false);
  };

  const fetchProfile = async () => {
    if (!apiBaseUrl) {
      clearSession();
      return;
    }

    try {
      const res = await fetch(apiUrl("/auth/me"), {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        clearSession();
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
      clearSession();
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    void fetchProfile();
  }, []);

  const login = async () => {
    setLoadingUser(true);
    await fetchProfile();
  };

  const logout = async () => {
    if (apiBaseUrl) {
      try {
        await fetch(apiUrl("/auth/logout"), {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Failed to clear session", err);
      }
    }
    clearSession();
  };

  return <AuthContext.Provider value={{ user, loadingUser, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
