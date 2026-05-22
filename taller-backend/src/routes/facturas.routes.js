const router = require('express').Router();
const { getFacturas, buscarOrdenes, getFacturaByOrden, createFactura, registrarPago } = require('../controllers/facturas.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/',              verificarToken, getFacturas);
router.get('/buscar',        verificarToken, buscarOrdenes);
router.get('/orden/:id',     verificarToken, getFacturaByOrden);
router.post('/',             verificarToken, createFactura);
router.post('/:id/pago',     verificarToken, registrarPago);

module.exports = router;