const pool = require('../config/db');

const buscarPorCodigo = async (req, res) => {
  const { codigo } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM repuestos
       WHERE codigo_barra = ? OR codigo = ? OR codigo_original = ?
       LIMIT 1`,
      [codigo, codigo, codigo]
    );
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al buscar producto' });
  }
};

const getVentas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.*, u.nombre AS vendedor
       FROM ventas v
       LEFT JOIN usuarios u ON u.id = v.usuario_id
       ORDER BY v.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener ventas' });
  }
};

const getVentaById = async (req, res) => {
  try {
    const [venta]   = await pool.query('SELECT * FROM ventas WHERE id = ?', [req.params.id]);
    if (venta.length === 0) return res.status(404).json({ mensaje: 'Venta no encontrada' });
    const [detalle] = await pool.query(
      `SELECT dv.*, r.nombre AS producto, r.codigo_barra
       FROM detalle_ventas dv
       JOIN repuestos r ON r.id = dv.repuesto_id
       WHERE dv.venta_id = ?`, [req.params.id]
    );
    res.json({ ...venta[0], detalle });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener venta' });
  }
};

const createVenta = async (req, res) => {
  const { cliente_nombre, cliente_dni, metodo_pago, items, notas } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ mensaje: 'El carrito está vacío' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Calcular totales
    let subtotal = 0;
    for (const item of items) {
      subtotal += parseFloat(item.precio_unitario) * parseInt(item.cantidad);
    }
    const igv   = parseFloat((subtotal * 0.18).toFixed(2));
    const total = parseFloat((subtotal + igv).toFixed(2));

    // Generar número de boleta
    const [[count]] = await conn.query('SELECT COUNT(*) AS total FROM ventas');
    const numero    = `B-${new Date().getFullYear()}-${String(count.total + 1).padStart(5, '0')}`;

    // Insertar venta
    const [venta] = await conn.query(
      `INSERT INTO ventas (numero, cliente_nombre, cliente_dni, metodo_pago,
        subtotal, igv, total, notas, usuario_id)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [numero, cliente_nombre || 'Cliente general', cliente_dni || '',
       metodo_pago, subtotal, igv, total, notas || '', req.usuario.id]
    );

    // Insertar detalle y actualizar stock
    for (const item of items) {
      await conn.query(
        `INSERT INTO detalle_ventas (venta_id, repuesto_id, cantidad, precio_unitario, subtotal)
         VALUES (?,?,?,?,?)`,
        [venta.insertId, item.repuesto_id, item.cantidad,
         item.precio_unitario, item.precio_unitario * item.cantidad]
      );

      // Reducir stock
      await conn.query(
        'UPDATE repuestos SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.repuesto_id]
      );
    }

    await conn.commit();
    res.status(201).json({ mensaje: 'Venta registrada', id: venta.insertId, numero, total });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ mensaje: 'Error al registrar venta' });
  } finally {
    conn.release();
  }
};

module.exports = { getVentas, createVenta, getVentaById, buscarPorCodigo };