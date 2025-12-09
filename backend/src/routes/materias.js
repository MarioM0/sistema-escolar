// backend/src/routes/materias.js
import { Router } from "express";
import { Materia, Usuario, Alumno, MateriaMaestro } from "../models/index.js";

const router = Router();

// GET /materias - Obtener todas las materias
router.get("/", async (req, res) => {
  try {
    const materias = await Materia.findAll({
      include: [{
        model: Usuario,
        as: 'maestros',
        attributes: ['id', 'nombre', 'email', 'matricula'],
        through: { attributes: [] }, // No incluir atributos de la tabla intermedia
        required: false
      }],
      order: [['created_at', 'DESC']]
    });

    // Obtener maestros principales por separado
    const maestroIds = [...new Set(materias.map(m => m.maestro_id).filter(id => id !== null))];
    const maestrosPrincipales = maestroIds.length > 0 ? await Usuario.findAll({
      where: { id: maestroIds },
      attributes: ['id', 'nombre', 'email']
    }) : [];

    const maestrosPrincipalesMap = maestrosPrincipales.reduce((acc, maestro) => {
      acc[maestro.id] = maestro;
      return acc;
    }, {});

    // Transformar la respuesta para incluir maestros como array de objetos con id y nombre
    const transformedMaterias = materias.map(materia => {
      const maestrosManyToMany = materia.maestros ? materia.maestros.map(maestro => ({
        id: maestro.id,
        nombre: maestro.nombre,
        email: maestro.email,
        matricula: maestro.matricula
      })) : [];

      // Agregar maestro principal si existe y no está ya en la lista
      const maestroPrincipal = materia.maestro_id && maestrosPrincipalesMap[materia.maestro_id];
      if (maestroPrincipal && !maestrosManyToMany.some(m => m.id === maestroPrincipal.id)) {
        maestrosManyToMany.unshift({
          id: maestroPrincipal.id,
          nombre: maestroPrincipal.nombre,
          email: maestroPrincipal.email,
          matricula: maestroPrincipal.matricula
        });
      }

      return {
        ...materia.toJSON(),
        maestros: maestrosManyToMany
      };
    });

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
        model: Usuario,
        as: 'maestros',
        attributes: ['id', 'nombre', 'email'],
        through: { attributes: [] },
        required: false
      }]
    });
    if (!materia) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    // Transformar la respuesta para incluir maestros como array de objetos
    const transformedMateria = {
      ...materia.toJSON(),
      maestros: materia.maestros ? materia.maestros.map(maestro => ({
        id: maestro.id,
        nombre: maestro.nombre,
        email: maestro.email,
        matricula: maestro.matricula
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

    // Verificar si el profesor está asignado a la materia
    const isAssignedAsPrincipal = materia.maestro_id === teacher.id;
    const isAssignedAsSecondary = await MateriaMaestro.findOne({
      where: { materia_id: courseId, usuario_id: teacher.id }
    });

    if (!isAssignedAsPrincipal && !isAssignedAsSecondary) {
      return res.status(403).json({ message: "El profesor no está asignado a esta materia" });
    }

    // Obtener alumnos del grupo de la materia
    const students = await Alumno.findAll({
      where: { grupo: materia.grupo },
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
  const { codigo, nombre, descripcion, maestros, grupo, maestro_id } = req.body;

  if (!codigo || !nombre || !grupo) {
    return res.status(400).json({ message: "Código, nombre y grupo son obligatorios" });
  }

  try {
    const newMateria = await Materia.create({
      codigo,
      nombre,
      descripcion,
      grupo,
      maestro_id: maestro_id || null,
    });

    // Crear las relaciones many-to-many con maestros
    let maestrosToSet = maestros && Array.isArray(maestros) ? [...maestros] : [];
    if (maestro_id && !maestrosToSet.includes(maestro_id)) {
      maestrosToSet.push(maestro_id);
    }

    // Convertir todos los maestros a IDs si son strings
    if (maestrosToSet.length > 0) {
      const maestrosIds = [];
      const maestrosNombres = [];

      // Separar IDs y nombres
      maestrosToSet.forEach(maestro => {
        if (typeof maestro === 'string') {
          maestrosNombres.push(maestro);
        } else if (typeof maestro === 'number') {
          maestrosIds.push(maestro);
        }
      });

      // Buscar IDs por nombres
      if (maestrosNombres.length > 0) {
        const maestrosEncontrados = await Usuario.findAll({
          where: { nombre: maestrosNombres },
          attributes: ['id']
        });
        maestrosIds.push(...maestrosEncontrados.map(m => m.id));
      }

      // Eliminar duplicados
      maestrosToSet = [...new Set(maestrosIds)];
    }

    if (maestrosToSet.length > 0) {
      await newMateria.setMaestros(maestrosToSet);
    }

    // Obtener la materia creada con los maestros incluidos
    const materiaCreada = await Materia.findByPk(newMateria.id, {
      include: [{
        model: Usuario,
        as: 'maestros',
        attributes: ['id', 'nombre', 'email'],
        through: { attributes: [] },
        required: false
      }]
    });

    // Transformar la respuesta
    const transformedMateria = {
      ...materiaCreada.toJSON(),
      maestros: materiaCreada.maestros ? materiaCreada.maestros.map(maestro => ({
        id: maestro.id,
        nombre: maestro.nombre,
        email: maestro.email,
        matricula: maestro.matricula
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
  const { codigo, nombre, descripcion, maestros, grupo, maestro_id } = req.body;

  try {
    const materia = await Materia.findByPk(req.params.id);
    if (!materia) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    await materia.update({
      codigo,
      nombre,
      descripcion,
      grupo,
      maestro_id: maestro_id || null,
    });

    // Actualizar las relaciones many-to-many con maestros
    if (maestros && Array.isArray(maestros)) {
      // Si maestros contiene strings (nombres), convertir a IDs
      let maestrosIds = maestros;
      if (maestros.length > 0 && typeof maestros[0] === 'string') {
        const maestrosEncontrados = await Usuario.findAll({
          where: { nombre: maestros },
          attributes: ['id']
        });
        maestrosIds = maestrosEncontrados.map(m => m.id);
      }
      await materia.setMaestros(maestrosIds);
    }

    // Obtener la materia actualizada con los maestros incluidos
    const materiaActualizada = await Materia.findByPk(req.params.id, {
      include: [{
        model: Usuario,
        as: 'maestros',
        attributes: ['id', 'nombre', 'email', 'matricula'],
        through: { attributes: [] },
        required: false
      }]
    });

    // Transformar la respuesta
    const transformedMateria = {
      ...materiaActualizada.toJSON(),
      maestros: materiaActualizada.maestros ? materiaActualizada.maestros.map(maestro => ({
        id: maestro.id,
        nombre: maestro.nombre,
        email: maestro.email,
        matricula: maestro.matricula
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
