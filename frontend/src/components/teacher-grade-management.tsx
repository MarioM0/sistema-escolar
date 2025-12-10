"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, AlertCircle, Plus, History, X, Trash2 } from "lucide-react"
import { useAuth } from "../context/auth-context"

interface TeacherGradeManagementProps {
  onBack: () => void
}

interface GradeEntry {
  id: string
  studentId: number
  name: string
  matricula: string
  group: string
  subject: string
  currentGrade: number | null
  newGrade: number | null
  fecha_registro: string | null
  observaciones: string | null
  status: "pendiente" | "guardado"
}



interface NewGrade {
  studentId: number
  subject: string
  newGrade: number | null
}

interface GradeHistoryEntry {
  id: number
  studentId: number
  studentName: string
  matricula: string
  group: string
  subject: string
  grade: number | null
  fecha_registro: string
  observaciones: string | null
}

export default function TeacherGradeManagement({ onBack }: TeacherGradeManagementProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>([])
  const [newGrades, setNewGrades] = useState<NewGrade[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<{id: number, name: string, subject: string} | null>(null)
  const [gradeHistory, setGradeHistory] = useState<GradeHistoryEntry[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const { user: authUser } = useAuth()

  useEffect(() => {
    const fetchGrades = async () => {
      if (!authUser?.id) {
        setLoading(false)
        return
      }

      try {
        const params = new URLSearchParams()
        if (selectedGroup) params.append('group', selectedGroup)
        if (selectedSubject) params.append('subject', selectedSubject)

        const response = await fetch(`${import.meta.env.VITE_API_URL}/maestros/${authUser.id}/grades?${params}`)
        if (response.ok) {
          const data = await response.json()
          const grades = data.map((grade: any) => ({
            id: grade.id,
            studentId: grade.studentId,
            name: grade.name,
            matricula: grade.matricula,
            group: grade.group,
            subject: grade.subject,
            currentGrade: grade.currentGrade !== null ? Number(grade.currentGrade) : null,
            newGrade: grade.newGrade !== null ? Number(grade.newGrade) : null,
            fecha_registro: grade.fecha_registro,
            observaciones: grade.observaciones,
            status: "guardado" as const
          }))
          setGradeEntries(grades)

          // Extract unique groups and subjects
          const uniqueGroups = [...new Set(grades.map((g: GradeEntry) => g.group))] as string[]
          const uniqueSubjects = [...new Set(grades.map((g: GradeEntry) => g.subject))] as string[]
          setGroups(uniqueGroups)
          setSubjects(uniqueSubjects)
        } else {
          console.error("Failed to fetch grades:", response.status)
        }
      } catch (error) {
        console.error("Error fetching grades:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGrades()
  }, [authUser?.id, selectedGroup, selectedSubject])

  const filteredGrades = gradeEntries.filter((s) => {
    const matchesGroup = selectedGroup ? s.group === selectedGroup : true
    const matchesSearch = searchTerm === "" ||
      (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.matricula && s.matricula.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesGroup && matchesSearch
  })

  const handleAddGrade = (studentId: number, subject: string, grade: number) => {
    const clampedGrade = Math.min(10, Math.max(0, grade))
    setNewGrades((prev) => {
      const existing = prev.find(g => g.studentId === studentId && g.subject === subject)
      if (existing) {
        return prev.map(g => (g.studentId === studentId && g.subject === subject) ? { ...g, newGrade: clampedGrade } : g)
      } else {
        return [...prev, { studentId, subject, newGrade: clampedGrade }]
      }
    })
  }

  const fetchGradeHistory = async (studentId?: number, subject?: string) => {
    if (!authUser?.id || !studentId || !subject) return

    setLoadingHistory(true)
    try {
      const params = new URLSearchParams()
      if (studentId) params.append('studentId', studentId.toString())
      if (subject) params.append('subject', subject)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/maestros/${authUser.id}/grades/history?${params}`)
      if (response.ok) {
        const data = await response.json()
        const history = data.map((entry: any) => ({
          id: entry.id,
          studentId: entry.studentId,
          studentName: entry.studentName,
          matricula: entry.matricula,
          group: entry.group,
          subject: entry.subject,
          grade: entry.grade !== null ? Number(entry.grade) : null,
          fecha_registro: entry.fecha_registro,
          observaciones: entry.observaciones
        }))
        setGradeHistory(history)
        setSelectedStudentForHistory({ id: studentId, name: history[0]?.studentName || '', subject })
        setHistoryModalOpen(true)
      }
    } catch (error) {
      console.error("Error fetching grade history:", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSaveNewGrades = async () => {
    if (!authUser?.id || newGrades.length === 0) return

    setSaving(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/maestros/${authUser.id}/grades`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grades: newGrades
        }),
      })

      if (response.ok) {
        // Refresh the grades list
        const params = new URLSearchParams()
        if (selectedGroup) params.append('group', selectedGroup)
        if (selectedSubject) params.append('subject', selectedSubject)

        const fetchResponse = await fetch(`${import.meta.env.VITE_API_URL}/maestros/${authUser.id}/grades?${params}`)
        if (fetchResponse.ok) {
          const data = await fetchResponse.json()
          const grades = data.map((grade: any) => ({
            id: grade.id,
            studentId: grade.studentId,
            name: grade.name,
            matricula: grade.matricula,
            group: grade.group,
            subject: grade.subject,
            currentGrade: grade.currentGrade !== null ? Number(grade.currentGrade) : null,
            newGrade: grade.newGrade !== null ? Number(grade.newGrade) : null,
            fecha_registro: grade.fecha_registro,
            observaciones: grade.observaciones,
            status: "guardado" as const
          }))
          setGradeEntries(grades)
        }
        setNewGrades([])
      }
    } catch (error) {
      console.error("Error saving grades:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGrade = async (gradeId: number) => {
    if (!authUser?.id) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/calificaciones/${gradeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh history
        if (selectedStudentForHistory) {
          await fetchGradeHistory(selectedStudentForHistory.id, selectedStudentForHistory.subject)
        }
        // Also refresh the main grades list
        const params = new URLSearchParams()
        if (selectedGroup) params.append('group', selectedGroup)
        if (selectedSubject) params.append('subject', selectedSubject)

        const fetchResponse = await fetch(`${import.meta.env.VITE_API_URL}/maestros/${authUser.id}/grades?${params}`)
        if (fetchResponse.ok) {
          const data = await fetchResponse.json()
          const grades = data.map((grade: any) => ({
            id: grade.id,
            studentId: grade.studentId,
            name: grade.name,
            matricula: grade.matricula,
            group: grade.group,
            subject: grade.subject,
            currentGrade: grade.currentGrade !== null ? Number(grade.currentGrade) : null,
            newGrade: grade.newGrade !== null ? Number(grade.newGrade) : null,
            fecha_registro: grade.fecha_registro,
            observaciones: grade.observaciones,
            status: "guardado" as const
          }))
          setGradeEntries(grades)
        }
      }
    } catch (error) {
      console.error("Error deleting grade:", error)
    }
  }

  const pendingCount = newGrades.length

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition"
        >
          <ArrowLeft size={20} />
          Volver al inicio
        </button>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestionar Calificaciones</h2>
        <p className="text-gray-600">Edita y guarda las calificaciones de tus alumnos</p>
      </div>

      {/* Group Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-3">Filtrar por grupo:</label>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setSelectedGroup(null)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedGroup === null ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos los grupos
          </button>
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedGroup === group ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Grupo {group}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-3">Filtrar por materia:</label>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setSelectedSubject(null)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedSubject === null ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todas las materias
          </button>
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedSubject === subject ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-3">Buscar estudiante:</label>
        <input
          type="text"
          placeholder="Buscar por nombre o matrícula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Pending Changes Alert */}
      {pendingCount > 0 && (
        <div className="mb-6 flex gap-3 items-start p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-900">Cambios pendientes</p>
            <p className="text-sm text-yellow-700">Tienes {pendingCount} calificación(es) sin guardar</p>
          </div>
        </div>
      )}

      {/* Grades Table */}
      {loading ? (
        <p className="text-center text-gray-600">Cargando calificaciones...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              {selectedGroup ? `Grupo ${selectedGroup}` : "Todas las calificaciones"}
            </h3>
            {pendingCount > 0 && (
              <button
                onClick={handleSaveNewGrades}
                disabled={saving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                <Save size={20} />
                {saving ? "Guardando..." : `Guardar ${pendingCount} calificación(es)`}
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Estudiante</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Matrícula</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Grupo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Materia</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Calificación Actual</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Historial</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Nueva Calificación</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade) => (
                  <tr key={grade.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{grade.name}</td>
                    <td className="py-3 px-4 text-gray-600">{grade.matricula}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold">
                        {grade.group}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{grade.subject}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <span className="font-semibold">{grade.currentGrade?.toFixed(1) || "N/A"}</span>
                        {grade.currentGrade && grade.fecha_registro && (
                          <span className="text-gray-500 ml-2">
                            {new Date(grade.fecha_registro).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => fetchGradeHistory(grade.studentId, grade.subject)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Ver historial de calificaciones"
                      >
                        <History size={16} />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          placeholder="Nueva calificación"
                          onChange={(e) => {
                            const value = Number.parseFloat(e.target.value) || null
                            if (value !== null) {
                              handleAddGrade(grade.studentId, grade.subject, value)
                            }
                          }}
                          className="w-24 px-2 py-1 text-sm rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => {
                            const input = document.querySelector(`input[placeholder="Nueva calificación"]`) as HTMLInputElement
                            if (input && input.value) {
                              handleAddGrade(grade.studentId, grade.subject, Number.parseFloat(input.value))
                            }
                          }}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Agregar calificación"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Historial de Calificaciones - {selectedStudentForHistory?.name}
              </h3>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {loadingHistory ? (
              <p className="text-center text-gray-600">Cargando historial...</p>
            ) : gradeHistory.length === 0 ? (
              <p className="text-center text-gray-600">No hay calificaciones registradas</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Fecha</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Materia</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Grupo</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Calificación</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Observaciones</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeHistory.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">
                          {new Date(entry.fecha_registro).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{entry.subject}</td>
                        <td className="py-3 px-4 text-gray-600">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold">
                            {entry.group}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {entry.grade?.toFixed(1) || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {entry.observaciones || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteGrade(entry.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Eliminar calificación"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
