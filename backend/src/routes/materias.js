// backend/src/routes/materias.js
import { Router } from "express";
import { Materia, Usuario, Alumno, MateriaMaestro } from "../models/index.js";

const router = Router();

// GET /materias - Obtener todas las materias
router.get("/", async (req, res) => {
  try {
    const materias = await Materia.findAll({
      include: [{
        model: MateriaMaestro,
        as: 'materiaMaestros',
        include: [{
          model: Usuario,
          as: 'maestro',
          attributes: ['id', 'nombre', 'email', 'matricula']
        }],
        required: false
      }],
      order: [['created_at', 'DESC']]
    });

    // Transformar la respuesta para incluir maestros con sus grupos
    const transformedMaterias = materias.map(materia => ({
      ...materia.toJSON(),
      maestros: materia.materiaMaestros ? materia.materiaMaestros.map(mm => ({
        id: mm.maestro.id,
        nombre: mm.maestro.nombre,
        email: mm.maestro.email,
        matricula: mm.maestro.matricula,
        grupo: mm.grupo
      })) : []
    }));

    res.json(transformedMaterias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener materias" });
  }
});

// GET /materias/:id - Obtener una materia por ID
router.get("/:id", async (req, res) => {
  try {
    const materia = await Materia.findByPk(req.params.id, {
      include: [{
        model: MateriaMaestro,
        as: 'materiaMaestros',
        include: [{
          model: Usuario,
          as: 'maestro',
          attributes: ['id', 'nombre', 'email', 'matricula']
        }],
        required: false
      }]
    });
    if (!materia) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    // Transformar la respuesta para incluir maestros con sus grupos
    const transformedMateria = {
      ...materia.toJSON(),
      maestros: materia.materiaMaestros ? materia.materiaMaestros.map(mm => ({
        id: mm.maestro.id,
        nombre: mm.maestro.nombre,
        email: mm.maestro.email,
        matricula: mm.maestro.matricula,
        grupo: mm.grupo
      })) : []
    };

    res.json(transformedMateria);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener materia" });
  }
});

// GET /materias/:courseId/maestros/:teacherId/alumnos - Obtener alumnos de un profesor en una materia
router.get("/:courseId/maestros/:teacherId/alumnos", async (req, res) => {
  try {
    const { courseId, teacherId } = req.params;

    // Buscar la materia
    const materia = await Materia.findByPk(courseId);
    if (!materia) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    // Buscar el profesor por ID
    const teacher = await Usuario.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Profesor no encontrado" });
    }

    // Verificar si el profesor está asignado a la materia y obtener el grupo
    const materiaMaestro = await MateriaMaestro.findOne({
      where: { materia_id: courseId, usuario_id: teacherId }
    });

    if (!materiaMaestro) {
      return res.status(403).json({ message: "El profesor no está asignado a esta materia" });
    }

    // Obtener alumnos del grupo asignado al profesor en esta materia
    const students = await Alumno.findAll({
      where: { grupo: materiaMaestro.grupo },
      order: [['nombre', 'ASC']]
    });

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener alumnos" });
  }
});

// POST /materias
router.post("/", async (req, res) => {
  const { codigo, nombre, descripcion, maestros } = req.body;

  if (!codigo || !nombre) {
    return res.status(400).json({ message: "Código y nombre son obligatorios" });
  }

  // Validar que maestros sea un array de objetos con grupo y maestro_id
  if (!maestros || !Array.isArray(maestros)) {
    return res.status(400).json({ message: "Maestros debe ser un array de objetos con grupo y maestro_id" });
  }

  // Validar que cada maestro tenga grupo y maestro_id, y que los grupos sean únicos
  const grupos = new Set();
  for (const maestro of maestros) {
    if (!maestro.grupo || !maestro.maestro_id) {
      return res.status(400).json({ message: "Cada maestro debe tener grupo y maestro_id" });
    }
    if (grupos.has(maestro.grupo)) {
      return res.status(400).json({ message: "Los grupos deben ser únicos" });
    }
    grupos.add(maestro.grupo);
  }

  try {
    const newMateria = await Materia.create({
      codigo,
      nombre,
      descripcion,
      // No longer storing grupo in Materia, it's in MateriaMaestro
    });

    // Crear las relaciones en MateriaMaestro
    const materiaMaestrosData = maestros.map(maestro => ({
      materia_id: newMateria.id,
      usuario_id: maestro.maestro_id,
      grupo: maestro.grupo
    }));

    await MateriaMaestro.bulkCreate(materiaMaestrosData);

    // Obtener la materia creada con los maestros incluidos
    const materiaCreada = await Materia.findByPk(newMateria.id, {
      include: [{
        model: MateriaMaestro,
        as: 'materiaMaestros',
        include: [{
          model: Usuario,
          as: 'maestro',
          attributes: ['id', 'nombre', 'email', 'matricula']
        }],
        required: false
      }]
    });

    // Transformar la respuesta
    const transformedMateria = {
      ...materiaCreada.toJSON(),
      maestros: materiaCreada.materiaMaestros ? materiaCreada.materiaMaestros.map(mm => ({
        id: mm.maestro.id,
        nombre: mm.maestro.nombre,
        email: mm.maestro.email,
        matricula: mm.maestro.matricula,
        grupo: mm.grupo
      })) : []
    };

    res.json(transformedMateria);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear materia" });
  }
});

// PUT /materias/:id - Actualizar una materia
router.put("/:id", async (req, res) => {
  const { codigo, nombre, descripcion, maestros } = req.body;

  if (!codigo || !nombre) {
    return res.status(400).json({ message: "Código y nombre son obligatorios" });
  }

  // Validar que maestros sea un array de objetos con grupo y maestro_id
  if (!maestros || !Array.isArray(maestros)) {
    return res.status(400).json({ message: "Maestros debe ser un array de objetos con grupo y maestro_id" });
  }

  // Validar que cada maestro tenga grupo y maestro_id, y que los grupos sean únicos
  const grupos = new Set();
  for (const maestro of maestros) {
    if (!maestro.grupo || !maestro.maestro_id) {
      return res.status(400).json({ message: "Cada maestro debe tener grupo y maestro_id" });
    }
    if (grupos.has(maestro.grupo)) {
      return res.status(400).json({ message: "Los grupos deben ser únicos" });
    }
    grupos.add(maestro.grupo);
  }

  try {
    const materia = await Materia.findByPk(req.params.id);
    if (!materia) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    await materia.update({
      codigo,
      nombre,
      descripcion,
    });

    // Eliminar las relaciones existentes en MateriaMaestro
    await MateriaMaestro.destroy({
      where: { materia_id: req.params.id }
    });

    // Crear las nuevas relaciones en MateriaMaestro
    const materiaMaestrosData = maestros.map(maestro => ({
      materia_id: req.params.id,
      usuario_id: maestro.maestro_id,
      grupo: maestro.grupo
    }));

    await MateriaMaestro.bulkCreate(materiaMaestrosData);

    // Obtener la materia actualizada con los maestros incluidos
    const materiaActualizada = await Materia.findByPk(req.params.id, {
      include: [{
        model: MateriaMaestro,
        as: 'materiaMaestros',
        include: [{
          model: Usuario,
          as: 'maestro',
          attributes: ['id', 'nombre', 'email', 'matricula']
        }],
        required: false
      }]
    });

    // Transformar la respuesta
    const transformedMateria = {
      ...materiaActualizada.toJSON(),
      maestros: materiaActualizada.materiaMaestros ? materiaActualizada.materiaMaestros.map(mm => ({
        id: mm.maestro.id,
        nombre: mm.maestro.nombre,
        email: mm.maestro.email,
        matricula: mm.maestro.matricula,
        grupo: mm.grupo
      })) : []
    };

    res.json(transformedMateria);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar materia" });
  }
});

// DELETE /materias/:id - Eliminar una materia
router.delete("/:id", async (req, res) => {
  try {
    const materia = await Materia.findByPk(req.params.id);
    if (!materia) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    await materia.destroy();
    res.json({ message: "Materia eliminada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar materia" });
  }
});

export default router;
