const router = require('express').Router();
const {
  getOrdenes, getOrdenById, createOrden, updateEstado, getEstadisticas,
  agregarServicio, eliminarServicio, agregarRepuesto, eliminarRepuesto, updateManoObra
} = require('../controllers/ordenes.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/estadisticas',              verificarToken, getEstadisticas);
router.get('/',                          verificarToken, getOrdenes);
router.get('/:id',                       verificarToken, getOrdenById);
router.post('/',                         verificarToken, createOrden);
router.patch('/:id/estado',              verificarToken, updateEstado);
router.patch('/:id/mano-obra',           verificarToken, updateManoObra);
router.post('/:id/servicios',            verificarToken, agregarServicio);
router.delete('/:id/servicios/:osId',    verificarToken, eliminarServicio);
router.post('/:id/repuestos',            verificarToken, agregarRepuesto);
router.delete('/:id/repuestos/:orId',    verificarToken, eliminarRepuesto);

module.exports = router;