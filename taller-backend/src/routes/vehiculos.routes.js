const router = require('express').Router();
const { getVehiculos, getVehiculosByCliente, createVehiculo, updateVehiculo } = require('../controllers/vehiculos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/',                verificarToken, getVehiculos);
router.get('/cliente/:id',     verificarToken, getVehiculosByCliente);
router.post('/',               verificarToken, createVehiculo);
router.put('/:id',             verificarToken, updateVehiculo);

module.exports = router;