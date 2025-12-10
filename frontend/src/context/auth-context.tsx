

"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: "MAESTRO" | "CONTROL_ESCOLAR";
  matricula?: string | null;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface AuthContextProps {
  user: User | null;
  tokens: AuthTokens | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Cargar tokens del localStorage al inicializar
  useEffect(() => {
    const savedTokens = localStorage.getItem('authTokens');
    const savedUser = localStorage.getItem('authUser');
    
    if (savedTokens && savedUser) {
      try {
        const parsedTokens = JSON.parse(savedTokens);
        const parsedUser = JSON.parse(savedUser);
        
        setTokens(parsedTokens);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error al cargar tokens del localStorage:', error);
        localStorage.removeItem('authTokens');
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  // Función para refrescar el usuario desde el backend
  const refreshUser = async () => {
    try {
      if (!tokens?.accessToken) {
        throw new Error('No hay token de acceso');
      }

      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Token expirado o inválido');
      }

      const data = await res.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('authUser', JSON.stringify(data.user));
      }
    } catch (err) {
      console.warn("Error al refrescar usuario:", err);
      // Si falla el refresh, intentar con refresh token
      await refreshAccessToken();
    }
  };

  // Función para renovar access token usando refresh token
  const refreshAccessToken = async () => {
    try {
      if (!tokens?.refreshToken) {
        throw new Error('No hay refresh token');
      }

      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken })
      });

      if (!res.ok) {
        throw new Error('Refresh token inválido');
      }

      const data = await res.json();
      
      if (data.success && data.accessToken) {
        const newTokens = {
          ...tokens,
          accessToken: data.accessToken
        };
        
        setTokens(newTokens);
        localStorage.setItem('authTokens', JSON.stringify(newTokens));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error al renovar token:', error);
      // Si falla el refresh, hacer logout
      logout();
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || "Error de autenticación" };
      }

      if (!data.success || !data.user || !data.tokens) {
        return { success: false, error: "Respuesta inválida del servidor" };
      }

      if (!["MAESTRO", "CONTROL_ESCOLAR"].includes(data.user.rol)) {
        return { success: false, error: "Rol no permitido para login" };
      }

      // Guardar tokens y usuario
      setUser(data.user);
      setTokens(data.tokens);
      
      // Persistir en localStorage
      localStorage.setItem('authUser', JSON.stringify(data.user));
      localStorage.setItem('authTokens', JSON.stringify(data.tokens));

      return { success: true };
    } catch (err) {
      console.error("Error en login:", err);
      return { success: false, error: "Error de conexión con el backend" };
    }
  };

  const logout = useCallback(() => {
    console.log("Cerrando sesión...");
    
    // Limpiar estado
    setUser(null);
    setTokens(null);
    
    // Limpiar localStorage
    localStorage.removeItem('authUser');
    localStorage.removeItem('authTokens');
    
    // Opcional: llamar endpoint de logout
    if (tokens?.accessToken) {
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      }).catch(error => {
        console.warn('Error en logout del servidor:', error);
      });
    }
  }, [tokens?.accessToken, API_URL]);

  // Manejar errores globales no capturados
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn("Promise rechazada no manejada:", event.reason);
      // No interferir con la sesión por errores no relacionados con autenticación
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const isAuthenticated = !!(user && tokens?.accessToken);

  return (
    <AuthContext.Provider value={{ 
      user, 
      tokens, 
      login, 
      logout, 
      refreshUser, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
