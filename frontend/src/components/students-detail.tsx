"use client"

import { useState } from "react"
import { ArrowLeft, Edit2, Trash2, Save, X } from "lucide-react"
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

interface Subject {
  id: string
  nombre: string
  codigo: string
  maestro: string
  calificacion: number
}

export default function StudentDetail({ student, onBack, onDelete, onUpdate }: StudentDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(student)
  const [subjects] = useState<Subject[]>([
    { id: "1", nombre: "Matemáticas", codigo: "MAT101", maestro: "Prof. García", calificacion: 8.5 },
    { id: "2", nombre: "Español", codigo: "ESP101", maestro: "Prof. López", calificacion: 9.0 },
    { id: "3", nombre: "Inglés", codigo: "ENG101", maestro: "Prof. Smith", calificacion: 8.0 },
    { id: "4", nombre: "Historia", codigo: "HIS101", maestro: "Prof. Martínez", calificacion: 8.7 },
  ])

  const promedio =
    subjects.length > 0 ? (subjects.reduce((sum, s) => sum + s.calificacion, 0) / subjects.length).toFixed(2) : "0"

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
              <p className="text-lg font-semibold text-green-600">{promedio}</p>
            </div>
          </div>
        )}
      </div>

      {/* Subjects and Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subjects Table */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Materias y Calificaciones</h3>
          <div className="space-y-3">
            {subjects.map((subject) => (
              <div key={subject.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{subject.nombre}</p>
                    <p className="text-sm text-gray-600">Código: {subject.codigo}</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{subject.calificacion}</span>
                </div>
                <p className="text-sm text-gray-600">Prof. {subject.maestro}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen Académico</h3>
          <div className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Promedio General</p>
              <p className="text-4xl font-bold text-blue-600">{promedio}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Materias Cursadas</p>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Grupo</p>
              <p className="text-lg font-semibold text-gray-900">
                {student.grupo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
