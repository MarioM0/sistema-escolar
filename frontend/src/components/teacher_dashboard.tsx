"use client"

import { useState, useEffect } from "react"
import { LogOut, BookOpen, Users, BarChart3 } from "lucide-react"
import { useAuth } from "../context/auth-context"
import TeacherMyGroups from "./teacher.my-groups"
import TeacherGradeManagement from "./teacher-grade-management.tsx"

interface TeacherDashboardProps {
  user: { nombre: string; email: string; rol: string }
  onLogout?: () => void
}

export default function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  const [currentView, setCurrentView] = useState<"home" | "groups" | "grades">("home")
  const [teacherStats, setTeacherStats] = useState({ groups: 0, students: 0, avgGrade: 0 })
  const { logout, user: authUser } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      if (!authUser?.id) return

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/maestros/${authUser.id}/stats`)
        if (response.ok) {
          const data = await response.json()
          setTeacherStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [authUser?.id])

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      logout()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Control Escolar</h1>
              <p className="text-xs text-gray-500">Panel de Maestro</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
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
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Bienvenido,{" "}
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {user.nombre}
                </span>
              </h2>
              <p className="text-gray-600 text-lg">{user.email}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Grupos</h3>
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{teacherStats.groups}</p>
                <p className="text-xs text-gray-500 mt-2">Grupos asignados</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Estudiantes</h3>
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{teacherStats.students}</p>
                <p className="text-xs text-gray-500 mt-2">Total de alumnos</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Promedio</h3>
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{teacherStats.avgGrade}</p>
                <p className="text-xs text-gray-500 mt-2">Promedio general grupos</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setCurrentView("groups")}
                className="bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold py-4 rounded-2xl transition shadow-lg hover:shadow-xl"
              >
                Mis Grupos y Alumnos
              </button>
              <button
                onClick={() => setCurrentView("grades")}
                className="bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold py-4 rounded-2xl transition shadow-lg hover:shadow-xl"
              >
                Gestionar Calificaciones
              </button>
            </div>
          </>
        )}

        {currentView === "groups" && <TeacherMyGroups onBack={() => setCurrentView("home")} />}
        {currentView === "grades" && <TeacherGradeManagement onBack={() => setCurrentView("home")} />}
      </main>
    </div>
  )
}
