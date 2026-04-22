const router = require('express').Router();
const { getRepuestos, createRepuesto, updateRepuesto, getStockBajo } = require('../controllers/repuestos.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

router.get('/',          verificarToken, getRepuestos);
router.get('/stock-bajo', verificarToken, getStockBajo);
router.post('/',         verificarToken, soloAdmin, createRepuesto);
router.put('/:id',       verificarToken, soloAdmin, updateRepuesto);

module.exports = router;