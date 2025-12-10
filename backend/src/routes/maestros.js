import { Router } from "express";
import { Usuario, Materia, Alumno, Calificacion, MateriaMaestro } from "../models/index.js";
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

    // Obtener grupos (materias asignadas al maestro)
    const materiaMaestros = await MateriaMaestro.findAll({
      where: { usuario_id: req.params.id },
      include: [{
        model: Materia,
        as: 'materia',
        attributes: ['id', 'codigo', 'nombre']
      }],
      attributes: ['grupo']
    });

    // Obtener estudiantes totales (alumnos en grupos asignados)
    const grupos = [...new Set(materiaMaestros.map(mm => mm.grupo))];
    const estudiantesTotales = await Alumno.count({
      where: { grupo: grupos }
    });

    // Obtener promedio general de calificaciones (usando la calificación más reciente por alumno)
    const calificaciones = await Calificacion.findAll({
      where: { maestro_id: req.params.id },
      attributes: ['alumno_id', 'nota'],
      order: [['alumno_id'], ['fecha_registro', 'DESC']]
    });

    // Agrupar por alumno y tomar la calificación más reciente
    const calificacionesPorAlumno = {};
    calificaciones.forEach(cal => {
      if (!calificacionesPorAlumno[cal.alumno_id]) {
        calificacionesPorAlumno[cal.alumno_id] = cal.nota;
      }
    });

    const notas = Object.values(calificacionesPorAlumno).filter(n => n !== null).map(n => parseFloat(n));
    const promedio = notas.length > 0 ? notas.reduce((sum, n) => sum + n, 0) / notas.length : null;

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

    // Get all subject-teacher assignments for the teacher
    const materiaMaestros = await MateriaMaestro.findAll({
      where: { usuario_id: req.params.id },
      include: [{
        model: Materia,
        as: 'materia',
        attributes: ['id', 'codigo', 'nombre']
      }],
      attributes: ['grupo']
    });

    // Group by unique group-subject combinations
    const groupSubjectMap = new Map();
    materiaMaestros.forEach(mm => {
      const key = `${mm.grupo}-${mm.materia.id}`;
      if (!groupSubjectMap.has(key)) {
        groupSubjectMap.set(key, {
          id: mm.materia.id,
          codigo: mm.materia.codigo,
          nombre: mm.materia.nombre,
          grupo: mm.grupo
        });
      }
    });

    const grupos = Array.from(groupSubjectMap.values());

    const groupsWithStats = await Promise.all(grupos.map(async (grupo) => {
      const estudiantes = await Alumno.count({
        where: { grupo: grupo.grupo }
      });

      const calificaciones = await Calificacion.findAll({
        where: {
          maestro_id: req.params.id,
          materia_id: grupo.id
        },
        attributes: ['alumno_id', 'nota'],
        order: [['alumno_id'], ['fecha_registro', 'DESC']]
      });

      // Agrupar por alumno y tomar la calificación más reciente
      const calificacionesPorAlumno = {};
      calificaciones.forEach(cal => {
        if (!calificacionesPorAlumno[cal.alumno_id]) {
          calificacionesPorAlumno[cal.alumno_id] = cal.nota;
        }
      });

      const notas = Object.values(calificacionesPorAlumno).filter(n => n !== null).map(n => parseFloat(n));
      const avgGrade = notas.length > 0 ? notas.reduce((sum, n) => sum + n, 0) / notas.length : null;

      return {
        id: grupo.id,
        name: grupo.grupo,
        grade: grupo.nombre, // Usando nombre como grado
        subject: grupo.nombre,
        students: estudiantes,
        avgGrade: avgGrade
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

    // Find the materia and check if teacher is assigned to it
    const materia = await Materia.findByPk(req.params.groupId);
    if (!materia) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    // Check if teacher is assigned to this subject in any group
    const materiaMaestro = await MateriaMaestro.findOne({
      where: {
        usuario_id: req.params.id,
        materia_id: req.params.groupId
      }
    });
    if (!materiaMaestro) {
      return res.status(404).json({ message: "No tienes acceso a este grupo" });
    }

    const estudiantes = await Alumno.findAll({
      where: { grupo: materiaMaestro.grupo },
      attributes: ['id', 'nombre', 'matricula']
    });

    const studentsWithGrades = await Promise.all(estudiantes.map(async (estudiante) => {
      // Get all grades for this student from this teacher, ordered by date (most recent first)
      const calificaciones = await Calificacion.findAll({
        where: {
          alumno_id: estudiante.id,
          maestro_id: req.params.id,
          materia_id: req.params.groupId  // Only grades for this specific subject/group
        },
        attributes: ['nota'],
        order: [['fecha_registro', 'DESC']]
      });

      // Take the most recent grade (first in the array)
      const calificacion = calificaciones.length > 0 ? calificaciones[0] : null;

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

// GET /maestros/:id/grades - Calificaciones actuales para gestión (solo la más reciente por estudiante-materia)
router.get("/:id/grades", async (req, res) => {
  const { group, subject } = req.query;
  try {
    const maestro = await Usuario.findOne({
      where: { id: req.params.id, rol: "MAESTRO" }
    });
    if (!maestro) {
      return res.status(404).json({ message: "Maestro no encontrado" });
    }

    // Get all subject-teacher assignments for the teacher
    let materiaMaestroWhere = { usuario_id: req.params.id };
    if (group) {
      materiaMaestroWhere.grupo = group;
    }

    const materiaMaestros = await MateriaMaestro.findAll({
      where: materiaMaestroWhere,
      include: [{
        model: Materia,
        as: 'materia',
        attributes: ['id', 'codigo', 'nombre'],
        where: subject ? { nombre: subject } : undefined
      }],
      attributes: ['grupo']
    });

    const materias = materiaMaestros.map(mm => ({
      id: mm.materia.id,
      codigo: mm.materia.codigo,
      nombre: mm.materia.nombre,
      grupo: mm.grupo
    }));

    if (materias.length === 0) {
      return res.json([]);
    }

    // Get all students in the groups of these subjects
    const grupos = [...new Set(materias.map(m => m.grupo))];
    const alumnos = await Alumno.findAll({
      where: { grupo: grupos },
      attributes: ['id', 'nombre', 'matricula', 'grupo']
    });

    // For each student and each subject they take from this teacher, get the most recent grade or null
    const grades = [];

    for (const alumno of alumnos) {
      // Find all subjects this student takes from this teacher (same group)
      const studentMaterias = materias.filter(m => m.grupo === alumno.grupo);

      for (const materia of studentMaterias) {
        const calificacion = await Calificacion.findOne({
          where: {
            alumno_id: alumno.id,
            materia_id: materia.id,
            maestro_id: req.params.id
          },
          attributes: ['id', 'nota', 'fecha_registro', 'observaciones'],
          order: [['fecha_registro', 'DESC']]
        });

        // Always add the student-subject combination, with grade details if available
        grades.push({
          id: calificacion ? calificacion.id.toString() : `${alumno.id}-${materia.id}`,
          studentId: alumno.id,
          name: alumno.nombre,
          matricula: alumno.matricula,
          group: alumno.grupo,
          subject: materia.nombre,
          currentGrade: calificacion ? calificacion.nota : null,
          newGrade: calificacion ? calificacion.nota : null,
          fecha_registro: calificacion ? calificacion.fecha_registro : null,
          observaciones: calificacion ? calificacion.observaciones : null,
          status: "guardado"
        });
      }
    }

    res.json(grades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener calificaciones" });
  }
});

// GET /maestros/:id/grades/history - Historial completo de calificaciones
router.get("/:id/grades/history", async (req, res) => {
  const { studentId, subject } = req.query;
  try {
    const maestro = await Usuario.findOne({
      where: { id: req.params.id, rol: "MAESTRO" }
    });
    if (!maestro) {
      return res.status(404).json({ message: "Maestro no encontrado" });
    }

    let whereClause = { maestro_id: req.params.id };
    if (studentId) whereClause.alumno_id = studentId;
    if (subject) {
      // Find materia by name through MateriaMaestro relationship
      const materiaMaestro = await MateriaMaestro.findOne({
        where: { usuario_id: req.params.id },
        include: [{
          model: Materia,
          as: 'materia',
          where: { nombre: subject }
        }]
      });
      if (materiaMaestro) {
        whereClause.materia_id = materiaMaestro.materia.id;
      }
    }

    const calificaciones = await Calificacion.findAll({
      where: whereClause,
      include: [
        {
          model: Alumno,
          as: 'alumno',
          attributes: ['id', 'nombre', 'matricula', 'grupo']
        },
        {
          model: Materia,
          as: 'materia',
          attributes: ['id', 'nombre', 'codigo']
        }
      ],
      attributes: ['id', 'nota', 'fecha_registro', 'observaciones'],
      order: [['fecha_registro', 'DESC']]
    });

    const history = calificaciones.map(cal => ({
      id: cal.id,
      studentId: cal.alumno.id,
      studentName: cal.alumno.nombre,
      matricula: cal.alumno.matricula,
      group: cal.alumno.grupo,
      subject: cal.materia.nombre,
      grade: cal.nota,
      fecha_registro: cal.fecha_registro,
      observaciones: cal.observaciones
    }));

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener historial de calificaciones" });
  }
});

// PUT /maestros/:id/grades - Actualizar o crear calificaciones (permite múltiples calificaciones)
router.put("/:id/grades", async (req, res) => {
  const { grades } = req.body;
  try {
    const maestro = await Usuario.findOne({
      where: { id: req.params.id, rol: "MAESTRO" }
    });
    if (!maestro) {
      return res.status(404).json({ message: "Maestro no encontrado" });
    }

    const newGrades = await Promise.all(grades.map(async (grade) => {
      // Get the student to find their group
      const alumno = await Alumno.findByPk(grade.studentId);
      if (!alumno) {
        throw new Error(`Alumno ${grade.studentId} no encontrado`);
      }

      // Find the materia-maestro assignment for this subject, group and teacher
      const materiaMaestro = await MateriaMaestro.findOne({
        where: { usuario_id: req.params.id, grupo: alumno.grupo },
        include: [{
          model: Materia,
          as: 'materia',
          where: { nombre: grade.subject }
        }]
      });
      if (!materiaMaestro) {
        throw new Error(`Materia '${grade.subject}' no encontrada para grupo ${alumno.grupo} y maestro ${req.params.id}`);
      }

      // Check if there's an existing grade for this student-subject-teacher
      const existingGrade = await Calificacion.findOne({
        where: {
          alumno_id: grade.studentId,
          materia_id: materiaMaestro.materia.id,
          maestro_id: req.params.id
        },
        order: [['fecha_registro', 'DESC']]
      });

      if (existingGrade) {
        // Update existing grade
        await existingGrade.update({ nota: grade.newGrade });
        return existingGrade;
      } else {
        // Create new grade entry
        const calificacion = await Calificacion.create({
          alumno_id: grade.studentId,
          materia_id: materiaMaestro.materia.id,
          maestro_id: req.params.id,
          nota: grade.newGrade
        });
        return calificacion;
      }
    }));

    res.json({ message: "Calificaciones guardadas", grades: newGrades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al guardar calificaciones" });
  }
});

export default router;
