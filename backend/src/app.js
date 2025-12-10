import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import alumnosRoutes from './routes/alumnos.js';
import usuariosRoutes from './routes/usuarios.js';
import solicitudesRoutes from './routes/solicitudes.js';
import solicitudesRegistroMaestroRoutes from './routes/solicitudes-registro-maestro.js';
import calificacionesRoutes from './routes/calificaciones.js';
import maestrosRoutes from './routes/maestros.js';
import maestroRoutes from './routes/maestro.js';
import controlEscolarRoutes from './routes/control_escolar.js';
import materiasRoutes from './routes/materias.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://frontend_sge:5173'],
  credentials: true
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/solicitudes-registro-maestro', solicitudesRegistroMaestroRoutes);
app.use('/api/calificaciones', calificacionesRoutes);
app.use('/api/maestros', maestrosRoutes);
app.use('/api/maestro', maestroRoutes);
app.use('/api/control_escolar', controlEscolarRoutes);
app.use('/api/materias', materiasRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test
app.get('/', (req, res) => res.send('Backend corriendo correctamente'));

export default app;

