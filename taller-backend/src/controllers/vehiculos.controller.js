const pool = require('../config/db');

const getVehiculos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.*, CONCAT(c.nombre,' ',c.apellido) AS cliente
      FROM vehiculos v JOIN clientes c ON c.id = v.cliente_id
      ORDER BY v.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener vehículos' });
  }
};

const getVehiculosByCliente = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vehiculos WHERE cliente_id = ?', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener vehículos del cliente' });
  }
};

const createVehiculo = async (req, res) => {
  const { cliente_id, placa, marca, modelo, anio, color, tipo, vin, km_ingreso } = req.body;
  if (!cliente_id || !placa || !marca || !modelo) {
    return res.status(400).json({ mensaje: 'cliente_id, placa, marca y modelo son requeridos' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO vehiculos (cliente_id, placa, marca, modelo, anio, color, tipo, vin, km_ingreso) VALUES (?,?,?,?,?,?,?,?,?)',
      [cliente_id, placa.toUpperCase(), marca, modelo, anio, color, tipo, vin, km_ingreso || 0]
    );
    res.status(201).json({ mensaje: 'Vehículo registrado', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ mensaje: 'La placa ya está registrada' });
    res.status(500).json({ mensaje: 'Error al registrar vehículo' });
  }
};

const updateVehiculo = async (req, res) => {
  const { marca, modelo, anio, color, tipo, vin, km_ingreso } = req.body;
  try {
    await pool.query(
      'UPDATE vehiculos SET marca=?, modelo=?, anio=?, color=?, tipo=?, vin=?, km_ingreso=? WHERE id=?',
      [marca, modelo, anio, color, tipo, vin, km_ingreso, req.params.id]
    );
    res.json({ mensaje: 'Vehículo actualizado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar vehículo' });
  }
};

module.exports = { getVehiculos, getVehiculosByCliente, createVehiculo, updateVehiculo };