const pool = require('../config/db');

const getServicios = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM servicios ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener servicios' });
  }
};

const createServicio = async (req, res) => {
  const { nombre, descripcion, precio_base, categoria } = req.body;
  if (!nombre) return res.status(400).json({ mensaje: 'El nombre es requerido' });
  try {
    const [result] = await pool.query(
      'INSERT INTO servicios (nombre, descripcion, precio_base, categoria) VALUES (?,?,?,?)',
      [nombre, descripcion, precio_base || 0, categoria]
    );
    res.status(201).json({ mensaje: 'Servicio creado', id: result.insertId });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear servicio' });
  }
};

const updateServicio = async (req, res) => {
  const { nombre, descripcion, precio_base, categoria } = req.body;
  try {
    await pool.query(
      'UPDATE servicios SET nombre=?, descripcion=?, precio_base=?, categoria=? WHERE id=?',
      [nombre, descripcion, precio_base || 0, categoria, req.params.id]
    );
    res.json({ mensaje: 'Servicio actualizado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar servicio' });
  }
};

const toggleActivo = async (req, res) => {
  try {
    await pool.query('UPDATE servicios SET activo = NOT activo WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al cambiar estado' });
  }
};

module.exports = { getServicios, createServicio, updateServicio, toggleActivo };