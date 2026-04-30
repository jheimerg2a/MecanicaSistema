const router  = require('express').Router();
const multer  = require('multer');
const { getRepuestos, createRepuesto, updateRepuesto, getStockBajo, importarExcel } = require('../controllers/repuestos.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/',           verificarToken, getRepuestos);
router.get('/stock-bajo', verificarToken, getStockBajo);
router.post('/',          verificarToken, soloAdmin, createRepuesto);
router.put('/:id',        verificarToken, soloAdmin, updateRepuesto);
router.post('/importar',  verificarToken, soloAdmin, upload.single('archivo'), importarExcel);

module.exports = router;