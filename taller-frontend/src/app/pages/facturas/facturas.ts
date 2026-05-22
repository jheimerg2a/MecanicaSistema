import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturasService } from '../../core/services/facturas.service';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facturas.html',
  styleUrl: './facturas.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacturasComponent implements OnInit {
  facturas:  any[] = [];
  filtradas: any[] = [];
  busqueda   = '';
  cargando   = false;

  // Modal nueva factura
  mostrarModalFactura  = false;
  guardando            = false;
  busquedaOrden        = '';
  ordenesSugeridas:    any[] = [];
  mostrarSugOrdenes    = false;
  ordenSeleccionada:   any  = null;
  notasFactura         = '';
  buscandoOrdenes      = false;

  // Modal pago
  mostrarModalPago     = false;
  facturaSeleccionada: any = null;
  pagoForm             = { monto: null as any, metodo: 'efectivo', referencia: '' };
  metodos              = ['efectivo','tarjeta','transferencia','yape','plin'];
  guardandoPago        = false;

  // Modal detalle
  mostrarModalDetalle  = false;
  facturaDetalle:      any = null;

  // Boleta
  mostrarBoleta        = false;
  datosBoleta:         any = null;

  estadoPagoConfig: any = {
    pendiente: { label: 'Pendiente',    clase: 'badge bg-warning text-dark' },
    parcial:   { label: 'Pago parcial', clase: 'badge bg-info text-dark' },
    pagado:    { label: 'Pagado',       clase: 'badge bg-success' },
  };

  constructor(
    private facturasService: FacturasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.facturasService.getAll().subscribe({
      next: (data) => {
        this.facturas  = data;
        this.filtradas = data;
        this.cargando  = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  filtrar() {
    const q = this.busqueda.toLowerCase();
    this.filtradas = this.facturas.filter(f =>
      f.numero?.toLowerCase().includes(q) ||
      f.cliente_nombre?.toLowerCase().includes(q) ||
      f.placa?.toLowerCase().includes(q) ||
      f.orden_codigo?.toLowerCase().includes(q)
    );
  }

  // ── Buscar orden para facturar ──
  buscarOrden() {
    const q = this.busquedaOrden.trim();
    if (q.length < 2) { this.ordenesSugeridas = []; this.mostrarSugOrdenes = false; return; }
    this.buscandoOrdenes = true;
    this.facturasService.buscarOrdenes(q).subscribe({
      next: (data) => {
        this.ordenesSugeridas = data;
        this.buscandoOrdenes  = false;
        setTimeout(() => { this.mostrarSugOrdenes = data.length > 0; this.cdr.detectChanges(); });
      },
      error: () => { this.buscandoOrdenes = false; this.cdr.detectChanges(); }
    });
  }

  seleccionarOrden(o: any) {
    this.ordenSeleccionada = o;
    this.busquedaOrden     = `${o.codigo} — ${o.cliente} (${o.placa})`;
    this.mostrarSugOrdenes = false;
    this.cdr.detectChanges();
  }

  abrirModalFactura() {
    this.ordenSeleccionada = null;
    this.busquedaOrden     = '';
    this.notasFactura      = '';
    this.ordenesSugeridas  = [];
    this.mostrarModalFactura = true;
    this.cdr.detectChanges();
  }

  generarFactura() {
    if (!this.ordenSeleccionada) { alert('Selecciona una orden'); return; }
    this.guardando = true;
    this.facturasService.create({ orden_id: this.ordenSeleccionada.id, notas: this.notasFactura }).subscribe({
      next: (res) => {
        this.guardando           = false;
        this.mostrarModalFactura = false;
        this.cdr.detectChanges();
        this.cargar();
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.mensaje || 'Error al generar factura');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Pago ──
  abrirPago(factura: any) {
    this.facturaSeleccionada = factura;
    this.pagoForm            = { monto: null, metodo: 'efectivo', referencia: '' };
    this.mostrarModalPago    = true;
    this.cdr.detectChanges();
  }

  registrarPago() {
    if (!this.pagoForm.monto || this.pagoForm.monto <= 0) { alert('Ingresa un monto válido'); return; }
    this.guardandoPago = true;
    this.facturasService.registrarPago(this.facturaSeleccionada.id, this.pagoForm).subscribe({
      next: (res) => {
        this.guardandoPago    = false;
        this.mostrarModalPago = false;
        // Mostrar boleta automáticamente
        this.datosBoleta = {
          ...this.facturaSeleccionada,
          pago: this.pagoForm,
          fecha: new Date()
        };
        this.mostrarBoleta = true;
        this.cdr.detectChanges();
        this.cargar();
      },
      error: (err) => {
        this.guardandoPago = false;
        alert(err.error?.mensaje || 'Error al registrar pago');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Detalle ──
  verDetalle(factura: any) {
    this.facturasService.getByOrden(factura.orden_id).subscribe({
      next: (data) => {
        this.facturaDetalle   = data;
        this.mostrarModalDetalle = true;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Boleta ──
  imprimirBoleta() {
    const f     = this.datosBoleta || this.facturaDetalle;
    const fecha = new Date().toLocaleString('es-PE');

    const filaServicios = (f.servicios || []).map((s: any) => `
      <tr>
        <td>${s.servicio}</td>
        <td style="text-align:right">S/ ${parseFloat(s.precio).toFixed(2)}</td>
      </tr>`).join('');

    const filaRepuestos = (f.repuestos || []).map((r: any) => `
      <tr>
        <td>${r.repuesto} x${r.cantidad}</td>
        <td style="text-align:right">S/ ${(r.precio_unitario * r.cantidad).toFixed(2)}</td>
      </tr>`).join('');

    const html = `
      <html><head><title>Factura ${f.numero}</title>
      <style>
        body { font-family:'Courier New',monospace; font-size:12px; width:300px; margin:0 auto; }
        h2   { text-align:center; margin:4px 0; font-size:13px; }
        p    { margin:2px 0; font-size:11px; }
        table{ width:100%; border-collapse:collapse; margin:6px 0; }
        th   { border-bottom:1px solid #000; padding:2px; font-size:10px; text-align:left; }
        td   { padding:2px; font-size:11px; }
        .total-row { border-top:1px solid #000; font-weight:bold; }
        .center { text-align:center; }
        .right  { text-align:right; }
        hr { border:none; border-top:1px dashed #000; margin:4px 0; }
        .seccion { font-weight:bold; font-size:10px; margin-top:4px; }
      </style></head><body>
      <h2>TALLER MECÁNICO</h2>
      <p class="center">BOLETA DE SERVICIO</p>
      <p class="center"><strong>${f.numero}</strong></p>
      <hr>
      <p>Fecha: ${fecha}</p>
      <p>Cliente: ${f.cliente_nombre || '—'}</p>
      ${f.cliente_dni ? `<p>DNI: ${f.cliente_dni}</p>` : ''}
      <p>Vehículo: ${f.vehiculo || '—'} (${f.placa || '—'})</p>
      <p>Orden: ${f.orden_codigo || '—'}</p>
      <hr>
      ${filaServicios || filaRepuestos ? `
        <table>
          <tr><th>Descripción</th><th style="text-align:right">Monto</th></tr>
          ${filaServicios}
          ${filaRepuestos}
        </table>` : ''}
      <hr>
      <div class="d-flex" style="display:flex;justify-content:space-between">
        <p>Subtotal:</p><p class="right">S/ ${parseFloat(f.subtotal).toFixed(2)}</p>
      </div>
      <div style="display:flex;justify-content:space-between">
        <p>IGV (18%):</p><p>S/ ${parseFloat(f.igv).toFixed(2)}</p>
      </div>
      <div style="display:flex;justify-content:space-between;font-weight:bold">
        <p>TOTAL:</p><p>S/ ${parseFloat(f.total).toFixed(2)}</p>
      </div>
      <hr>
      ${f.pago ? `<p>Pago recibido: S/ ${parseFloat(f.pago.monto).toFixed(2)} (${f.pago.metodo.toUpperCase()})</p>` : ''}
      <hr>
      <p class="center">¡Gracias por su preferencia!</p>
      </body></html>`;

    const ventana = window.open('', '_blank', 'width=380,height=650');
    ventana!.document.write(html);
    ventana!.document.close();
    ventana!.focus();
    setTimeout(() => ventana!.print(), 500);
  }

  getPagoEstado(estado: string) {
    return this.estadoPagoConfig[estado] || { label: estado, clase: 'badge bg-secondary' };
  }

  getSaldoPendiente(factura: any) {
    const pagado = factura.pagos?.reduce((a: number, p: any) => a + parseFloat(p.monto), 0) || 0;
    return parseFloat(factura.total) - pagado;
  }
}
