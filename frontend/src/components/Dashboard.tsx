"use client"

import { useState, useEffect } from "react";
import { LogOut, Users, BookOpen, BarChart3, Settings } from "lucide-react";
import api from "../axios";
import ManageUsers from "./ManageUsers";
import StudentReports from "./students-reports";
import ConfigureCourses from "./configure-courses";

interface DashboardProps {
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    token?: string;
  };
  onLogout?: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<"home" | "users" | "reports" | "courses" | "requests">("home");
  const [alumnosCount, setAlumnosCount] = useState(0);
  const [maestrosCount, setMaestrosCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [promedioGeneral, setPromedioGeneral] = useState<number | null>(null);
  // Función para obtener el promedio general de calificaciones
  const fetchPromedioGeneral = async () => {
    try {
      const response = await api.get("/calificaciones/promedio-general");
      setPromedioGeneral(response.data.promedio);
    } catch (error) {
      console.error("Error al obtener el promedio general:", error);
      setPromedioGeneral(null);
    }
  };

  // Función para actualizar conteo de alumnos
  const fetchAlumnosCount = async () => {
    try {
      const response = await api.get("/alumnos/count");
      setAlumnosCount(response.data.count);
    } catch (error) {
      console.error("Error al obtener el conteo de alumnos:", error);
    }
  };

  // Función para actualizar conteo de maestros
  const fetchMaestrosCount = async () => {
    try {
      const response = await api.get("/maestros/count");
      setMaestrosCount(response.data.count);
    } catch (error) {
      console.error("Error al obtener el conteo de maestros:", error);
    }
  };

  // Función para actualizar conteo de solicitudes pendientes
  const fetchPendingRequestsCount = async () => {
    try {
      const response = await api.get("/solicitudes-registro-maestro/count");
      setPendingRequestsCount(response.data.count);
    } catch (error) {
      console.error("Error al obtener el conteo de solicitudes pendientes:", error);
    }
  };

  useEffect(() => {
    if (currentView === "home") {
      fetchAlumnosCount();
      fetchMaestrosCount();
      fetchPendingRequestsCount();
      fetchPromedioGeneral();
    }
  }, [currentView]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Control Escolar</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {currentView === "home" && (
          <>
            {/* Welcome Section */}
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-2">
                Bienvenido,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {user.nombre}
                </span>
              </h2>
              <p className="text-muted-foreground text-lg">{user.email}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Alumnos */}
              <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Estudiantes</h3>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-foreground">{alumnosCount}</p>
                <p className="text-xs text-muted-foreground mt-2">En el sistema</p>
              </div>

              {/* Maestros */}
              <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Maestros</h3>
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-3xl font-bold text-foreground">{maestrosCount}</p>
                <p className="text-xs text-muted-foreground mt-2">En el sistema</p>
              </div>

              {/* Calificaciones */}
              <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Calificaciones</h3>
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {promedioGeneral !== null ? promedioGeneral.toFixed(2) : "-"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Promedio general</p>
              </div>

              {/* Pendientes */}
              <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Pendientes</h3>
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-foreground">{pendingRequestsCount}</p>
                <p className="text-xs text-muted-foreground mt-2">Solicitudes nuevas</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={() => setCurrentView("users")}
                className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-2xl transition shadow-lg hover:shadow-xl"
              >
                Nuevo Usuario
              </button>
              <button
                onClick={() => setCurrentView("requests")}
                className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 rounded-2xl transition shadow-lg hover:shadow-xl"
              >
                Solicitudes
              </button>
              <button
                onClick={() => setCurrentView("reports")}
                className="bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-4 rounded-2xl transition shadow-lg hover:shadow-xl"
              >
                Ver Reportes
              </button>
              <button
                onClick={() => setCurrentView("courses")}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 rounded-2xl transition shadow-lg hover:shadow-xl"
              >
                Configurar Cursos
              </button>
            </div>
          </>
        )}

        {/* Subviews */}

        {currentView === "users" && (
          <ManageUsers
            onBack={() => setCurrentView("home")}
            onUserAdded={() => {
              // Actualizar contadores de manera segura sin afectar la sesión
              console.log("Actualizando contadores después de agregar usuario...");
              Promise.allSettled([
                fetchAlumnosCount().catch(err => console.warn("Error al actualizar count alumnos:", err)),
                fetchMaestrosCount().catch(err => console.warn("Error al actualizar count maestros:", err)),
                fetchPendingRequestsCount().catch(err => console.warn("Error al actualizar count solicitudes:", err))
              ]).then(() => {
                console.log("Contadores actualizados (algunos pueden haber fallado)");
              });
            }}
          />
        )}
        {currentView === "requests" && (
          <ManageUsers
            onBack={() => setCurrentView("home")}
            initialTab="requests"
            onUserAdded={() => {
              // Actualizar contadores de manera segura sin afectar la sesión
              console.log("Actualizando contadores después de aprobar solicitud...");
              Promise.allSettled([
                fetchAlumnosCount().catch(err => console.warn("Error al actualizar count alumnos:", err)),
                fetchMaestrosCount().catch(err => console.warn("Error al actualizar count maestros:", err)),
                fetchPendingRequestsCount().catch(err => console.warn("Error al actualizar count solicitudes:", err))
              ]).then(() => {
                console.log("Contadores actualizados (algunos pueden haber fallado)");
              });
            }}
          />
        )}
        {currentView === "reports" && <StudentReports onBack={() => setCurrentView("home")} />}
        {currentView === "courses" && <ConfigureCourses onBack={() => setCurrentView("home")} />}
      </main>
    </div>
  );
}
