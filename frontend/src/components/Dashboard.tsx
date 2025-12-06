"use client"

import { LogOut, Users, BookOpen, BarChart3, Settings } from "lucide-react"

interface DashboardProps {
  user: { name: string; email: string }
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Bienvenido,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {user.name}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">{user.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Estudiantes</h3>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-foreground">1,234</p>
            <p className="text-xs text-muted-foreground mt-2">Aumentó 5% este mes</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Cursos Activos</h3>
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-foreground">24</p>
            <p className="text-xs text-muted-foreground mt-2">En el sistema</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Calificaciones</h3>
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-foreground">8.5</p>
            <p className="text-xs text-muted-foreground mt-2">Promedio general</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Configuración</h3>
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-foreground">3</p>
            <p className="text-xs text-muted-foreground mt-2">Cambios pendientes</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-2xl transition shadow-lg hover:shadow-xl">
            Nuevo Estudiante
          </button>
          <button className="bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-4 rounded-2xl transition shadow-lg hover:shadow-xl">
            Ver Reportes
          </button>
          <button className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 rounded-2xl transition shadow-lg hover:shadow-xl">
            Configurar Cursos
          </button>
        </div>
      </main>
    </div>
  )
}
