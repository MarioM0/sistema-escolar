"use client"

import { useState } from "react"
import LoginForm from "../components/LoginForm"
import RegisterForm from "../components/RegisterForm"
import Dashboard from "../components/Dashboard"

export default function LoginPage() {
  const [authState, setAuthState] = useState<"login" | "register" | "dashboard">("login")
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  const handleSwitchToRegister = () => setAuthState("register")
  const handleSwitchToLogin = () => setAuthState("login")
  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData)
    setAuthState("dashboard")
  }
  const handleRegister = (userData: { name: string; email: string }) => {
    setUser(userData)
    setAuthState("dashboard")
  }
  const handleLogout = () => {
    setUser(null)
    setAuthState("login")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {authState === "login" && (
        <LoginForm onSwitchToRegister={handleSwitchToRegister} onLogin={handleLogin} />
      )}
      {authState === "register" && (
        <RegisterForm onSwitchToLogin={handleSwitchToLogin} onRegister={handleRegister} />
      )}
      {authState === "dashboard" && user && <Dashboard user={user} onLogout={handleLogout} />}
    </main>
  )
}
