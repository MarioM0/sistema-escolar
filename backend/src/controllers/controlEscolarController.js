import { Calificacion, Alumno, Materia, Usuario } from '../models/index.js';

export const getReporte = async (req, res) => {
  try {
    const calificaciones = await Calificacion.findAll({
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
        },
        {
          model: Usuario,
          as: 'maestro',
          attributes: ['id', 'nombre', 'email']
        }
      ],
      order: [['fecha_registro', 'DESC']]
    });

    // Calcular estadísticas
    const promedios = {};
    calificaciones.forEach(cal => {
      if (cal.alumno_id) {
        if (!promedios[cal.alumno_id]) {
          promedios[cal.alumno_id] = { suma: 0, count: 0 };
        }
        promedios[cal.alumno_id].suma += cal.nota || 0;
        promedios[cal.alumno_id].count += 1;
      }
    });

    const resumenPorAlumno = Object.entries(promedios).map(([alumnoId, data]) => ({
      alumnoId: parseInt(alumnoId),
      promedio: (data.suma / data.count).toFixed(2)
    }));

    res.json({
      totalCalificaciones: calificaciones.length,
      resumenPorAlumno,
      calificaciones
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al generar reporte" });
  }
};

export const deleteCalificacion = async (req, res) => {
  try {
    const { id } = req.params;

    const calificacion = await Calificacion.findByPk(id);
    if (!calificacion) {
      return res.status(404).json({ message: "Calificación no encontrada" });
    }

    await calificacion.destroy();

    res.json({
      message: "Calificación eliminada correctamente",
      id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar calificación" });
  }
};
