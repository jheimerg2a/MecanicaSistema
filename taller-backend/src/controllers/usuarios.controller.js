const pool   = require('../config/db');
const bcrypt = require('bcryptjs');

const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, email, rol, telefono, activo, created_at FROM usuarios ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
};

const createUsuario = async (req, res) => {
  const { nombre, email, password, rol, telefono } = req.body;
  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ mensaje: 'Nombre, email, contraseña y rol son requeridos' });
  }
  try {
    const [existe] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existe.length > 0) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol, telefono) VALUES (?,?,?,?,?)',
      [nombre, email, hash, rol, telefono]
    );
    res.status(201).json({ mensaje: 'Usuario creado', id: result.insertId });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear usuario' });
  }
};

const updateUsuario = async (req, res) => {
  const { nombre, email, telefono, rol, password } = req.body;
  try {
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE usuarios SET nombre=?, email=?, telefono=?, rol=?, password_hash=? WHERE id=?',
        [nombre, email, telefono, rol, hash, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nombre=?, email=?, telefono=?, rol=? WHERE id=?',
        [nombre, email, telefono, rol, req.params.id]
      );
    }
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
};

const toggleActivo = async (req, res) => {
  try {
    await pool.query(
      'UPDATE usuarios SET activo = NOT activo WHERE id = ?',
      [req.params.id]
    );
    res.json({ mensaje: 'Estado del usuario actualizado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al cambiar estado' });
  }
};

module.exports = { getUsuarios, createUsuario, updateUsuario, toggleActivo };