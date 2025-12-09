"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Edit2, Trash2, Plus, Search, Loader2 } from "lucide-react"
import api from "../axios"
import CourseTeachersList from "./courses-teachers-list"

interface ConfigureCoursesProps {
  onBack: () => void
}

interface Course {
  id: number
  codigo: string
  nombre: string
  grupo: string
  descripcion: string
  maestro_id?: number | null
  maestros?: {
    id: number
    nombre: string
    email: string
    matricula?: string
  }[]
  created_at: string
  updated_at: string
}

interface EditCourse extends Omit<Course, 'maestros'> {
  maestros: string[]
}

export default function ConfigureCourses({ onBack }: ConfigureCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterGrupo, setFilterGrupo] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<EditCourse | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [newCourse, setNewCourse] = useState<{
    codigo: string;
    nombre: string;
    grupo: string;
    descripcion: string;
    maestros: string[];
    maestro_id: number | null;
  }>({
    codigo: "",
    nombre: "",
    grupo: "10A",
    descripcion: "",
    maestros: [],
    maestro_id: null,
  })

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await api.get("/materias")
      setCourses(response.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError("Error al cargar las materias")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const filteredCourses = courses.filter((course) => {
    const matchSearch =
      course.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchGrupo = !filterGrupo || course.grupo.toLowerCase().includes(filterGrupo.toLowerCase())
    return matchSearch && matchGrupo
  })

  // Add course
  const handleAddCourse = async () => {
    if (!newCourse.codigo || !newCourse.nombre || !newCourse.grupo) {
      alert("Código, nombre y grupo son obligatorios")
      return
    }
    try {
      setSaving(true)
      await api.post("/materias", {
        codigo: newCourse.codigo.toUpperCase(),
        nombre: newCourse.nombre,
        descripcion: newCourse.descripcion,
        maestros: newCourse.maestros,
        grupo: newCourse.grupo,
        maestro_id: newCourse.maestro_id,
      })
      setNewCourse({ codigo: "", nombre: "", grupo: "10A", descripcion: "", maestros: [], maestro_id: null })
      setShowAddForm(false)
      fetchCourses()
    } catch (err) {
      console.error("Error creating course:", err)
      alert("Error al crear la materia")
    } finally {
      setSaving(false)
    }
  }

  // Edit course
  const handleEditCourse = (course: Course) => {
    setEditingId(course.id)
    setEditData({
      ...course,
      maestros: course.maestros?.map(m => m.nombre) || []
    })
  }

  const handleSaveEdit = async () => {
    if (!editData || !editingId) return
    try {
      setSaving(true)
      await api.put(`/materias/${editingId}`, {
        codigo: editData.codigo.toUpperCase(),
        nombre: editData.nombre,
        descripcion: editData.descripcion,
        maestros: editData.maestros?.filter(m => m && m.trim() !== "") || [],
        grupo: editData.grupo,
        maestro_id: editData.maestro_id,
      })
      setEditingId(null)
      setEditData(null)
      fetchCourses()
    } catch (err) {
      console.error("Error updating course:", err)
      alert("Error al actualizar la materia")
    } finally {
      setSaving(false)
    }
  }

  // Delete course
  const handleDeleteCourse = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta materia?")) return
    try {
      await api.delete(`/materias/${id}`)
      fetchCourses()
    } catch (err) {
      console.error("Error deleting course:", err)
      alert("Error al eliminar la materia")
    }
  }

  const selectedCourse = selectedCourseId ? courses.find((c) => c.id === selectedCourseId) : null

  if (selectedCourseId) {
    return (
      <CourseTeachersList
        courseId={selectedCourseId.toString()}
        courseName={selectedCourse?.nombre || "Materia"}
        onBack={() => setSelectedCourseId(null)}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando materias...</p>
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
            onClick={fetchCourses}
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
        <h2 className="text-3xl font-bold text-gray-900">Configurar Cursos</h2>
      </div>

      {/* Add Course Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
        >
          <Plus size={20} />
          Nueva Materia
        </button>
      </div>

      {/* Add Course Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Agregar Nueva Materia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
              <input
                type="text"
                value={newCourse.codigo}
                onChange={(e) => setNewCourse({ ...newCourse, codigo: e.target.value.toUpperCase() })}
                placeholder="Ej: MAT101"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                value={newCourse.nombre}
                onChange={(e) => setNewCourse({ ...newCourse, nombre: e.target.value })}
                placeholder="Ej: Matemáticas"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grupo</label>
              <input
                type="text"
                value={newCourse.grupo}
                onChange={(e) => setNewCourse({ ...newCourse, grupo: e.target.value })}
                placeholder="Ej: 10A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maestro Principal (ID)</label>
              <input
                type="number"
                value={newCourse.maestro_id || ""}
                onChange={(e) => setNewCourse({ ...newCourse, maestro_id: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="ID del maestro principal"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={saving}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={newCourse.descripcion}
                onChange={(e) => setNewCourse({ ...newCourse, descripcion: e.target.value })}
                placeholder="Descripción de la materia..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                disabled={saving}
              />
            </div>
            {/* Maestros */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Maestros</label>
              <div className="space-y-2">
                {newCourse.maestros.map((maestro, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={maestro}
                      onChange={(e) => {
                        const newMaestros = [...newCourse.maestros]
                        newMaestros[idx] = e.target.value
                        setNewCourse({ ...newCourse, maestros: newMaestros })
                      }}
                      placeholder="Nombre del maestro"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      disabled={saving}
                    />
                    <button
                      onClick={() => {
                        const newMaestros = newCourse.maestros.filter((_, i) => i !== idx)
                        setNewCourse({ ...newCourse, maestros: newMaestros })
                      }}
                      disabled={saving}
                      className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setNewCourse({ ...newCourse, maestros: [...newCourse.maestros, ""] })}
                  disabled={saving}
                  className="w-full px-4 py-2 border border-dashed border-gray-300 text-gray-600 hover:border-blue-600 hover:text-blue-600 rounded-lg transition"
                >
                  + Agregar Maestro
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddCourse}
              disabled={saving}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition font-semibold flex items-center gap-2"
            >
              {saving && <Loader2 className="animate-spin h-4 w-4" />}
              {saving ? "Guardando..." : "Guardar Materia"}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              disabled={saving}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-900 rounded-lg transition font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <input
            type="text"
            placeholder="Filtrar por grupo..."
            value={filterGrupo}
            onChange={(e) => setFilterGrupo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
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

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white border border-gray-200 rounded-2xl p-6">
            {editingId === course.id && editData ? (
              // Edit Mode
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData.codigo}
                  onChange={(e) => setEditData({ ...editData, codigo: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Código"
                />
                <input
                  type="text"
                  value={editData.nombre}
                  onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nombre"
                />
                <input
                  type="text"
                  value={editData.grupo}
                  onChange={(e) => setEditData({ ...editData, grupo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Grupo"
                />
                <input
                  type="number"
                  value={editData.maestro_id || ""}
                  onChange={(e) => setEditData({ ...editData, maestro_id: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Maestro Principal (ID)"
                />
                <textarea
                  value={editData.descripcion}
                  onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Descripción"
                  rows={2}
                />

                {/* Maestros */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maestros</label>
                  <div className="space-y-2">
                    {editData.maestros.map((maestro, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={maestro}
                          onChange={(e) => {
                            const newMaestros = [...editData.maestros]
                            newMaestros[idx] = e.target.value
                            setEditData({ ...editData, maestros: newMaestros })
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                          onClick={() => {
                            const newMaestros = editData.maestros.filter((_, i) => i !== idx)
                            setEditData({ ...editData, maestros: newMaestros })
                          }}
                          className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setEditData({ ...editData, maestros: [...editData.maestros, ""] })}
                      className="w-full px-4 py-2 border border-dashed border-gray-300 text-gray-600 hover:border-blue-600 hover:text-blue-600 rounded-lg transition"
                    >
                      + Agregar Maestro
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3
                      onClick={() => setSelectedCourseId(course.id)}
                      className="text-xl font-bold cursor-pointer hover:text-blue-600 transition"
                    >
                      {course.nombre}
                    </h3>
                    <p className="text-sm text-gray-600">Código: {course.codigo}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold">
                    Grado {course.grupo}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{course.descripcion}</p>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">Maestros Asignados</p>
                  <div className="flex flex-wrap gap-2">
                    {course.maestros?.length ? (
                      course.maestros.map((maestro, i) => (
                        <span key={i} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                          {maestro.nombre} (ID: {maestro.id})
                        </span>
                      ))
                    ) : (
                      <span className="text-orange-600 text-xs">Sin maestro asignado</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="flex-1 flex items-center justify-center gap-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition font-semibold"
                  >
                    <Edit2 size={18} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition font-semibold"
                  >
                    <Trash2 size={18} />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron materias</p>
        </div>
      )}
    </div>
  )
}
