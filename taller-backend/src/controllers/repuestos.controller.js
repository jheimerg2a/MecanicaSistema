const pool = require('../config/db');

const getRepuestos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM repuestos ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener repuestos' });
  }
};

const getStockBajo = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_stock_bajo');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener stock bajo' });
  }
};

const createRepuesto = async (req, res) => {
  const { codigo, nombre, descripcion, categoria, stock, stock_minimo, precio_compra, precio_venta, proveedor } = req.body;
  if (!nombre) return res.status(400).json({ mensaje: 'El nombre es requerido' });
  try {
    const [result] = await pool.query(
      'INSERT INTO repuestos (codigo, nombre, descripcion, categoria, stock, stock_minimo, precio_compra, precio_venta, proveedor) VALUES (?,?,?,?,?,?,?,?,?)',
      [codigo, nombre, descripcion, categoria, stock || 0, stock_minimo || 5, precio_compra || 0, precio_venta || 0, proveedor]
    );
    res.status(201).json({ mensaje: 'Repuesto creado', id: result.insertId });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear repuesto' });
  }
};

const updateRepuesto = async (req, res) => {
  const { nombre, descripcion, categoria, stock, stock_minimo, precio_compra, precio_venta, proveedor } = req.body;
  try {
    await pool.query(
      'UPDATE repuestos SET nombre=?, descripcion=?, categoria=?, stock=?, stock_minimo=?, precio_compra=?, precio_venta=?, proveedor=? WHERE id=?',
      [nombre, descripcion, categoria, stock, stock_minimo, precio_compra, precio_venta, proveedor, req.params.id]
    );
    res.json({ mensaje: 'Repuesto actualizado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar repuesto' });
  }
};

module.exports = { getRepuestos, createRepuesto, updateRepuesto, getStockBajo };