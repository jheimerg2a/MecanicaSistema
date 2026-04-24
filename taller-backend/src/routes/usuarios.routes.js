const router = require('express').Router();
const { getUsuarios, createUsuario, updateUsuario, toggleActivo } = require('../controllers/usuarios.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

router.get('/',           verificarToken, soloAdmin, getUsuarios);
router.post('/',          verificarToken, soloAdmin, createUsuario);
router.put('/:id',        verificarToken, soloAdmin, updateUsuario);
router.patch('/:id/toggle', verificarToken, soloAdmin, toggleActivo);

module.exports = router;