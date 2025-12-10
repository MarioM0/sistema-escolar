
// Importar instancia de Sequelize
import { sequelize } from "./sequelize.js";

// Importar modelos
import { Usuario } from "./Usuario.js";
import { Alumno } from "./Alumno.js";
import { Maestro } from "./Maestro.js";
import { ControlEscolar } from "./ControlEscolar.js";
import { Materia } from "./Materia.js";
import { MateriaMaestro } from "./MateriaMaestro.js";
import { Calificacion } from "./Calificacion.js";
import { Solicitud } from "./Solicitud.js";
import { SolicitudRegistroMaestro } from "./SolicitudRegistroMaestro.js";

// Definir asociaciones
Usuario.hasMany(Alumno, { foreignKey: 'usuario_id', as: 'alumnos' });
Alumno.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Usuario.hasMany(Maestro, { foreignKey: 'usuario_id', as: 'maestros' });
Maestro.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Usuario.hasMany(ControlEscolar, { foreignKey: 'usuario_id', as: 'controles_escolares' });
ControlEscolar.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Asociación many-to-many entre Materia y Usuario (maestros) con grupo
Materia.belongsToMany(Usuario, { through: MateriaMaestro, foreignKey: 'materia_id', as: 'maestros' });
Usuario.belongsToMany(Materia, { through: MateriaMaestro, foreignKey: 'usuario_id', as: 'materias' });

// Asociación many-to-many entre MateriaMaestro y Usuario (para grupos específicos)
MateriaMaestro.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'maestro' });
Usuario.hasMany(MateriaMaestro, { foreignKey: 'usuario_id', as: 'materiaMaestros' });

// Asociación many-to-many entre MateriaMaestro y Materia
MateriaMaestro.belongsTo(Materia, { foreignKey: 'materia_id', as: 'materia' });
Materia.hasMany(MateriaMaestro, { foreignKey: 'materia_id', as: 'materiaMaestros' });

// Asociación one-to-many entre Solicitud y Usuario
Solicitud.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(Solicitud, { foreignKey: 'usuario_id', as: 'solicitudes' });

// Asociación many-to-one entre Calificacion y Usuario (maestro)
Calificacion.belongsTo(Usuario, { foreignKey: 'maestro_id', as: 'maestro' });
Usuario.hasMany(Calificacion, { foreignKey: 'maestro_id', as: 'calificaciones' });

// Asociación many-to-one entre Calificacion y Alumno
Calificacion.belongsTo(Alumno, { foreignKey: 'alumno_id', as: 'alumno' });
Alumno.hasMany(Calificacion, { foreignKey: 'alumno_id', as: 'calificaciones' });

// Asociación many-to-one entre Calificacion y Materia
Calificacion.belongsTo(Materia, { foreignKey: 'materia_id', as: 'materia' });
Materia.hasMany(Calificacion, { foreignKey: 'materia_id', as: 'calificaciones' });

// Exportar modelos
export { Usuario, Alumno, Maestro, ControlEscolar, Materia, MateriaMaestro, Calificacion, Solicitud, SolicitudRegistroMaestro };
