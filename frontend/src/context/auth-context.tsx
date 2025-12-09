"use client"

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: "MAESTRO" | "CONTROL_ESCOLAR";
  matricula?: string | null;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const API_URL = import.meta.env.VITE_API_URL; // <-- Variable de entorno Docker

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {  // <- Usa la URL completa
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) return { success: false, error: data.message };

      if (!["MAESTRO", "CONTROL_ESCOLAR"].includes(data.rol)) {
        return { success: false, error: "Rol no permitido para login" };
      }

      setUser(data);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Error de conexión con el backend" };
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
