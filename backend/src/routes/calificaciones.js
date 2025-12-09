import { Router } from "express";
import { Materia, Usuario, Alumno, Calificacion } from "../models/index.js";

const router = Router();

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
      }
    });

    const calificacionesMap = calificaciones.reduce((acc, cal) => {
      acc[cal.alumno_id] = cal;
      return acc;
    }, {});

    // Combinar alumnos con calificaciones
    const estudiantes = alumnos.map(alumno => {
      const calificacion = calificacionesMap[alumno.id];
      return {
        id: alumno.id,
        nombre: alumno.usuario.nombre,
        matricula: alumno.usuario.matricula,
        calificacion: calificacion ? {
          id: calificacion.id,
          nota: calificacion.nota,
          fecha_registro: calificacion.fecha_registro,
          observaciones: calificacion.observaciones
        } : null
      };
    });

    // Calcular estadísticas
    const calificacionesValidas = calificaciones.filter(c => c.nota !== null && c.nota !== undefined);
    const totalAlumnos = estudiantes.length;
    const alumnosCalificados = calificacionesValidas.length;
    const promedio = calificacionesValidas.length > 0
      ? calificacionesValidas.reduce((sum, c) => sum + c.nota, 0) / calificacionesValidas.length
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

// POST /calificaciones - Crear o actualizar calificación
router.post("/", async (req, res) => {
  const { alumno_id, materia_id, maestro_id, nota, observaciones } = req.body;

  try {
    // Verificar si ya existe una calificación
    let calificacion = await Calificacion.findOne({
      where: {
        alumno_id,
        materia_id,
        maestro_id
      }
    });

    if (calificacion) {
      // Actualizar
      await calificacion.update({
        nota,
        observaciones,
        fecha_registro: new Date()
      });
    } else {
      // Crear nueva
      calificacion = await Calificacion.create({
        alumno_id,
        materia_id,
        maestro_id,
        nota,
        observaciones
      });
    }

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
