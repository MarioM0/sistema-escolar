import { Calificacion, Alumno, Materia, Usuario } from '../models/index.js';

export const createCalificacion = async (req, res) => {
  const { alumno_id, materia_id, maestro_id, nota, observaciones } = req.body;

  try {
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
};

export const getPromedioGeneral = async (req, res) => {
  try {
    const calificaciones = await Calificacion.findAll({
      attributes: ['nota']
    });

    if (calificaciones.length === 0) {
      return res.json({ promedio: 0 });
    }

    const promedio = calificaciones.reduce((sum, cal) => sum + (cal.nota || 0), 0) / calificaciones.length;

    res.json({
      promedio: Math.round(promedio * 100) / 100,
      totalCalificaciones: calificaciones.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener promedio general" });
  }
};

export const getCalificacionesPorAlumno = async (req, res) => {
  const { alumnoId } = req.params;

  try {
    const alumno = await Alumno.findByPk(alumnoId);
    if (!alumno) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

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

    // Agrupar calificaciones por materia
    const subjectMap = {};
    const allCalificaciones = [];

    calificaciones.forEach(cal => {
      if (!subjectMap[cal.materia_id]) {
        subjectMap[cal.materia_id] = {
          id: cal.materia_id,
          materia: cal.materia,
          maestro: cal.maestro,
          calificacion_actual: cal.nota,
          fecha_registro: cal.fecha_registro,
          observaciones: cal.observaciones,
          historial_calificaciones: []
        };
      }
      subjectMap[cal.materia_id].historial_calificaciones.push({
        id: cal.id,
        calificacion: cal.nota,
        fecha_registro: cal.fecha_registro,
        observaciones: cal.observaciones
      });
      allCalificaciones.push(cal.nota);
    });

    const subjects = Object.values(subjectMap).map(subject => ({
      ...subject,
      total_calificaciones: subject.historial_calificaciones.length
    }));

    // Calcular promedio
    const promedio = allCalificaciones.length > 0 
      ? allCalificaciones.reduce((a, b) => a + b, 0) / allCalificaciones.length 
      : 0;

    const materiasCursadas = subjects.length;

    res.json({
      alumno: {
        id: alumno.id,
        nombre: alumno.nombre,
        matricula: alumno.matricula,
        grupo: alumno.grupo
      },
      subjects,
      resumen: {
        promedio: parseFloat(promedio.toFixed(2)),
        materiasCursadas
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener calificaciones del alumno" });
  }
};

export const deleteCalificacion = async (req, res) => {
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
};
