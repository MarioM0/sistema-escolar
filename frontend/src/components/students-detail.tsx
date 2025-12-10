"use client"


import { useState, useEffect } from "react"
import { ArrowLeft, Edit2, Trash2, Save, X, ChevronDown, ChevronUp, Calendar, User } from "lucide-react"
import api from "../axios"

interface StudentDetailProps {
  student: {
    id: number
    matricula: string
    nombre: string
    email: string
    grupo: string
  }
  onBack: () => void
  onDelete: (id: number) => void
  onUpdate: (student: any) => void
}


interface CalificacionHistory {
  id: number
  calificacion: number
  fecha_registro: string
  observaciones?: string
}

interface Subject {
  id: number
  materia: {
    id: number
    nombre: string
    codigo: string
  }
  maestro: {
    id: number
    nombre: string
  }
  calificacion_actual: number | null
  fecha_registro: string
  observaciones?: string
  historial_calificaciones: CalificacionHistory[]
  total_calificaciones: number
}

interface StudentData {
  alumno: {
    id: number
    nombre: string
    matricula: string
    grupo: string
  }
  subjects: Subject[]
  resumen: {
    promedio: number
    materiasCursadas: number
  }
}

export default function StudentDetail({ student, onBack, onDelete, onUpdate }: StudentDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(student)
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await api.get(`/calificaciones/alumno/${student.id}`)
        setStudentData(response.data)
      } catch (error) {
        console.error("Error fetching student data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [student.id])


  const getGradeColor = (grade: number | null) => {
    if (grade === null) return "text-gray-600"
    if (grade < 6) return "text-red-600"
    if (grade === 10) return "text-yellow-600"
    if (grade >= 6 && grade < 10) return "text-green-600"
    return "text-gray-600"
  }


  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set())



  const toggleSubjectExpansion = (subjectId: number) => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId)
    } else {
      newExpanded.add(subjectId)
    }
    setExpandedSubjects(newExpanded)
  }

  const subjects = studentData?.subjects || []
  const promedio = studentData?.resumen.promedio !== null && studentData?.resumen.promedio !== undefined ? studentData.resumen.promedio.toFixed(2) : "0"
  const materiasCursadas = studentData?.resumen.materiasCursadas || 0

  const handleSaveEdit = async () => {
    try {
      const response = await api.put(`/alumnos/${student.id}`, editData)
      onUpdate(response.data)
      setIsEditing(false)
    } catch (err) {
      console.error("Error updating student:", err)
      alert("Error al actualizar el estudiante")
    }
  }

  const handleDeleteStudent = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este estudiante?")) return

    try {
      await api.delete(`/alumnos/${student.id}`)
      onDelete(student.id)
      onBack()
    } catch (err) {
      console.error("Error deleting student:", err)
      alert("Error al eliminar el estudiante")
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="text-3xl font-bold text-gray-900">Detalle del Estudiante</h2>
      </div>

      {/* Student Info Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{isEditing ? editData.nombre : student.nombre}</h3>
            <p className="text-gray-600">Matrícula: {student.matricula}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={handleDeleteStudent}
                  className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition"
                >
                  <Save size={20} />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditData(student)
                  }}
                  className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
              <input
                type="text"
                value={editData.nombre}
                onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grupo</label>
              <input
                type="text"
                value={editData.grupo}
                onChange={(e) => setEditData({ ...editData, grupo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-900">{student.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Grupo</p>
              <p className="text-lg font-semibold text-gray-900">
                {student.grupo}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Promedio General</p>
              <p className="text-lg font-semibold text-green-600">
                {loading ? "Cargando..." : promedio}
              </p>
            </div>
          </div>
        )}
      </div>

        {/* Subjects and Grades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Subjects and Grades */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Materias y Calificaciones</h3>
              <div className="text-sm text-gray-500">
                {subjects.filter(s => s.calificacion_actual !== null).length} de {subjects.length} materias calificadas
              </div>
            </div>
            {loading ? (
              <p className="text-center text-gray-600">Cargando calificaciones...</p>
            ) : subjects.length === 0 ? (
              <p className="text-center text-gray-600">No hay materias asignadas a este grupo</p>
            ) : (
              <div className="space-y-4">
                {subjects.map((subject) => (
                  <div key={subject.materia.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {/* Subject Header */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 text-lg">{subject.materia.nombre}</h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              {subject.materia.codigo}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              <span>Profesor: {subject.maestro.nombre}</span>
                            </div>
                            {subject.total_calificaciones > 0 && (
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{subject.total_calificaciones} calificación{subject.total_calificaciones !== 1 ? 'es' : ''}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {/* Current Grade */}
                          <div className="text-right">
                            <div className={`text-4xl font-bold mb-1 ${getGradeColor(subject.calificacion_actual)}`}>
                              {subject.calificacion_actual !== null && typeof subject.calificacion_actual === 'number' ? subject.calificacion_actual.toFixed(1) : "—"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subject.calificacion_actual !== null ? (
                                <div>
                                  <p>Calificado</p>
                                  {subject.fecha_registro && (
                                    <p>{new Date(subject.fecha_registro).toLocaleDateString()}</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-400">Sin calificar</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Expand Button */}
                          {subject.total_calificaciones > 0 && (
                            <button
                              onClick={() => toggleSubjectExpansion(subject.materia.id)}
                              className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all duration-200 border border-gray-300"
                            >
                              {expandedSubjects.has(subject.materia.id) ? (
                                <ChevronUp size={20} className="text-gray-600" />
                              ) : (
                                <ChevronDown size={20} className="text-gray-600" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Current Observations */}
                      {subject.observaciones && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm text-blue-800 italic">"{subject.observaciones}"</p>
                        </div>
                      )}
                    </div>

                    {/* Grade History */}
                    {expandedSubjects.has(subject.materia.id) && subject.historial_calificaciones.length > 0 && (
                      <div className="p-4 bg-white">
                        <h5 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <Calendar size={16} />
                          Historial de Calificaciones
                        </h5>
                        <div className="space-y-3">
                          {subject.historial_calificaciones.map((grade, index) => (
                            <div key={grade.id} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                              index === 0 ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-300'
                            }`}>
                              <div className="flex items-center gap-4">
                                <div className={`text-2xl font-bold ${
                                  index === 0 ? 'text-green-600' : getGradeColor(grade.calificacion)
                                }`}>
                                  {grade.calificacion.toFixed(1)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {index === 0 ? 'Calificación Actual' : `Calificación Anterior`}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <Calendar size={12} />
                                    <span>{new Date(grade.fecha_registro).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              {grade.observaciones && (
                                <div className="flex-1 max-w-xs">
                                  <p className="text-xs text-gray-600 italic">"{grade.observaciones}"</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* Summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen Académico</h3>
          <div className="space-y-6">
            {/* Promedio General */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Promedio General</p>
              <p className="text-4xl font-bold text-blue-600">{promedio}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(() => {
                  const avg = parseFloat(promedio);
                  if (avg >= 9) return "Excelente rendimiento";
                  if (avg >= 8) return "Muy buen rendimiento";
                  if (avg >= 7) return "Buen rendimiento";
                  if (avg >= 6) return "Rendimiento aceptable";
                  return "Requiere atención";
                })()}
              </p>
            </div>


            {/* Estadísticas Detalladas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{materiasCursadas}</p>
                <p className="text-sm text-gray-600">Materias Totales</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {subjects.filter(s => s.calificacion_actual !== null && s.calificacion_actual >= 6).length}
                </p>
                <p className="text-sm text-gray-600">Materias Aprobadas</p>
              </div>
            </div>

            {/* Distribución de Calificaciones */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Distribución de Calificaciones</p>
              <div className="space-y-2">
                {[
                  { range: "9.0 - 10.0", label: "Excelente", color: "bg-green-500", count: subjects.filter(s => s.calificacion_actual !== null && s.calificacion_actual >= 9).length },
                  { range: "8.0 - 8.9", label: "Muy Bueno", color: "bg-blue-500", count: subjects.filter(s => s.calificacion_actual !== null && s.calificacion_actual >= 8 && s.calificacion_actual < 9).length },
                  { range: "7.0 - 7.9", label: "Bueno", color: "bg-yellow-500", count: subjects.filter(s => s.calificacion_actual !== null && s.calificacion_actual >= 7 && s.calificacion_actual < 8).length },
                  { range: "6.0 - 6.9", label: "Aceptable", color: "bg-orange-500", count: subjects.filter(s => s.calificacion_actual !== null && s.calificacion_actual >= 6 && s.calificacion_actual < 7).length },
                  { range: "0.0 - 5.9", label: "Deficiente", color: "bg-red-500", count: subjects.filter(s => s.calificacion_actual !== null && s.calificacion_actual < 6).length },
                  { range: "Sin Calificar", label: "Pendiente", color: "bg-gray-400", count: subjects.filter(s => s.calificacion_actual === null).length }
                ].map((item) => (
                  <div key={item.range} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm text-gray-600">{item.range}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.count}</span>
                      <span className="text-xs text-gray-500">({item.label})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Información del Grupo */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Grupo Asignado</p>
              <p className="text-lg font-semibold text-gray-900">{student.grupo}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
