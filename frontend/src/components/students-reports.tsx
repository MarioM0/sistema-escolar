"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Edit2, Trash2, Eye, Search } from "lucide-react"
import api from "../axios"
import StudentDetail from "./students-detail"

interface StudentReportsProps {
  onBack: () => void
}

interface Student {
  id: number
  matricula: string
  nombre: string
  email: string
  grupo: string
}

export default function StudentReports({ onBack }: StudentReportsProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterGrupo, setFilterGrupo] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await api.get("/alumnos")
        setStudents(response.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching students:", err)
        setError("Error al cargar los estudiantes")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const filteredStudents = students.filter((student) => {
    const matchSearch =
      student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricula.includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchGrupo = !filterGrupo || student.grupo === filterGrupo

    return matchSearch && matchGrupo
  })

  const handleDeleteStudent = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este estudiante?")) return

    try {
      await api.delete(`/alumnos/${id}`)
      setStudents(students.filter((s) => s.id !== id))
    } catch (err) {
      console.error("Error deleting student:", err)
      alert("Error al eliminar el estudiante")
    }
  }

  if (selectedStudent) {
    return (
      <StudentDetail student={selectedStudent} onBack={() => setSelectedStudent(null)} onDelete={handleDeleteStudent} onUpdate={(updatedStudent) => {
        setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s))
        setSelectedStudent(updatedStudent)
      }} />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estudiantes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="text-3xl font-bold text-gray-900">Reportes de Estudiantes</h2>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, matrícula o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterGrupo}
            onChange={(e) => setFilterGrupo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Todos los grupos</option>
            <option value="A">Grupo A</option>
            <option value="B">Grupo B</option>
            <option value="C">Grupo C</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm("")
              setFilterGrupo("")
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition font-semibold"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Matrícula</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Grupo</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">{student.matricula}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.grupo}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Ver más información"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                        title="Editar información"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar estudiante"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron estudiantes</p>
          </div>
        )}
      </div>
    </div>
  )
}
