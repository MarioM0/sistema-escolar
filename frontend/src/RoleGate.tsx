import { useAuth } from "./context/auth-context"
import LoginPage from "./pages/LoginPage"
import Dashboard from "./components/Dashboard"
// import TeacherDashboard from "./components/TeacherDashboard"

export default function RoleGate() {
  const { user, logout } = useAuth()

  // Usuario no autenticado → mostrar login
  if (!user) return <LoginPage />

  // Routing según rol
  switch (user.rol) {
    case "CONTROL_ESCOLAR":
      return <Dashboard user={user} onLogout={logout} />

    case "MAESTRO":
      // Si quieres habilitar dashboard de maestro, descomenta:
      // return <TeacherDashboard user={user} onLogout={logout} />

    default:
      return (
        <div className="p-6 text-center">
          <h1 className="text-xl font-bold">Acceso restringido</h1>
          <p className="mt-2">Tu rol no tiene acceso a esta sección.</p>
          <button
            onClick={logout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Cerrar sesión
          </button>
        </div>
      )
  }
}
