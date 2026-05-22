const pool = require('../config/db');

const getFacturas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, o.codigo AS orden_codigo,
             CONCAT(c.nombre,' ',c.apellido) AS cliente_nombre,
             v.placa, CONCAT(v.marca,' ',v.modelo) AS vehiculo
      FROM facturas f
      JOIN ordenes_trabajo o ON o.id = f.orden_id
      JOIN vehiculos v       ON v.id = o.vehiculo_id
      JOIN clientes c        ON c.id = v.cliente_id
      ORDER BY f.fecha_emision DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener facturas' });
  }
};

const buscarOrdenes = async (req, res) => {
  const { q } = req.query;
  try {
    const termino = `%${q}%`;
    const [rows] = await pool.query(`
      SELECT ot.id, ot.codigo, ot.estado, ot.mano_obra,
             CONCAT(c.nombre,' ',c.apellido) AS cliente,
             c.telefono,
             v.placa, CONCAT(v.marca,' ',v.modelo) AS vehiculo
      FROM ordenes_trabajo ot
      JOIN vehiculos v ON v.id = ot.vehiculo_id
      JOIN clientes  c ON c.id = v.cliente_id
      WHERE ot.estado NOT IN ('cancelado')
        AND ot.id NOT IN (SELECT orden_id FROM facturas)
        AND (ot.codigo LIKE ? OR CONCAT(c.nombre,' ',c.apellido) LIKE ? OR v.placa LIKE ?)
      ORDER BY ot.id DESC
      LIMIT 10`,
      [termino, termino, termino]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al buscar órdenes' });
  }
};

const getFacturaByOrden = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, o.codigo AS orden_codigo,
             CONCAT(c.nombre,' ',c.apellido) AS cliente_nombre,
             c.dni AS cliente_dni, c.telefono,
             v.placa, CONCAT(v.marca,' ',v.modelo) AS vehiculo
      FROM facturas f
      JOIN ordenes_trabajo o ON o.id = f.orden_id
      JOIN vehiculos v       ON v.id = o.vehiculo_id
      JOIN clientes c        ON c.id = v.cliente_id
      WHERE f.orden_id = ?`, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ mensaje: 'Factura no encontrada' });

    const [pagos]     = await pool.query('SELECT * FROM pagos WHERE factura_id = ?', [rows[0].id]);
    const [servicios] = await pool.query(`
      SELECT os.precio, s.nombre AS servicio
      FROM orden_servicios os
      JOIN servicios s ON s.id = os.servicio_id
      WHERE os.orden_id = ?`, [req.params.id]);
    const [repuestos] = await pool.query(`
      SELECT orep.cantidad, orep.precio_unitario, r.nombre AS repuesto
      FROM orden_repuestos orep
      JOIN repuestos r ON r.id = orep.repuesto_id
      WHERE orep.orden_id = ?`, [req.params.id]);

    res.json({ ...rows[0], pagos, servicios, repuestos });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener factura' });
  }
};

const createFactura = async (req, res) => {
  const { orden_id, notas } = req.body;
  if (!orden_id) return res.status(400).json({ mensaje: 'orden_id es requerido' });
  try {
    const [orden]     = await pool.query('SELECT mano_obra FROM ordenes_trabajo WHERE id = ?', [orden_id]);
    const [servicios] = await pool.query('SELECT SUM(precio) AS total FROM orden_servicios WHERE orden_id = ?', [orden_id]);
    const [repuestos] = await pool.query('SELECT SUM(cantidad * precio_unitario) AS total FROM orden_repuestos WHERE orden_id = ?', [orden_id]);

    const manoObra  = parseFloat(orden[0].mano_obra)    || 0;
    const totServ   = parseFloat(servicios[0].total)    || 0;
    const totRep    = parseFloat(repuestos[0].total)    || 0;
    const subtotal  = manoObra + totServ + totRep;
    const igv       = parseFloat((subtotal * 0.18).toFixed(2));
    const total     = parseFloat((subtotal + igv).toFixed(2));

    const [last]   = await pool.query('SELECT COUNT(*) AS total FROM facturas');
    const numero   = `F-${new Date().getFullYear()}-${String(last[0].total + 1).padStart(3,'0')}`;

    const [result] = await pool.query(
      'INSERT INTO facturas (orden_id, numero, subtotal, igv, total, notas) VALUES (?,?,?,?,?,?)',
      [orden_id, numero, subtotal, igv, total, notas]
    );
    res.status(201).json({ mensaje: 'Factura generada', id: result.insertId, numero, total, subtotal, igv });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al generar factura' });
  }
};

const registrarPago = async (req, res) => {
  const { monto, metodo, referencia } = req.body;
  if (!monto || !metodo) return res.status(400).json({ mensaje: 'monto y metodo son requeridos' });
  try {
    await pool.query(
      'INSERT INTO pagos (factura_id, monto, metodo, referencia) VALUES (?,?,?,?)',
      [req.params.id, monto, metodo, referencia]
    );
    const [factura] = await pool.query('SELECT total FROM facturas WHERE id = ?', [req.params.id]);
    const [pagado]  = await pool.query('SELECT SUM(monto) AS pagado FROM pagos WHERE factura_id = ?', [req.params.id]);
    const totalPagado  = parseFloat(pagado[0].pagado)   || 0;
    const totalFactura = parseFloat(factura[0].total);
    const estadoPago   = totalPagado >= totalFactura ? 'pagado' : 'parcial';
    await pool.query('UPDATE facturas SET estado_pago = ? WHERE id = ?', [estadoPago, req.params.id]);
    res.json({ mensaje: 'Pago registrado', estado_pago: estadoPago, total_pagado: totalPagado });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al registrar pago' });
  }
};

module.exports = { getFacturas, buscarOrdenes, getFacturaByOrden, createFactura, registrarPago };