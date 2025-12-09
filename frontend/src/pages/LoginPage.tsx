"use client"

import { useState } from "react"
import { useAuth } from "../context/auth-context"
import LoginForm from "../components/LoginForm"
import RegisterForm from "../components/RegisterForm"
import Dashboard from "../components/Dashboard"
// import TeacherDashboard from "../components/teacher-dashboard"

export default function LoginPage() {
  const { user } = useAuth()
  const [authState, setAuthState] = useState<"login" | "register">("login")

  const isAuthenticated = !!user // derivado de user

  // Si ya está autenticado
  if (isAuthenticated && user) {
    if (user.rol === "CONTROL_ESCOLAR") {
      return <Dashboard user={{ ...user, token: "" }} />
    }

    if (user.rol === "MAESTRO") {
      // return <TeacherDashboard user={{ ...user, token: "" }} />
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {authState === "login" && (
        <LoginForm onSwitchToRegister={() => setAuthState("register")} />
      )}

      {authState === "register" && (
        <RegisterForm
          onSwitchToLogin={() => setAuthState("login")}
          onRegister={() => {}}
        />
      )}
    </main>
  )
}
