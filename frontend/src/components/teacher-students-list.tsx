"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, User } from "lucide-react"
import api from "../axios"

interface TeacherStudentsListProps {
  courseId: string
  courseName: string
  teacherName: string
  teacherId: number
  teacherMatricula?: string
  onBack: () => void
}

interface Student {
  id: number
  nombre: string
  matricula: string
  email?: string
  calificacion: {
    id: number
    nota: number | null
    fecha_registro: string
    observaciones: string | null
  } | null
}

export default function TeacherStudentsList({
  courseId,
  courseName,
  teacherName,
  teacherId,
  teacherMatricula,
  onBack
}: TeacherStudentsListProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  // const [editingGrade, setEditingGrade] = useState<number | null>(null)
  // const [gradeValue, setGradeValue] = useState("")

  // Fetch students for this teacher and course
  const fetchStudents = async () => {
    try {
      setLoading(true)
      // Assuming there's an endpoint to get students for a teacher in a course
      const response = await api.get(`/materias/${courseId}/maestros/${teacherId}/alumnos`)
      setStudents(response.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching students:", err)
      setError("Error al cargar los alumnos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [courseId, teacherId])

  const filteredStudents = students.filter(
    (student) =>
      student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricula?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Cargando alumnos...</p>
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
            onClick={fetchStudents}
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
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Alumnos de {courseName}</h2>
          <p className="text-gray-600">Maestro: {teacherName}</p>
          {teacherMatricula && <p className="text-gray-600">Matrícula: {teacherMatricula}</p>}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar alumno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{student.nombre}</h3>
                  <p className="text-gray-600 mb-2">Email: {student.email}</p>
                  {student.matricula && (
                    <p className="text-gray-600">Matrícula: {student.matricula}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm ? "No se encontraron alumnos con ese criterio de búsqueda" : "No hay alumnos inscritos en esta materia"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
