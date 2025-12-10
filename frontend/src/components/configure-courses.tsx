"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Edit2, Trash2, Plus, Search, Loader2 } from "lucide-react"
import api from "../axios"
import CourseTeachersList from "./courses-teachers-list"

interface ConfigureCoursesProps {
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
  codigo: string
  nombre: string
  descripcion: string
  maestros?: {
    id: number
    nombre: string
    email: string
    matricula?: string
    grupo: string
  }[]
  created_at: string
  updated_at: string
}

interface EditCourse extends Omit<Course, 'maestros'> {
  maestros: {
    grupo: string
    maestro_id: number
  }[]
}

export default function ConfigureCourses({ onBack }: ConfigureCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
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
    descripcion: string;
    maestros: {
      grupo: string;
      maestro_id: number;
    }[];
  }>({
    codigo: "",
    nombre: "",
    descripcion: "",
    maestros: [],
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

  // Fetch teachers from API
  const fetchTeachers = async () => {
    try {
      const response = await api.get("/maestros")
      setTeachers(response.data)
    } catch (err) {
      console.error("Error fetching teachers:", err)
    }
  }

  useEffect(() => {
    fetchCourses()
    fetchTeachers()
  }, [])

  const filteredCourses = courses.filter((course) => {
    const matchSearch =
      course.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchGrupo = !filterGrupo || course.maestros?.some(maestro =>
      maestro.grupo.toLowerCase().includes(filterGrupo.toLowerCase())
    ) || false
    return matchSearch && matchGrupo
  })

  // Add course
  const handleAddCourse = async () => {
    if (!newCourse.codigo || !newCourse.nombre) {
      alert("Código y nombre son obligatorios")
      return
    }
    if (newCourse.maestros.length === 0) {
      alert("Debe asignar al menos un maestro con su grupo")
      return
    }
    // Validate unique groups
    const grupos = newCourse.maestros.map(m => m.grupo)
    if (new Set(grupos).size !== grupos.length) {
      alert("Los grupos deben ser únicos")
      return
    }
    try {
      setSaving(true)
      await api.post("/materias", {
        codigo: newCourse.codigo.toUpperCase(),
        nombre: newCourse.nombre,
        descripcion: newCourse.descripcion,
        maestros: newCourse.maestros,
      })
      setNewCourse({ codigo: "", nombre: "", descripcion: "", maestros: [] })
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
      maestros: course.maestros?.map(m => ({
        grupo: m.grupo,
        maestro_id: m.id
      })) || []
    })
  }

  const handleSaveEdit = async () => {
    if (!editData || !editingId) return
    if (!editData.codigo || !editData.nombre) {
      alert("Código y nombre son obligatorios")
      return
    }
    if (editData.maestros.length === 0) {
      alert("Debe asignar al menos un maestro con su grupo")
      return
    }
    // Validate unique groups
    const grupos = editData.maestros.map(m => m.grupo)
    if (new Set(grupos).size !== grupos.length) {
      alert("Los grupos deben ser únicos")
      return
    }
    try {
      setSaving(true)
      await api.put(`/materias/${editingId}`, {
        codigo: editData.codigo.toUpperCase(),
        nombre: editData.nombre,
        descripcion: editData.descripcion,
        maestros: editData.maestros,
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
            {/* Maestros por grupo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Maestros por Grupo</label>
              <div className="space-y-2">
                {/* Selected teachers with groups */}
                {newCourse.maestros.map((maestro, idx) => {
                  const teacher = teachers.find(t => t.id === maestro.maestro_id)
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm">
                        Grupo: {maestro.grupo} - {teacher ? `${teacher.nombre} ${teacher.matricula ? `(${teacher.matricula})` : ''}` : 'Maestro no encontrado'}
                      </span>
                      <button
                        onClick={() => {
                          const newMaestros = newCourse.maestros.filter((_, i) => i !== idx)
                          setNewCourse({ ...newCourse, maestros: newMaestros })
                        }}
                        disabled={saving}
                        className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  )
                })}
                {/* Add teacher with group */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Grupo (ej: 10A)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={saving}
                    id="new-group"
                  />
                  <select
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={saving}
                    id="new-teacher"
                  >
                    <option value="">Seleccionar maestro</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.nombre} {teacher.matricula ? `(${teacher.matricula})` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const groupInput = document.getElementById('new-group') as HTMLInputElement
                      const teacherSelect = document.getElementById('new-teacher') as HTMLSelectElement
                      const grupo = groupInput.value.trim()
                      const maestroId = parseInt(teacherSelect.value)

                      if (!grupo || !maestroId) {
                        alert("Debe ingresar grupo y seleccionar maestro")
                        return
                      }

                      if (newCourse.maestros.some(m => m.grupo === grupo)) {
                        alert("Este grupo ya está asignado")
                        return
                      }

                      if (newCourse.maestros.some(m => m.maestro_id === maestroId)) {
                        alert("Este maestro ya está asignado a otro grupo")
                        return
                      }

                      setNewCourse({
                        ...newCourse,
                        maestros: [...newCourse.maestros, { grupo, maestro_id: maestroId }]
                      })

                      groupInput.value = ""
                      teacherSelect.value = ""
                    }}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
                  >
                    Agregar
                  </button>
                </div>
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
                <textarea
                  value={editData.descripcion}
                  onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Descripción"
                  rows={2}
                />

                {/* Maestros por grupo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maestros por Grupo</label>
                  <div className="space-y-2">
                    {/* Selected teachers with groups */}
                    {editData.maestros.map((maestro, idx) => {
                      const teacher = teachers.find(t => t.id === maestro.maestro_id)
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm">
                            Grupo: {maestro.grupo} - {teacher ? `${teacher.nombre} ${teacher.matricula ? `(${teacher.matricula})` : ''}` : 'Maestro no encontrado'}
                          </span>
                          <button
                            onClick={() => {
                              const newMaestros = editData.maestros.filter((_, i) => i !== idx)
                              setEditData({ ...editData, maestros: newMaestros })
                            }}
                            className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs transition"
                          >
                            Eliminar
                          </button>
                        </div>
                      )
                    })}
                    {/* Add teacher with group */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Grupo (ej: 10A)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        id="edit-group"
                      />
                      <select
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        id="edit-teacher"
                      >
                        <option value="">Seleccionar maestro</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.nombre} {teacher.matricula ? `(${teacher.matricula})` : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const groupInput = document.getElementById('edit-group') as HTMLInputElement
                          const teacherSelect = document.getElementById('edit-teacher') as HTMLSelectElement
                          const grupo = groupInput.value.trim()
                          const maestroId = parseInt(teacherSelect.value)

                          if (!grupo || !maestroId) {
                            alert("Debe ingresar grupo y seleccionar maestro")
                            return
                          }

                          if (editData.maestros.some(m => m.grupo === grupo)) {
                            alert("Este grupo ya está asignado")
                            return
                          }

                          if (editData.maestros.some(m => m.maestro_id === maestroId)) {
                            alert("Este maestro ya está asignado a otro grupo")
                            return
                          }

                          setEditData({
                            ...editData,
                            maestros: [...editData.maestros, { grupo, maestro_id: maestroId }]
                          })

                          groupInput.value = ""
                          teacherSelect.value = ""
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      >
                        Agregar
                      </button>
                    </div>
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
                  <div className="flex flex-wrap gap-1">
                    {course.maestros?.map((maestro, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                        {maestro.grupo}
                      </span>
                    )) || <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">Sin grupos</span>}
                  </div>
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
