import { Router } from "express";
import { Usuario, Materia, Alumno, Calificacion } from "../models/index.js";
import bcrypt from "bcrypt";

const router = Router();

// Obtener conteo de maestros
router.get("/count", async (req, res) => {
  try {
    const count = await Usuario.count({ where: { rol: "MAESTRO" } });
    res.json({ count });
  } catch (error) {
    console.error("Error al obtener el conteo de maestros:", error);
    res.status(500).json({ message: "Error al obtener el conteo de maestros" });
  }
});

router.post("/", async (req, res) => {
  const { nombre, email, password, matricula } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const newMaestro = await Usuario.create({ nombre, email, password_hash: hash, rol: "MAESTRO", matricula });
    res.json(newMaestro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear maestro" });
  }
});

// GET /maestros - Obtener todos los maestros
router.get("/", async (req, res) => {
  try {
    const maestros = await Usuario.findAll({
      where: { rol: "MAESTRO" },
      attributes: ['id', 'nombre', 'email', 'matricula']
    });
    res.json(maestros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener maestros" });
  }
});

// GET /maestros/:id - Obtener un maestro por ID
router.get("/:id", async (req, res) => {
  try {
    const maestro = await Usuario.findOne({
      where: { id: req.params.id, rol: "MAESTRO" },
      attributes: ['id', 'nombre', 'email', 'matricula']
    });
    if (!maestro) {
      return res.status(404).json({ message: "Maestro no encontrado" });
    }
    res.json(maestro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener maestro" });
  }
});

// PUT /maestros/:id - Actualizar un maestro
router.put("/:id", async (req, res) => {
  const { nombre, email, matricula } = req.body;
  try {
    const maestro = await Usuario.findOne({
      where: { id: req.params.id, rol: "MAESTRO" }
    });
    if (!maestro) {
      return res.status(404).json({ message: "Maestro no encontrado" });
    }
    await maestro.update({ nombre, email, matricula });
    res.json(maestro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar maestro" });
  }
});

// DELETE /maestros/:id - Eliminar un maestro
router.delete("/:id", async (req, res) => {
  try {
    const maestro = await Usuario.findOne({
      where: { id: req.params.id, rol: "MAESTRO" }
    });
    if (!maestro) {
      return res.status(404).json({ message: "Maestro no encontrado" });
    }
    await maestro.destroy();
    res.json({ message: "Maestro eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar maestro" });
  }
});

// GET /maestros/:id/stats - Estadísticas del dashboard del maestro
router.get("/:id/stats", async (req, res) => {
  try {
    const maestro = await Usuario.findOne({
      where: { id: req.params.id, rol: "MAESTRO" }
    });
    if (!maestro) {
      return res.status(404).json({ message: "Maestro no encontrado" });
    }

    // Obtener grupos (materias asignadas)
    const grupos = await Materia.findAll({
      where: { maestro_id: req.params.id },
      attributes: ['id', 'codigo', 'nombre', 'grupo']
    });

    // Obtener estudiantes totales (alumnos en grupos asignados)
    const gruposIds = grupos.map(g => g.id);
    const estudiantesTotales = await Alumno.count({
      where: { grupo: grupos.map(g => g.grupo) }
    });

    // Obtener promedio general de calificaciones
    const calificaciones = await Calificacion.findAll({
      where: { maestro_id: req.params.id },
      attributes: ['nota']
    });
    const notas = calificaciones.map(c => c.nota).filter(n => n !== null);
    const promedio = notas.length > 0 ? notas.reduce((sum, n) => sum + n, 0) / notas.length : 0;

    res.json({
      groups: grupos.length,
      students: estudiantesTotales,
      avgGrade: Math.round(promedio * 100) / 100
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});

// GET /maestros/:id/groups - Grupos del maestro
router.get("/:id/groups", async (req, res) => {
  try {
    const maestro = await Usuario.findOne({
      where: { id: req.params.id, rol: "MAESTRO" }
    });
    if (!maestro) {
      return res.status(404).json({ message: "Maestro no encontrado" });
    }

    const grupos = await Materia.findAll({
      where: { maestro_id: req.params.id },
      attributes: ['id', 'codigo', 'nombre', 'grupo']
    });

    const groupsWithStats = await Promise.all(grupos.map(async (grupo) => {
      const estudiantes = await Alumno.count({
        where: { grupo: grupo.grupo }
      });

      const calificaciones = await Calificacion.findAll({
        where: { maestro_id: req.params.id },
        include: [{
          model: Alumno,
          as: 'alumno',
          where: { grupo: grupo.grupo },
          attributes: []
        }],
        attributes: ['nota']
      });
      const notas = calificaciones.map(c => c.nota).filter(n => n !== null);
      const avgGrade = notas.length > 0 ? notas.reduce((sum, n) => sum + n, 0) / notas.length : 0;

      return {
        id: grupo.id,
        name: grupo.grupo,
        grade: grupo.nombre, // Usando nombre como grado
        subject: grupo.nombre,
        students: estudiantes,
        avgGrade: Math.round(avgGrade * 100) / 100
      };
    }));

    res.json(groupsWithStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener grupos" });
  }
});

// GET /maestros/:id/groups/:groupId/students - Estudiantes en un grupo
router.get("/:id/groups/:groupId/students", async (req, res) => {
  try {
    const maestro = await Usuario.findOne({
      where: { id: req.params.id, rol: "MAESTRO" }
    });
    if (!maestro) {
      return res.status(404).json({ message: "Maestro no encontrado" });
    }

    const grupo = await Materia.findByPk(req.params.groupId);
    if (!grupo) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    const estudiantes = await Alumno.findAll({
      where: { grupo: grupo.grupo },
      attributes: ['id', 'nombre', 'matricula']
    });

    const studentsWithGrades = await Promise.all(estudiantes.map(async (estudiante) => {
      const calificacion = await Calificacion.findOne({
        where: { alumno_id: estudiante.id, maestro_id: req.params.id },
        attributes: ['nota']
      });

      return {
        id: estudiante.id,
        name: estudiante.nombre,
        matricula: estudiante.matricula,
        grade: calificacion ? calificacion.nota : null,
        status: calificacion && calificacion.nota >= 6 ? "aprobado" : "reprobado"
      };
    }));

    res.json(studentsWithGrades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener estudiantes" });
  }
});

// GET /maestros/:id/grades - Calificaciones para gestión
router.get("/:id/grades", async (req, res) => {
  const { group } = req.query;
  try {
    const maestro = await Usuario.findOne({
      where: { id: req.params.id, rol: "MAESTRO" }
    });
    if (!maestro) {
      return res.status(404).json({ message: "Maestro no encontrado" });
    }

    let whereCondition = { maestro_id: req.params.id };
    if (group) {
      whereCondition.alumno_grupo = group; // Asumiendo que hay una relación
    }

    const calificaciones = await Calificacion.findAll({
      where: whereCondition,
      include: [{
        model: Alumno,
        as: 'alumno',
        attributes: ['id', 'nombre', 'matricula', 'grupo']
      }],
      attributes: ['id', 'nota', 'fecha_registro']
    });

    const grades = calificaciones.map(cal => ({
      id: cal.id,
      studentId: cal.alumno.id,
      name: cal.alumno.nombre,
      matricula: cal.alumno.matricula,
      group: cal.alumno.grupo,
      currentGrade: cal.nota,
      newGrade: cal.nota,
      status: "guardado"
    }));

    res.json(grades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener calificaciones" });
  }
});

// PUT /maestros/:id/grades - Actualizar calificaciones
router.put("/:id/grades", async (req, res) => {
  const { grades } = req.body;
  try {
    const maestro = await Usuario.findOne({
      where: { id: req.params.id, rol: "MAESTRO" }
    });
    if (!maestro) {
      return res.status(404).json({ message: "Maestro no encontrado" });
    }

    const updates = grades.map(async (grade) => {
      let calificacion = await Calificacion.findOne({
        where: { alumno_id: grade.studentId, maestro_id: req.params.id }
      });

      if (calificacion) {
        await calificacion.update({ nota: grade.newGrade });
      } else {
        calificacion = await Calificacion.create({
          alumno_id: grade.studentId,
          maestro_id: req.params.id,
          nota: grade.newGrade
        });
      }
      return calificacion;
    });

    await Promise.all(updates);
    res.json({ message: "Calificaciones actualizadas" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar calificaciones" });
  }
});

export default router;
