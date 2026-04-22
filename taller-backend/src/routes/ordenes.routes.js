const router = require('express').Router();
const { getOrdenes, getOrdenById, createOrden, updateEstado } = require('../controllers/ordenes.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/',          verificarToken, getOrdenes);
router.get('/:id',       verificarToken, getOrdenById);
router.post('/',         verificarToken, createOrden);
router.patch('/:id/estado', verificarToken, updateEstado);

module.exports = router;