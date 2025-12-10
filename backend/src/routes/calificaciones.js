import { Router } from "express";
import { Materia, Usuario, Alumno, Calificacion, MateriaMaestro } from "../models/index.js";

const router = Router();

// GET /calificaciones/alumno/:alumnoId - Obtener calificaciones de un alumno específico
router.get("/alumno/:alumnoId", async (req, res) => {
  const { alumnoId } = req.params;

  try {
    // Verificar que el alumno existe
    const alumno = await Alumno.findByPk(alumnoId);
    if (!alumno) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    // Obtener todas las materias asignadas al grupo del alumno
    const materiasDelGrupo = await MateriaMaestro.findAll({
      where: { grupo: alumno.grupo },
      include: [
        {
          model: Materia,
          as: 'materia',
          attributes: ['id', 'nombre', 'codigo']
        },
        {
          model: Usuario,
          as: 'maestro',
          attributes: ['id', 'nombre']
        }
      ]
    });


    // Obtener calificaciones existentes del alumno
    const calificaciones = await Calificacion.findAll({
      where: { alumno_id: alumnoId },
      include: [
        {
          model: Materia,
          as: 'materia',
          attributes: ['id', 'nombre', 'codigo']
        },
        {
          model: Usuario,
          as: 'maestro',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha_registro', 'DESC']]
    });

    // Crear mapa de calificaciones por materia_id con historial completo
    const calificacionesMap = {};
    calificaciones.forEach(cal => {
      if (!calificacionesMap[cal.materia_id]) {
        calificacionesMap[cal.materia_id] = {
          id: cal.id,
          calificacion_actual: cal.nota,
          fecha_registro: cal.fecha_registro,
          observaciones: cal.observaciones,
          historial_calificaciones: [],
          total_calificaciones: 0,
          maestro: {
            id: cal.maestro.id,
            nombre: cal.maestro.nombre
          }
        };
      }
      
      // Agregar al historial
      calificacionesMap[cal.materia_id].historial_calificaciones.push({
        id: cal.id,
        calificacion: cal.nota,
        fecha_registro: cal.fecha_registro,
        observaciones: cal.observaciones
      });
      
      // Actualizar calificación actual (más reciente)
      calificacionesMap[cal.materia_id].calificacion_actual = cal.nota;
      calificacionesMap[cal.materia_id].fecha_registro = cal.fecha_registro;
      calificacionesMap[cal.materia_id].observaciones = cal.observaciones;
      calificacionesMap[cal.materia_id].total_calificaciones += 1;
    });


    // Combinar materias del grupo con calificaciones existentes
    const subjects = materiasDelGrupo.map(materiaMaestro => {
      const calificacionExistente = calificacionesMap[materiaMaestro.materia_id];

      return {
        id: calificacionExistente ? calificacionExistente.id : null,
        materia: {
          id: materiaMaestro.materia.id,
          nombre: materiaMaestro.materia.nombre,
          codigo: materiaMaestro.materia.codigo
        },
        maestro: {
          id: materiaMaestro.maestro.id,
          nombre: materiaMaestro.maestro.nombre
        },
        calificacion_actual: calificacionExistente ? calificacionExistente.calificacion_actual : null,
        fecha_registro: calificacionExistente ? calificacionExistente.fecha_registro : null,
        observaciones: calificacionExistente ? calificacionExistente.observaciones : null,
        historial_calificaciones: calificacionExistente ? calificacionExistente.historial_calificaciones : [],
        total_calificaciones: calificacionExistente ? calificacionExistente.total_calificaciones : 0
      };
    });

    // Calcular promedio general
    const validGrades = subjects.filter(s => s.calificacion !== null && s.calificacion !== undefined);
    const promedio = validGrades.length > 0
      ? validGrades.reduce((sum, s) => sum + s.calificacion, 0) / validGrades.length
      : 0;

    res.json({
      alumno: {
        id: alumno.id,
        nombre: alumno.nombre,
        matricula: alumno.matricula,
        grupo: alumno.grupo
      },
      subjects,
      resumen: {
        promedio: Math.round(promedio * 100) / 100,
        materiasCursadas: subjects.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener calificaciones del alumno" });
  }
});

// GET /calificaciones/:materiaId/:maestroId - Obtener estudiantes con calificaciones
router.get("/:materiaId/:maestroId", async (req, res) => {
  const { materiaId, maestroId } = req.params;

  try {
    // Obtener estudiantes inscritos en la materia
    const materia = await Materia.findByPk(materiaId, {
      include: [{
        model: Usuario,
        as: 'maestros',
        where: { id: maestroId },
        attributes: [],
        through: { attributes: [] },
        required: true
      }]
    });

    if (!materia) {
      return res.status(404).json({ message: "Materia no encontrada o maestro no asignado" });
    }

    // Obtener alumnos inscritos en la materia (asumiendo que hay una relación)
    // Por ahora, obtenemos todos los alumnos y filtramos por materia
    const alumnos = await Alumno.findAll({
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nombre', 'email', 'matricula']
      }]
    });

    // Obtener calificaciones existentes
    const calificaciones = await Calificacion.findAll({
      where: {
        materia_id: materiaId,
        maestro_id: maestroId
      },
      order: [['fecha_registro', 'DESC']] // Más recientes primero
    });

    const calificacionesMap = calificaciones.reduce((acc, cal) => {
      if (!acc[cal.alumno_id]) {
        acc[cal.alumno_id] = [];
      }
      acc[cal.alumno_id].push({
        id: cal.id,
        nota: cal.nota,
        fecha_registro: cal.fecha_registro,
        observaciones: cal.observaciones
      });
      return acc;
    }, {});

    // Combinar alumnos con calificaciones
    const estudiantes = alumnos.map(alumno => {
      const calificacionesAlumno = calificacionesMap[alumno.id] || [];
      return {
        id: alumno.id,
        nombre: alumno.usuario.nombre,
        matricula: alumno.usuario.matricula,
        calificaciones: calificacionesAlumno
      };
    });

    // Calcular estadísticas
    const totalAlumnos = estudiantes.length;
    const alumnosCalificados = estudiantes.filter(e => e.calificaciones.length > 0).length;

    // Calcular promedio usando la calificación más reciente de cada alumno
    const promediosPorAlumno = estudiantes
      .filter(e => e.calificaciones.length > 0)
      .map(e => e.calificaciones[0].nota) // Primera calificación es la más reciente
      .filter(nota => nota !== null && nota !== undefined);

    const promedio = promediosPorAlumno.length > 0
      ? promediosPorAlumno.reduce((sum, nota) => sum + nota, 0) / promediosPorAlumno.length
      : 0;

    res.json({
      materia: {
        id: materia.id,
        nombre: materia.nombre,
        codigo: materia.codigo
      },
      estadisticas: {
        totalAlumnos,
        alumnosCalificados,
        promedio: Math.round(promedio * 100) / 100
      },
      estudiantes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener calificaciones" });
  }
});

// POST /calificaciones - Crear nueva calificación (permite múltiples calificaciones por alumno/materia/maestro)
router.post("/", async (req, res) => {
  const { alumno_id, materia_id, maestro_id, nota, observaciones } = req.body;

  try {
    // Siempre crear nueva calificación
    const calificacion = await Calificacion.create({
      alumno_id,
      materia_id,
      maestro_id,
      nota,
      observaciones
    });

    res.json(calificacion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al guardar calificación" });
  }
});

// DELETE /calificaciones/:id - Eliminar calificación
router.delete("/:id", async (req, res) => {
  try {
    const calificacion = await Calificacion.findByPk(req.params.id);
    if (!calificacion) {
      return res.status(404).json({ message: "Calificación no encontrada" });
    }

    await calificacion.destroy();
    res.json({ message: "Calificación eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar calificación" });
  }
});

export default router;
