"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AuthService from "@/services/auth.service";
import { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function refresh() {
    try {
      const data = await AuthService.me();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(
    email: string,
    password: string
  ) {
    await AuthService.login({
      email,
      password,
    });

    await refresh();
  }

  function logout() {
    AuthService.logout();
  }

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      refresh();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}