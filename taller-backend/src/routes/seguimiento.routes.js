const router = require('express').Router();
const { consultarPorNombre, consultarPorDni } = require('../controllers/seguimiento.controller');

// Rutas PÚBLICAS — sin token (para que el cliente consulte desde el index)
router.get('/nombre/:nombre', consultarPorNombre);
router.get('/dni/:dni',       consultarPorDni);

module.exports = router;