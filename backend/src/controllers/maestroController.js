import { Usuario, Alumno, Calificacion, MateriaMaestro } from '../models/index.js';

export const getAlumnosByMaestro = async (req, res) => {
  const maestroId = req.user.id;

  try {
    const materiasMaestro = await MateriaMaestro.findAll({
      where: { maestro_id: maestroId },
      attributes: ['grupo', 'materia_id']
    });

    if (materiasMaestro.length === 0) {
      return res.json({
        message: "El maestro no tiene grupos asignados",
        alumnos: []
      });
    }

    const grupos = [...new Set(materiasMaestro.map(m => m.grupo))];

    const alumnos = await Alumno.findAll({
      where: { grupo: grupos },
      attributes: ['id', 'nombre', 'matricula', 'grupo'],
      order: [['nombre', 'ASC']]
    });

    res.json({
      totalAlumnos: alumnos.length,
      alumnos
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener alumnos del maestro" });
  }
};

export const createCalificacionMaestro = async (req, res) => {
  const { alumno_id, materia_id, nota, observaciones } = req.body;
  const maestro_id = req.user.id;

  try {
    // Validar que el maestro está asignado a esta materia
    const asignacion = await MateriaMaestro.findOne({
      where: { maestro_id, materia_id }
    });

    if (!asignacion) {
      return res.status(403).json({
        message: "No tienes permisos para calificar esta materia"
      });
    }

    // Validar que el alumno existe
    const alumno = await Alumno.findByPk(alumno_id);
    if (!alumno) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    const calificacion = await Calificacion.create({
      alumno_id,
      materia_id,
      maestro_id,
      nota,
      observaciones
    });

    res.json({
      message: "Calificación registrada correctamente",
      calificacion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al registrar calificación" });
  }
};

export const getCalificacionesByMaestro = async (req, res) => {
  const maestro_id = req.user.id;

  try {
    const calificaciones = await Calificacion.findAll({
      where: { maestro_id },
      include: [
        {
          model: Alumno,
          as: 'alumno',
          attributes: ['id', 'nombre', 'matricula', 'grupo']
        }
      ],
      order: [['fecha_registro', 'DESC']]
    });

    res.json({
      totalCalificaciones: calificaciones.length,
      calificaciones
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener calificaciones" });
  }
};
