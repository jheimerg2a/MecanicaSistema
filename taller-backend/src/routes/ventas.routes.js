const router = require('express').Router();
const { getVentas, createVenta, getVentaById, buscarPorCodigo } = require('../controllers/ventas.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/',                verificarToken, getVentas);
router.get('/:id',             verificarToken, getVentaById);
router.post('/',               verificarToken, createVenta);
router.get('/buscar/:codigo',  verificarToken, buscarPorCodigo);

module.exports = router;