import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import api from "@/api/axios";
import { AuthContext } from "@/context/auth";
import type { AuthResponse, RegisterPayload, User } from "@/types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    api
      .get<User>("/user")
      .then((response) => {
        if (isActive) {
          setUser(response.data);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        if (isActive) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/login", { email, password });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>("/register", payload);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
