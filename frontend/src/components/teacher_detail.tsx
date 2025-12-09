"use client"

import { useState } from "react"
import { ArrowLeft, Edit2, Trash2, Save, X } from "lucide-react"

interface TeacherDetailProps {
  teacher: {
    id: string
    matricula: string
    nombre: string
    email: string
    password: string
  }
  onBack: () => void
  onDelete: (id: string) => void
}

export default function TeacherDetail({ teacher, onBack, onDelete }: TeacherDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(teacher)

  const handleSaveEdit = () => {
    setIsEditing(false)
  }

  const handleDeleteTeacher = () => {
    if (confirm("¿Estás seguro de que deseas eliminar este maestro?")) {
      onDelete(teacher.id)
      onBack()
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="text-3xl font-bold text-gray-900">Detalle del Maestro</h2>
      </div>

      {/* Teacher Info Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{isEditing ? editData.nombre : teacher.nombre}</h3>
            <p className="text-gray-600">Matrícula: {teacher.matricula}</p>
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
                  onClick={handleDeleteTeacher}
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
                    setEditData(teacher)
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-900">{teacher.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Matrícula</p>
              <p className="text-lg font-semibold text-gray-900">{teacher.matricula}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
