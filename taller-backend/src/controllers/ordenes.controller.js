const pool = require('../config/db');

const getOrdenes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_ordenes_resumen ORDER BY fecha_ingreso DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener órdenes' });
  }
};

const getOrdenById = async (req, res) => {
  try {
    const [orden] = await pool.query('SELECT * FROM v_ordenes_resumen WHERE id = ?', [req.params.id]);
    if (orden.length === 0) return res.status(404).json({ mensaje: 'Orden no encontrada' });

    const [servicios]  = await pool.query(
      'SELECT os.*, s.nombre AS servicio FROM orden_servicios os JOIN servicios s ON s.id = os.servicio_id WHERE os.orden_id = ?',
      [req.params.id]);
    const [repuestos]  = await pool.query(
      'SELECT orep.*, r.nombre AS repuesto FROM orden_repuestos orep JOIN repuestos r ON r.id = orep.repuesto_id WHERE orep.orden_id = ?',
      [req.params.id]);
    const [seguimiento] = await pool.query(
      'SELECT * FROM seguimiento WHERE orden_id = ? ORDER BY fecha ASC', [req.params.id]);

    res.json({ ...orden[0], servicios, repuestos, seguimiento });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener orden' });
  }
};

const createOrden = async (req, res) => {
  const { vehiculo_id, mecanico_id, descripcion_problema, fecha_estimada, km_actual } = req.body;
  if (!vehiculo_id || !descripcion_problema) {
    return res.status(400).json({ mensaje: 'vehiculo_id y descripcion_problema son requeridos' });
  }
  try {
    // Generar código automático OT-2025-001
    const [last] = await pool.query('SELECT COUNT(*) AS total FROM ordenes_trabajo');
    const numero = String(last[0].total + 1).padStart(3, '0');
    const codigo = `OT-${new Date().getFullYear()}-${numero}`;

    const [result] = await pool.query(
      'INSERT INTO ordenes_trabajo (codigo, vehiculo_id, mecanico_id, descripcion_problema, fecha_estimada, km_actual) VALUES (?,?,?,?,?,?)',
      [codigo, vehiculo_id, mecanico_id, descripcion_problema, fecha_estimada, km_actual]
    );

    // Registrar primer estado en seguimiento
    await pool.query(
      'INSERT INTO seguimiento (orden_id, usuario_id, estado, comentario) VALUES (?,?,?,?)',
      [result.insertId, req.usuario.id, 'recibido', 'Vehículo recibido en el taller']
    );

    res.status(201).json({ mensaje: 'Orden creada', id: result.insertId, codigo });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear orden' });
  }
};

const updateEstado = async (req, res) => {
  const { estado, comentario } = req.body;
  const estadosValidos = ['recibido','diagnostico','en_reparacion','espera_repuestos','listo','entregado','cancelado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado no válido' });
  }
  try {
    await pool.query('UPDATE ordenes_trabajo SET estado = ? WHERE id = ?', [estado, req.params.id]);
    await pool.query(
      'INSERT INTO seguimiento (orden_id, usuario_id, estado, comentario) VALUES (?,?,?,?)',
      [req.params.id, req.usuario.id, estado, comentario || '']
    );
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar estado' });
  }
};

const getEstadisticas = async (req, res) => {
  try {
    const [[ordenes]]    = await pool.query(`SELECT COUNT(*) AS total,
      SUM(estado = 'recibido')         AS recibido,
      SUM(estado = 'en_reparacion')    AS en_reparacion,
      SUM(estado = 'listo')            AS listo,
      SUM(estado = 'entregado')        AS entregado
      FROM ordenes_trabajo`);

    const [[clientes]]   = await pool.query('SELECT COUNT(*) AS total FROM clientes');
    const [[vehiculos]]  = await pool.query('SELECT COUNT(*) AS total FROM vehiculos');
    const [[stockBajo]]  = await pool.query('SELECT COUNT(*) AS total FROM v_stock_bajo');
    const [[ingresos]]   = await pool.query(`SELECT COALESCE(SUM(total),0) AS total
      FROM facturas WHERE MONTH(fecha_emision) = MONTH(NOW())
      AND YEAR(fecha_emision) = YEAR(NOW())`);
    const [ultimasOrdenes] = await pool.query(
      'SELECT * FROM v_ordenes_resumen ORDER BY fecha_ingreso DESC LIMIT 5'
    );

    res.json({
      ordenes,
      clientes:      clientes.total,
      vehiculos:     vehiculos.total,
      stockBajo:     stockBajo.total,
      ingresosMes:   ingresos.total,
      ultimasOrdenes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
  }
};
module.exports = { getOrdenes, getOrdenById, createOrden, updateEstado, getEstadisticas };