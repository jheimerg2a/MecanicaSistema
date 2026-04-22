const pool = require('../config/db');

const consultarPorNombre = async (req, res) => {
  try {
    const nombre = `%${req.params.nombre}%`;
    const [rows] = await pool.query(
      'SELECT * FROM v_consulta_cliente WHERE cliente LIKE ?',
      [nombre]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'No se encontraron órdenes para ese cliente' });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al consultar' });
  }
};

const consultarPorDni = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM v_consulta_cliente WHERE dni = ?',
      [req.params.dni]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'No se encontraron órdenes para ese DNI' });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al consultar' });
  }
};

module.exports = { consultarPorNombre, consultarPorDni };