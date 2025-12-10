
// src/routes/index.js
import { Router } from 'express';

const router = Router();

// Ruta de prueba
router.get('/', (req, res) => {
  res.send('Ruta principal funcionando');
});

// Health check endpoint para Docker healthcheck
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Exportación por defecto para que puedas hacer `import indexRoutes from ...`
export default router;
