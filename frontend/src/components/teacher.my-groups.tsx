"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Users, TrendingUp } from "lucide-react"
import { useAuth } from "../context/auth-context"

interface TeacherMyGroupsProps {
  onBack: () => void
}

interface Group {
  id: number
  name: string
  grade: string
  subject: string
  students: number
  avgGrade: number
}

interface Student {
  id: number
  name: string
  matricula: string
  grade: number | null
  status: string
}

export default function TeacherMyGroups({ onBack }: TeacherMyGroupsProps) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [groupStudents, setGroupStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const { user: authUser } = useAuth()

  useEffect(() => {
    const fetchGroups = async () => {
      if (!authUser?.id) return

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/maestros/${authUser.id}/groups`)
        if (response.ok) {
          const data = await response.json()
          setGroups(data)
        }
      } catch (error) {
        console.error("Error fetching groups:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [authUser?.id])

  const fetchGroupStudents = async (groupId: number) => {
    if (!authUser?.id) return

    setLoadingStudents(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/maestros/${authUser.id}/groups/${groupId}/students`)
      if (response.ok) {
        const data = await response.json()
        setGroupStudents(data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group)
    fetchGroupStudents(group.id)
  }

  if (selectedGroup) {
    return (
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex gap-3 mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition"
            >
              <ArrowLeft size={20} />
              Volver al Panel
            </button>
            <button
              onClick={() => setSelectedGroup(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition"
            >
              <ArrowLeft size={20} />
              Volver a Grupos
            </button>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Grupo {selectedGroup.name} - {selectedGroup.subject}
          </h2>
          <p className="text-gray-600 mt-2">Grado: {selectedGroup.grade}</p>
        </div>

        {/* Group Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-600">Total de Estudiantes</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{selectedGroup.students}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-medium text-gray-600">Promedio del Grupo</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{selectedGroup.avgGrade.toFixed(2)}</p>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Lista de Estudiantes</h3>
          {loadingStudents ? (
            <p className="text-center text-gray-600">Cargando estudiantes...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Nombre</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Matrícula</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Calificación</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {groupStudents.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition text-left">
                      <td className="py-3 px-4 text-gray-900">{student.name}</td>
                      <td className="py-3 px-4 text-gray-600">{student.matricula}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${student.grade && student.grade >= 6 ? "text-green-600" : "text-red-600"}`}>
                          {student.grade ? student.grade.toFixed(1) : "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            student.status === "aprobado" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {student.status === "aprobado" ? "Aprobado" : "Reprobado"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Mis Grupos y Alumnos</h2>
        <p className="text-gray-600">Selecciona un grupo para ver sus alumnos y calificaciones</p>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <p className="text-center text-gray-600">Cargando grupos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleGroupSelect(group)}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Grupo {group.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{group.subject}</p>
                </div>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold">
                  {group.grade}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Estudiantes</p>
                  <p className="text-2xl font-bold text-gray-900">{group.students}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Promedio</p>
                  <p className="text-2xl font-bold text-green-600">{group.avgGrade.toFixed(1)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
