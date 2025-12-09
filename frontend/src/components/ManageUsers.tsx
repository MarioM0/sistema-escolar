"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Trash2, Eye, Copy, Check, X } from "lucide-react"
import api from "../axios"

interface ManageUsersProps {
  onBack: () => void
  onViewStudent?: (studentId: string) => void
  onViewTeacher?: (teacherId: string) => void
  onViewAdmin?: (adminId: string) => void
  onUserAdded?: () => void
  initialTab?: "add" | "requests"
}

interface UserRequest {
  id: string
  name: string
  email: string
  role: "maestro" | "admin"
  dateRequested: string
  password?: string
}

interface User {
  id: string
  nombre: string
  email: string
  role: "estudiante" | "maestro" | "admin"
  matricula?: string
  grupo?: string
  password: string
}

interface Alumno {
  id: string
  nombre: string
  email: string
  matricula: string
  grupo?: string
}

const generateRandomPassword = () => Math.random().toString(36).slice(-8).toUpperCase()
const generateStudentMatricula = () => `ALU${Math.floor(Math.random() * 9000 + 1000)}`
const generateTeacherMatricula = () => `MTR${Math.floor(Math.random() * 900 + 100)}`

export default function ManageUsers({ onBack, onViewStudent, onViewTeacher, onViewAdmin, onUserAdded, initialTab }: ManageUsersProps) {
  const [tab, setTab] = useState<"add" | "requests">(initialTab || "add")
  const [selectedRole, setSelectedRole] = useState<"estudiante" | "maestro" | "admin" | null>(null)
  const [formData, setFormData] = useState({ nombre: "", email: "", password: "", grupo: "", matricula: "" })
  const [users, setUsers] = useState<User[]>([])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [approvingRequest, setApprovingRequest] = useState<UserRequest | null>(null)
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null)

  // Fetch requests when tab changes to requests
  useEffect(() => {
    if (tab === "requests") {
      fetchRequests();
    }
  }, [tab]);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/solicitudes-registro-maestro");
      const fetchedRequests = response.data.map((solicitud: any) => ({
        id: solicitud.id.toString(),
        name: solicitud.nombre,
        email: solicitud.email,
        role: "maestro" as const,
        dateRequested: new Date(solicitud.fecha_solicitud).toLocaleDateString(),
      }));
      setRequests(fetchedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleRoleSelect = (role: "estudiante" | "maestro" | "admin") => {
    setSelectedRole(role)
    const matricula = role === "maestro" ? generateTeacherMatricula() : role === "estudiante" ? generateStudentMatricula() : ""
    setFormData({
      nombre: "",
      email: "",
      password: generateRandomPassword(),
      grupo: "",
      matricula
    })
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole || !formData.nombre || !formData.email) return

    if (selectedRole === "estudiante") {
      // Add alumno to database
      try {
        const response = await api.post("/alumnos", {
          nombre: formData.nombre,
          email: formData.email,
          matricula: formData.matricula,
          grupo: formData.grupo || null,
        })
        const newAlumno: Alumno = response.data
        setAlumnos([...alumnos, newAlumno])
      } catch (error) {
        console.error("Error adding alumno:", error)
        alert("Error al agregar alumno")
        return
      }
    } else if (selectedRole === "maestro") {
      // Add maestro to usuarios table
      try {
        const response = await api.post("/usuarios", {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          rol: "MAESTRO",
          matricula: formData.matricula,
        })
        const newUser: User = {
          id: response.data.id.toString(),
          nombre: response.data.nombre,
          email: response.data.email,
          role: "maestro",
          matricula: response.data.matricula,
          password: formData.password,
        }
        setUsers([...users, newUser])
      } catch (error) {
        console.error("Error adding maestro:", error)
        alert("Error al agregar maestro")
        return
      }
    } else if (selectedRole === "admin") {
      // Add administrador (control escolar) to usuarios table
      try {
        const response = await api.post("/usuarios", {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          rol: "CONTROL_ESCOLAR",
        })
        const newUser: User = {
          id: response.data.id.toString(),
          nombre: response.data.nombre,
          email: response.data.email,
          role: "admin",
          password: formData.password,
        }
        setUsers([...users, newUser])
      } catch (error) {
        console.error("Error adding administrador:", error)
        alert("Error al agregar administrador")
        return
      }
    }

    setFormData({ nombre: "", email: "", password: "", grupo: "", matricula: "" })
    setSelectedRole(null)
    if (onUserAdded) onUserAdded()
  }

  const handleApproveRequest = (request: UserRequest) => {
    setApprovingRequest(request)
    setSelectedRole(request.role === "maestro" ? "maestro" : "admin")
    const matricula = request.role === "maestro" ? generateTeacherMatricula() : ""
    setFormData({ nombre: request.name, email: request.email, password: request.password || generateRandomPassword(), grupo: "", matricula })
  }

  const handleCompleteApproval = async () => {
    if (!selectedRole || !approvingRequest || !formData.nombre || !formData.email) return

    try {
      // Call the approve endpoint with form data
      await api.put(`/solicitudes-registro-maestro/${approvingRequest.id}/aprobar`, {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        matricula: formData.matricula,
      })

      setRequests(requests.filter(r => r.id !== approvingRequest.id))
      setApprovingRequest(null)
      setFormData({ nombre: "", email: "", password: "", grupo: "", matricula: "" })
      setSelectedRole(null)
      if (onUserAdded) onUserAdded()
    } catch (error) {
      console.error("Error approving request:", error)
      alert("Error al aprobar la solicitud")
    }
  }

  const handleRejectRequest = async (request: UserRequest) => {
    try {
      await api.put(`/solicitudes-registro-maestro/${request.id}/rechazar`, {
        respuesta: 'Solicitud rechazada'
      });
      setRequests(requests.filter(r => r.id !== request.id))
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Error al rechazar la solicitud")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPassword(text)
    setTimeout(() => setCopiedPassword(null), 2000)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
      <h2 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => { setTab("add"); setSelectedRole(null); setApprovingRequest(null) }}
          className={`px-4 py-3 font-semibold border-b-2 transition ${tab === "add" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}
        >
          Agregar Manualmente
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`px-4 py-3 font-semibold border-b-2 transition ${tab === "requests" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}
        >
          Solicitudes Pendientes ({requests.length})
        </button>
      </div>

      {/* Add User Form */}
      {tab === "add" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            {!selectedRole ? (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Seleccionar Tipo de Usuario</h3>
                <div className="space-y-3">
                  <button onClick={() => handleRoleSelect("estudiante")} className="w-full p-4 border-2 border-gray-300 hover:border-blue-600 rounded-lg text-left transition">
                    <p className="font-semibold text-gray-900">👨‍🎓 Estudiante</p>
                    <p className="text-sm text-gray-600">Incluye matrícula y grupo</p>
                  </button>
                  <button onClick={() => handleRoleSelect("maestro")} className="w-full p-4 border-2 border-gray-300 hover:border-blue-600 rounded-lg text-left transition">
                    <p className="font-semibold text-gray-900">👨‍🏫 Maestro</p>
                    <p className="text-sm text-gray-600">Incluye matrícula de maestro</p>
                  </button>
                  <button onClick={() => handleRoleSelect("admin")} className="w-full p-4 border-2 border-gray-300 hover:border-blue-600 rounded-lg text-left transition">
                    <p className="font-semibold text-gray-900">⚙️ Administrador</p>
                    <p className="text-sm text-gray-600">Sin matrícula requerida</p>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={approvingRequest ? handleCompleteApproval : handleAddUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ej: Juan García"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ej: juan@example.com"
              required
            />
          </div>

          {selectedRole !== "estudiante" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <div className="flex gap-2">
                <input type="text" value={formData.password} readOnly className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 outline-none" />
                <button type="button" onClick={() => setFormData({ ...formData, password: generateRandomPassword() })} className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition font-semibold text-sm">Generar</button>
                <button type="button" onClick={() => copyToClipboard(formData.password)} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition"><Copy size={18} /></button>
              </div>
              {copiedPassword && <p className="text-xs text-green-600 mt-1">✓ Copiado al portapapeles</p>}
            </div>
          )}

                {selectedRole === "estudiante" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Matrícula</label>
                      <input
                        type="text"
                        value={formData.matricula}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Grupo</label>
                      <input
                        type="text"
                        value={formData.grupo}
                        onChange={e => setFormData({ ...formData, grupo: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Ej: 10A"
                      />
                    </div>
                  </>
                )}

                {selectedRole === "maestro" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Matrícula</label>
                    <input
                      type="text"
                      value={formData.matricula}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 outline-none"
                    />
                  </div>
                )}

          <div className="pt-4 space-y-2">
                  <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2">
                    <Plus size={20} /> {approvingRequest ? "Aprobar Usuario" : "Agregar Usuario"}
                  </button>
                  {approvingRequest && (
                    <button type="button" onClick={() => { setApprovingRequest(null); setFormData({ nombre: "", email: "", password: "", grupo: "", matricula: "" }); setSelectedRole(null) }} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition">
                      Cancelar
                    </button>
                  )}
          </div>
        </form>
            )}
          </div>

          {/* Users List */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Usuarios Agregados ({users.length + alumnos.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{user.nombre}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.matricula && <p className="text-xs text-gray-500">Matrícula: {user.matricula}</p>}
                    {user.grupo && <p className="text-xs text-gray-500">Grupo: {user.grupo}</p>}
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block capitalize">{user.role}</span>
                  </div>
                  <div className="flex gap-2">
                    {user.role === "estudiante" && onViewStudent && <button onClick={() => onViewStudent(user.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Eye size={18} /></button>}
                    {user.role === "maestro" && onViewTeacher && <button onClick={() => onViewTeacher(user.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Eye size={18} /></button>}
                    {user.role === "admin" && onViewAdmin && <button onClick={() => onViewAdmin(user.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Eye size={18} /></button>}
                    <button onClick={() => setUsers(users.filter(u => u.id !== user.id))} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
              {alumnos.map(alumno => (
                <div key={alumno.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{alumno.nombre}</p>
                    <p className="text-sm text-gray-600">{alumno.email}</p>
                    <p className="text-xs text-gray-500">Matrícula: {alumno.matricula}</p>
                    {alumno.grupo && <p className="text-xs text-gray-500">Grupo: {alumno.grupo}</p>}
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1 inline-block">Alumno</span>
                  </div>
                  <div className="flex gap-2">
                    {onViewStudent && <button onClick={() => onViewStudent(alumno.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Eye size={18} /></button>}
                    <button onClick={() => setAlumnos(alumnos.filter(a => a.id !== alumno.id))} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
              {(users.length === 0 && alumnos.length === 0) && <p className="text-center text-gray-500 py-8">No hay usuarios agregados aún</p>}
            </div>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {tab === "requests" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Solicitudes Pendientes ({requests.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {requests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{request.name}</p>
                  <p className="text-sm text-gray-600">{request.email}</p>
                  <p className="text-xs text-gray-500">Solicitado el: {request.dateRequested}</p>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block capitalize">{request.role}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { handleApproveRequest(request); setTab("add") }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Aprobar solicitud"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Rechazar solicitud"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
            {requests.length === 0 && <p className="text-center text-gray-500 py-8">No hay solicitudes pendientes</p>}
          </div>
        </div>
      )}


    </div>
  )
}
