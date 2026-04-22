const pool = require('../config/db');

const getClientes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clientes ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener clientes' });
  }
};

const getClienteById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener cliente' });
  }
};

const createCliente = async (req, res) => {
  const { nombre, apellido, dni, telefono, email, direccion } = req.body;
  if (!nombre || !apellido) return res.status(400).json({ mensaje: 'Nombre y apellido son requeridos' });
  try {
    const [result] = await pool.query(
      'INSERT INTO clientes (nombre, apellido, dni, telefono, email, direccion) VALUES (?,?,?,?,?,?)',
      [nombre, apellido, dni, telefono, email, direccion]
    );
    res.status(201).json({ mensaje: 'Cliente creado', id: result.insertId });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear cliente' });
  }
};

const updateCliente = async (req, res) => {
  const { nombre, apellido, dni, telefono, email, direccion } = req.body;
  try {
    await pool.query(
      'UPDATE clientes SET nombre=?, apellido=?, dni=?, telefono=?, email=?, direccion=? WHERE id=?',
      [nombre, apellido, dni, telefono, email, direccion, req.params.id]
    );
    res.json({ mensaje: 'Cliente actualizado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar cliente' });
  }
};

module.exports = { getClientes, getClienteById, createCliente, updateCliente };