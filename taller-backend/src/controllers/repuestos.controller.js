const pool = require('../config/db');
const XLSX = require('xlsx');

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
  const { codigo, nombre, descripcion, categoria, stock, stock_minimo,
          precio_compra, precio_venta, proveedor, unidad_medida, precio_mayor,
          cantidad_mayor, codigo_barra, marca, moneda, marca_oem, proveedor_oem,
          codigo_oem, codigo_original, precio_dist1, precio_dist2, precio_dist3 } = req.body;
  if (!nombre) return res.status(400).json({ mensaje: 'El nombre es requerido' });
  try {
    const [result] = await pool.query(
      `INSERT INTO repuestos (codigo, nombre, descripcion, categoria, stock, stock_minimo,
        precio_compra, precio_venta, proveedor, unidad_medida, precio_mayor, cantidad_mayor,
        codigo_barra, marca, moneda, marca_oem, proveedor_oem, codigo_oem, codigo_original,
        precio_dist1, precio_dist2, precio_dist3)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [codigo, nombre, descripcion, categoria, stock||0, stock_minimo||5,
       precio_compra||0, precio_venta||0, proveedor, unidad_medida, precio_mayor||0,
       cantidad_mayor||0, codigo_barra, marca, moneda||'PEN', marca_oem, proveedor_oem,
       codigo_oem, codigo_original, precio_dist1||0, precio_dist2||0, precio_dist3||0]
    );
    res.status(201).json({ mensaje: 'Repuesto creado', id: result.insertId });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear repuesto' });
  }
};

const updateRepuesto = async (req, res) => {
  const { nombre, descripcion, categoria, stock, stock_minimo, precio_compra,
          precio_venta, proveedor, unidad_medida, precio_mayor, cantidad_mayor,
          codigo_barra, marca, moneda, marca_oem, proveedor_oem, codigo_oem,
          codigo_original, precio_dist1, precio_dist2, precio_dist3 } = req.body;
  try {
    await pool.query(
      `UPDATE repuestos SET nombre=?, descripcion=?, categoria=?, stock=?, stock_minimo=?,
        precio_compra=?, precio_venta=?, proveedor=?, unidad_medida=?, precio_mayor=?,
        cantidad_mayor=?, codigo_barra=?, marca=?, moneda=?, marca_oem=?, proveedor_oem=?,
        codigo_oem=?, codigo_original=?, precio_dist1=?, precio_dist2=?, precio_dist3=?
       WHERE id=?`,
      [nombre, descripcion, categoria, stock, stock_minimo, precio_compra, precio_venta,
       proveedor, unidad_medida, precio_mayor||0, cantidad_mayor||0, codigo_barra, marca,
       moneda||'PEN', marca_oem, proveedor_oem, codigo_oem, codigo_original,
       precio_dist1||0, precio_dist2||0, precio_dist3||0, req.params.id]
    );
    res.json({ mensaje: 'Repuesto actualizado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar repuesto' });
  }
};

const importarExcel = async (req, res) => {
  if (!req.file) return res.status(400).json({ mensaje: 'No se envió ningún archivo' });

  try {
    const workbook  = XLSX.read(req.file.buffer, { type: 'buffer' });
    const hoja      = workbook.Sheets[workbook.SheetNames[0]];
    const filas     = XLSX.utils.sheet_to_json(hoja, { defval: '' });

    if (filas.length === 0) return res.status(400).json({ mensaje: 'El archivo está vacío' });

    let insertados  = 0;
    let actualizados = 0;
    let errores     = 0;
    const detalleErrores = [];

    for (const fila of filas) {
      try {
        const nombre         = String(fila['NOMBRE']              || '').trim();
        const codigo         = String(fila['UBICACION']           || '').trim();
        const stock          = parseFloat(fila['STOCK'])          || 0;
        const precio_venta   = parseFloat(fila['PRECIO UNIDAD'])  || 0;
        const precio_compra  = parseFloat(fila['COSTO UNIDAD'])   || 0;
        const unidad_medida  = String(fila['UNIDAD DE MEDIDA']    || '').trim();
        const precio_mayor   = parseFloat(fila['PRECIO POR MAYOR'])   || 0;
        const cantidad_mayor = parseInt(fila['CANTIDAD POR MAYOR'])   || 0;
        const codigo_barra   = String(fila['CODIGO BARRA']        || '').trim();
        const categoria      = String(fila['CATEGORIA']           || '').trim();
        const marca          = String(fila['MARCA']               || '').trim();
        const moneda         = String(fila['TIPO DE MONEDA']      || 'PEN').trim();
        const marca_oem      = String(fila['MARCA OEM']           || '').trim();
        const proveedor_oem  = String(fila['PROVEEDOR OEM']       || '').trim();
        const codigo_oem     = String(fila['CODIGO OEM']          || '').trim();
        const codigo_original = String(fila['CODIGO ORIGINAL']    || '').trim();
        const precio_dist1   = parseFloat(fila['PRECIO DISTRIBUIDOR 1']) || 0;
        const precio_dist2   = parseFloat(fila['PRECIO DISTRIBUIDOR 2 '] || fila['PRECIO DISTRIBUIDOR 2']) || 0;
        const precio_dist3   = parseFloat(fila['PRECIO DISTRIBUIDOR 3']) || 0;

        if (!nombre) { errores++; continue; }

        // Verificar si ya existe por código
        const [existe] = await pool.query(
          'SELECT id FROM repuestos WHERE codigo = ?', [codigo]
        );

        if (existe.length > 0) {
          // Actualizar
          await pool.query(
            `UPDATE repuestos SET nombre=?, stock=?, precio_venta=?, precio_compra=?,
              unidad_medida=?, precio_mayor=?, cantidad_mayor=?, codigo_barra=?, categoria=?,
              marca=?, moneda=?, marca_oem=?, proveedor_oem=?, codigo_oem=?, codigo_original=?,
              precio_dist1=?, precio_dist2=?, precio_dist3=?
             WHERE codigo=?`,
            [nombre, stock, precio_venta, precio_compra, unidad_medida, precio_mayor,
             cantidad_mayor, codigo_barra, categoria, marca, moneda, marca_oem, proveedor_oem,
             codigo_oem, codigo_original, precio_dist1, precio_dist2, precio_dist3, codigo]
          );
          actualizados++;
        } else {
          // Insertar nuevo
          await pool.query(
            `INSERT INTO repuestos (codigo, nombre, stock, precio_venta, precio_compra,
              unidad_medida, precio_mayor, cantidad_mayor, codigo_barra, categoria, marca,
              moneda, marca_oem, proveedor_oem, codigo_oem, codigo_original,
              precio_dist1, precio_dist2, precio_dist3, stock_minimo)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [codigo, nombre, stock, precio_venta, precio_compra, unidad_medida, precio_mayor,
             cantidad_mayor, codigo_barra, categoria, marca, moneda, marca_oem, proveedor_oem,
             codigo_oem, codigo_original, precio_dist1, precio_dist2, precio_dist3, 5]
          );
          insertados++;
        }
      } catch (err) {
        errores++;
        detalleErrores.push(String(fila['NOMBRE'] || 'Fila desconocida'));
      }
    }

    res.json({
      mensaje: `Importación completada`,
      insertados,
      actualizados,
      errores,
      detalleErrores
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al procesar el archivo Excel' });
  }
};

module.exports = { getRepuestos, createRepuesto, updateRepuesto, getStockBajo, importarExcel };