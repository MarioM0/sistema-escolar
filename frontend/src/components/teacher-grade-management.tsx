"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import { useAuth } from "../context/auth-context"

interface TeacherGradeManagementProps {
  onBack: () => void
}

interface StudentGrade {
  id: number
  studentId: number
  name: string
  matricula: string
  group: string
  currentGrade: number | null
  newGrade: number | null
  status: "pendiente" | "guardado"
}

export default function TeacherGradeManagement({ onBack }: TeacherGradeManagementProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user: authUser } = useAuth()

  useEffect(() => {
    const fetchGrades = async () => {
      if (!authUser?.id) return

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/maestros/${authUser.id}/grades`)
        if (response.ok) {
          const data = await response.json()
          const grades = data.map((grade: any) => ({
            id: grade.id,
            studentId: grade.studentId,
            name: grade.name,
            matricula: grade.matricula,
            group: grade.group,
            currentGrade: grade.currentGrade,
            newGrade: grade.newGrade,
            status: "guardado" as const
          }))
          setStudentGrades(grades)

          // Extract unique groups
          const uniqueGroups = [...new Set(grades.map((g: StudentGrade) => g.group))] as string[]
          setGroups(uniqueGroups)
        }
      } catch (error) {
        console.error("Error fetching grades:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGrades()
  }, [authUser?.id])

  const filteredGrades = selectedGroup ? studentGrades.filter((s) => s.group === selectedGroup) : studentGrades

  const handleGradeChange = (id: number, newGrade: number) => {
    setStudentGrades((prev) =>
      prev.map((student) =>
        student.id === id
          ? {
              ...student,
              newGrade: Math.min(10, Math.max(0, newGrade)),
              status: student.currentGrade !== newGrade ? "pendiente" : "guardado",
            }
          : student,
      ),
    )
  }

  const handleSaveGrade = async (id: number) => {
    if (!authUser?.id) return

    setSaving(true)
    try {
      const student = studentGrades.find(s => s.id === id)
      if (student) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/maestros/${authUser.id}/grades`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grades: [{
              studentId: student.studentId,
              newGrade: student.newGrade
            }]
          }),
        })

        if (response.ok) {
          setStudentGrades((prev) =>
            prev.map((s) =>
              s.id === id
                ? {
                    ...s,
                    currentGrade: s.newGrade,
                    status: "guardado",
                  }
                : s,
            ),
          )
        }
      }
    } catch (error) {
      console.error("Error saving grade:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAll = async () => {
    if (!authUser?.id) return

    setSaving(true)
    try {
      const pendingGrades = studentGrades.filter(s => s.status === "pendiente")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/maestros/${authUser.id}/grades`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grades: pendingGrades.map(s => ({
            studentId: s.studentId,
            newGrade: s.newGrade
          }))
        }),
      })

      if (response.ok) {
        setStudentGrades((prev) =>
          prev.map((student) => ({
            ...student,
            currentGrade: student.newGrade,
            status: "guardado",
          })),
        )
      }
    } catch (error) {
      console.error("Error saving all grades:", error)
    } finally {
      setSaving(false)
    }
  }

  const pendingCount = studentGrades.filter((s) => s.status === "pendiente").length

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
                onClick={handleSaveAll}
                disabled={saving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                <Save size={20} />
                {saving ? "Guardando..." : "Guardar todo"}
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Matrícula</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Grupo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Calificación Actual</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Nueva Calificación</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{student.name}</td>
                    <td className="py-3 px-4 text-gray-600">{student.matricula}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold">
                        {student.group}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">
                        {student.currentGrade ? student.currentGrade.toFixed(1) : "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={student.newGrade ?? ""}
                        onChange={(e) => handleGradeChange(student.id, Number.parseFloat(e.target.value) || 0)}
                        className={`w-20 px-3 py-2 rounded-lg border ${
                          student.status === "pendiente" ? "border-yellow-400 bg-yellow-50" : "border-gray-200 bg-white"
                        } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </td>
                    <td className="py-3 px-4">
                      {student.status === "pendiente" ? (
                        <button
                          onClick={() => handleSaveGrade(student.id)}
                          disabled={saving}
                          className="text-green-600 hover:text-green-700 disabled:text-green-400 font-semibold transition flex items-center gap-1"
                        >
                          <Save size={16} />
                          {saving ? "Guardando..." : "Guardar"}
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-gray-500">Guardado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
