const router = require('express').Router();
const { getClientes, getClienteById, createCliente, updateCliente } = require('../controllers/clientes.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/',     verificarToken, getClientes);
router.get('/:id',  verificarToken, getClienteById);
router.post('/',    verificarToken, createCliente);
router.put('/:id',  verificarToken, updateCliente);

module.exports = router;