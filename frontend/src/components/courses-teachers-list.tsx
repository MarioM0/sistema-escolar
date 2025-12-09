"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import api from "../axios"
import TeacherStudentsList from "./teacher-students-list"

interface CourseTeachersListProps {
  courseId: string
  courseName: string
  onBack: () => void
}

interface Teacher {
  id: number
  nombre: string
  email: string
  matricula?: string
}

interface Course {
  id: number
  nombre: string
  grupo: string
  maestros?: Teacher[]
}

export default function CourseTeachersList({ courseId, courseName, onBack }: CourseTeachersListProps) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null)

  // Fetch course with teacher
  const fetchCourse = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/materias/${courseId}`)
      setCourse(response.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching course:", err)
      setError("Error al cargar la materia")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  const selectedTeacher = selectedTeacherId && course?.maestros ? course.maestros.find(m => m.id === selectedTeacherId) : null

  if (selectedTeacherId && selectedTeacher) {
    return (
      <TeacherStudentsList
        courseId={courseId}
        courseName={courseName}
        teacherName={selectedTeacher.nombre}
        teacherId={selectedTeacher.id}
        teacherMatricula={selectedTeacher.matricula}
        onBack={() => setSelectedTeacherId(null)}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando maestros...</p>
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
            onClick={fetchCourse}
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
          <h2 className="text-3xl font-bold text-gray-900">Maestros de {courseName}</h2>
        </div>
      </div>

      {/* Teachers List */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Maestros Asignados</h3>
        {course?.maestros && course.maestros.length > 0 ? (
          <div className="space-y-4">
            {course.maestros.map((maestro) => (
              <div key={maestro.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{maestro.nombre}</h4>
                  <p className="text-gray-600">Email: {maestro.email}</p>
                  {maestro.matricula && (
                    <p className="text-gray-600">Matrícula: {maestro.matricula}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedTeacherId(maestro.id)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                >
                  Ver Alumnos
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No maestros asignados</p>
        )}
      </div>
    </div>
  )
}
