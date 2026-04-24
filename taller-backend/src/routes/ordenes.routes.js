const router = require('express').Router();
const { 
  getOrdenes, 
  getOrdenById, 
  createOrden, 
  updateEstado, 
  getEstadisticas 
} = require('../controllers/ordenes.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// 🔹 Endpoint de estadísticas (IMPORTANTE: antes de /:id)
router.get('/estadisticas', verificarToken, getEstadisticas);

router.get('/', verificarToken, getOrdenes);
router.get('/:id', verificarToken, getOrdenById);
router.post('/', verificarToken, createOrden);
router.patch('/:id/estado', verificarToken, updateEstado);

module.exports = router;