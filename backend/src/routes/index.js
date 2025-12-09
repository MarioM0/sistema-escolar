// src/routes/index.js
import { Router } from 'express';

const router = Router();

// Ruta de prueba
router.get('/', (req, res) => {
  res.send('Ruta principal funcionando');
});

// Exportación por defecto para que puedas hacer `import indexRoutes from ...`
export default router;
