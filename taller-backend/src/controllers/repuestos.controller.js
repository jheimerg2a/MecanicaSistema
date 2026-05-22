const pool  = require('../config/db');
const XLSX  = require('xlsx');
const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

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

  let imagen = null;
  if (req.file) {
    imagen = await procesarImagen(req.file);
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO repuestos (codigo, nombre, descripcion, categoria, stock, stock_minimo,
        precio_compra, precio_venta, proveedor, unidad_medida, precio_mayor, cantidad_mayor,
        codigo_barra, marca, moneda, marca_oem, proveedor_oem, codigo_oem, codigo_original,
        precio_dist1, precio_dist2, precio_dist3, imagen)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [codigo, nombre, descripcion, categoria, stock||0, stock_minimo||5,
       precio_compra||0, precio_venta||0, proveedor, unidad_medida, precio_mayor||0,
       cantidad_mayor||0, codigo_barra, marca, moneda||'PEN', marca_oem, proveedor_oem,
       codigo_oem, codigo_original, precio_dist1||0, precio_dist2||0, precio_dist3||0, imagen]
    );
    res.status(201).json({ mensaje: 'Repuesto creado', id: result.insertId });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear repuesto' });
  }
};

const updateRepuesto = async (req, res) => {
  const { nombre, descripcion, categoria, precio_compra, precio_venta,
          proveedor, unidad_medida, precio_mayor, cantidad_mayor,
          codigo_barra, marca, moneda, marca_oem, proveedor_oem, codigo_oem,
          codigo_original, precio_dist1, precio_dist2, precio_dist3 } = req.body;

  // Parsear números correctamente desde FormData (vienen como string)
  const stock        = parseFloat(req.body.stock)        || 0;
  const stock_minimo = parseFloat(req.body.stock_minimo) || 0;

  try {
    let imagen = req.body.imagen_actual || null;
    if (req.file) {
      if (req.body.imagen_actual) {
        const rutaAnterior = path.join(__dirname, '../uploads/repuestos',
          path.basename(req.body.imagen_actual));
        if (fs.existsSync(rutaAnterior)) fs.unlinkSync(rutaAnterior);
      }
      imagen = await procesarImagen(req.file);
    }

    await pool.query(
      `UPDATE repuestos SET nombre=?, descripcion=?, categoria=?, stock=?, stock_minimo=?,
        precio_compra=?, precio_venta=?, proveedor=?, unidad_medida=?, precio_mayor=?,
        cantidad_mayor=?, codigo_barra=?, marca=?, moneda=?, marca_oem=?, proveedor_oem=?,
        codigo_oem=?, codigo_original=?, precio_dist1=?, precio_dist2=?, precio_dist3=?, imagen=?
       WHERE id=?`,
      [nombre, descripcion, categoria, stock, stock_minimo,
       parseFloat(precio_compra)||0, parseFloat(precio_venta)||0,
       proveedor, unidad_medida, parseFloat(precio_mayor)||0,
       parseInt(cantidad_mayor)||0, codigo_barra, marca,
       moneda||'PEN', marca_oem, proveedor_oem, codigo_oem, codigo_original,
       parseFloat(precio_dist1)||0, parseFloat(precio_dist2)||0,
       parseFloat(precio_dist3)||0, imagen, req.params.id]
    );
    res.json({ mensaje: 'Repuesto actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar repuesto' });
  }
};

const eliminarRepuesto = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT imagen FROM repuestos WHERE id = ?', [req.params.id]);
    if (rows.length && rows[0].imagen) eliminarImagenDisco(rows[0].imagen);
    await pool.query('DELETE FROM repuestos WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Repuesto eliminado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar repuesto' });
  }
};

const eliminarGrupal = async (req, res) => {
  const { ids, categoria } = req.body;
  try {
    let repuestos = [];
    if (categoria) {
      const [rows] = await pool.query('SELECT id, imagen FROM repuestos WHERE categoria = ?', [categoria]);
      repuestos = rows;
    } else if (ids && ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      const [rows] = await pool.query(`SELECT id, imagen FROM repuestos WHERE id IN (${placeholders})`, ids);
      repuestos = rows;
    } else {
      return res.status(400).json({ mensaje: 'Debes enviar ids o categoria' });
    }

    if (repuestos.length === 0) return res.status(404).json({ mensaje: 'No se encontraron productos' });

    // Eliminar imágenes
    repuestos.forEach(r => { if (r.imagen) eliminarImagenDisco(r.imagen); });

    // Eliminar registros
    const idsEliminar = repuestos.map(r => r.id);
    const placeholders = idsEliminar.map(() => '?').join(',');
    await pool.query(`DELETE FROM repuestos WHERE id IN (${placeholders})`, idsEliminar);

    res.json({ mensaje: `${repuestos.length} producto(s) eliminados`, eliminados: repuestos.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar productos' });
  }
};

const previewEliminar = async (req, res) => {
  const { ids, categoria } = req.body;
  try {
    let rows = [];
    if (categoria) {
      [rows] = await pool.query(
        'SELECT id, nombre, categoria FROM repuestos WHERE categoria = ?', [categoria]);
    } else if (ids && ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      [rows] = await pool.query(
        `SELECT id, nombre, categoria FROM repuestos WHERE id IN (${placeholders})`, ids);
    }
    res.json({ total: rows.length, productos: rows });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener preview' });
  }
};

const importarExcel = async (req, res) => {
  if (!req.file) return res.status(400).json({ mensaje: 'No se envió ningún archivo' });
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const hoja     = workbook.Sheets[workbook.SheetNames[0]];
    const filas    = XLSX.utils.sheet_to_json(hoja, { defval: '' });
    if (filas.length === 0) return res.status(400).json({ mensaje: 'El archivo está vacío' });

    let insertados = 0, actualizados = 0, errores = 0;
    const detalleErrores = [];

    for (const fila of filas) {
      try {
        const nombre          = String(fila['NOMBRE']              || '').trim();
        const codigo          = String(fila['UBICACION']           || '').trim();
        const stock           = parseFloat(fila['STOCK'])          || 0;
        const precio_venta    = parseFloat(fila['PRECIO UNIDAD'])  || 0;
        const precio_compra   = parseFloat(fila['COSTO UNIDAD'])   || 0;
        const unidad_medida   = String(fila['UNIDAD DE MEDIDA']    || '').trim();
        const precio_mayor    = parseFloat(fila['PRECIO POR MAYOR'])    || 0;
        const cantidad_mayor  = parseInt(fila['CANTIDAD POR MAYOR'])    || 0;
        const codigo_barra    = String(fila['CODIGO BARRA']        || '').trim();
        const categoria       = String(fila['CATEGORIA']           || '').trim();
        const marca           = String(fila['MARCA']               || '').trim();
        const moneda          = String(fila['TIPO DE MONEDA']      || 'PEN').trim();
        const marca_oem       = String(fila['MARCA OEM']           || '').trim();
        const proveedor_oem   = String(fila['PROVEEDOR OEM']       || '').trim();
        const codigo_oem      = String(fila['CODIGO OEM']          || '').trim();
        const codigo_original = String(fila['CODIGO ORIGINAL']     || '').trim();
        const precio_dist1    = parseFloat(fila['PRECIO DISTRIBUIDOR 1']) || 0;
        const precio_dist2    = parseFloat(fila['PRECIO DISTRIBUIDOR 2 '] || fila['PRECIO DISTRIBUIDOR 2']) || 0;
        const precio_dist3    = parseFloat(fila['PRECIO DISTRIBUIDOR 3']) || 0;
        const imagen          = String(fila['IMAGEN'] || '').trim() || null;

        if (!nombre) { errores++; continue; }

        const [existe] = await pool.query('SELECT id FROM repuestos WHERE codigo = ?', [codigo]);
        if (existe.length > 0) {
          await pool.query(
            `UPDATE repuestos SET nombre=?, stock=?, precio_venta=?, precio_compra=?,
              unidad_medida=?, precio_mayor=?, cantidad_mayor=?, codigo_barra=?, categoria=?,
              marca=?, moneda=?, marca_oem=?, proveedor_oem=?, codigo_oem=?, codigo_original=?,
              precio_dist1=?, precio_dist2=?, precio_dist3=?
              ${imagen ? ', imagen=?' : ''}
             WHERE codigo=?`,
            imagen
              ? [nombre, stock, precio_venta, precio_compra, unidad_medida, precio_mayor,
                 cantidad_mayor, codigo_barra, categoria, marca, moneda, marca_oem, proveedor_oem,
                 codigo_oem, codigo_original, precio_dist1, precio_dist2, precio_dist3, imagen, codigo]
              : [nombre, stock, precio_venta, precio_compra, unidad_medida, precio_mayor,
                 cantidad_mayor, codigo_barra, categoria, marca, moneda, marca_oem, proveedor_oem,
                 codigo_oem, codigo_original, precio_dist1, precio_dist2, precio_dist3, codigo]
          );
          actualizados++;
        } else {
          await pool.query(
            `INSERT INTO repuestos (codigo, nombre, stock, precio_venta, precio_compra,
              unidad_medida, precio_mayor, cantidad_mayor, codigo_barra, categoria, marca,
              moneda, marca_oem, proveedor_oem, codigo_oem, codigo_original,
              precio_dist1, precio_dist2, precio_dist3, stock_minimo, imagen)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [codigo, nombre, stock, precio_venta, precio_compra, unidad_medida, precio_mayor,
             cantidad_mayor, codigo_barra, categoria, marca, moneda, marca_oem, proveedor_oem,
             codigo_oem, codigo_original, precio_dist1, precio_dist2, precio_dist3, 5, imagen]
          );
          insertados++;
        }
      } catch (err) {
        errores++;
        detalleErrores.push(String(fila['NOMBRE'] || 'Fila desconocida'));
      }
    }
    res.json({ mensaje: 'Importación completada', insertados, actualizados, errores, detalleErrores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al procesar el archivo Excel' });
  }
};

// ── Helpers ──
async function procesarImagen(file) {
  const nombreOptimizado = `opt_${Date.now()}.webp`;
  const rutaSalida = path.join(__dirname, '../uploads/repuestos', nombreOptimizado);
  await sharp(file.path)
    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(rutaSalida);
  // Eliminar original
  if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  return `/uploads/repuestos/${nombreOptimizado}`;
}

function eliminarImagenDisco(imagenUrl) {
  try {
    const nombre = path.basename(imagenUrl);
    const ruta   = path.join(__dirname, '../uploads/repuestos', nombre);
    if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
  } catch (e) {}
}

module.exports = {
  getRepuestos, getStockBajo, createRepuesto, updateRepuesto,
  eliminarRepuesto, eliminarGrupal, previewEliminar, importarExcel
};