import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturasService } from '../../core/services/facturas.service';
import { OrdenesService } from '../../core/services/ordenes.service';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facturas.html',
  styleUrl: './facturas.css'
})
export class FacturasComponent implements OnInit {
  facturas:  any[] = [];
  filtradas: any[] = [];
  busqueda   = '';
  cargando   = false;

  mostrarModalFactura = false;
  mostrarModalPago    = false;
  mostrarModalDetalle = false;

  guardando       = false;
  facturaForm     = { orden_id: null as any, notas: '' };
  pagoForm        = { monto: null as any, metodo: 'efectivo', referencia: '' };
  facturaSeleccionada: any = null;
  ordenesSinFactura: any[] = [];

  metodos = ['efectivo','tarjeta','transferencia','yape','plin'];

  estadoPagoConfig: any = {
    pendiente: { label: 'Pendiente', clase: 'badge bg-warning text-dark' },
    parcial:   { label: 'Pago parcial', clase: 'badge bg-info text-dark' },
    pagado:    { label: 'Pagado', clase: 'badge bg-success' },
  };

  constructor(
    private facturasService: FacturasService,
    private ordenesService: OrdenesService,
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
      f.estado_pago?.toLowerCase().includes(q)
    );
  }

  abrirModalFactura() {
    this.facturaForm = { orden_id: null, notas: '' };
    this.ordenesService.getAll().subscribe({
      next: (ordenes) => {
        const idsConFactura = this.facturas.map(f => f.orden_id);
        this.ordenesSinFactura = ordenes.filter(o =>
          !idsConFactura.includes(o.id) && o.estado !== 'cancelado'
        );
        this.mostrarModalFactura = true;
        this.cdr.detectChanges();
      }
    });
  }

  generarFactura() {
    if (!this.facturaForm.orden_id) {
      alert('Selecciona una orden');
      return;
    }
    this.guardando = true;
    this.facturasService.create(this.facturaForm).subscribe({
      next: () => {
        this.guardando          = false;
        this.mostrarModalFactura = false;
        this.cargar();
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.mensaje || 'Error al generar factura');
        this.cdr.detectChanges();
      }
    });
  }

  abrirPago(factura: any) {
    this.facturaSeleccionada = factura;
    this.pagoForm = { monto: null, metodo: 'efectivo', referencia: '' };
    this.mostrarModalPago = true;
  }

  registrarPago() {
    if (!this.pagoForm.monto || this.pagoForm.monto <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    this.guardando = true;
    this.facturasService.registrarPago(this.facturaSeleccionada.id, this.pagoForm).subscribe({
      next: () => {
        this.guardando        = false;
        this.mostrarModalPago = false;
        this.cargar();
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.mensaje || 'Error al registrar pago');
        this.cdr.detectChanges();
      }
    });
  }

  verDetalle(factura: any) {
    this.facturasService.getByOrden(factura.orden_id).subscribe({
      next: (data) => {
        this.facturaSeleccionada  = data;
        this.mostrarModalDetalle  = true;
        this.cdr.detectChanges();
      }
    });
  }

  getPagoEstado(estado: string) {
    return this.estadoPagoConfig[estado] || { label: estado, clase: 'badge bg-secondary' };
  }

  getSaldoPendiente(factura: any) {
    const pagado = factura.pagos?.reduce((acc: number, p: any) => acc + parseFloat(p.monto), 0) || 0;
    return parseFloat(factura.total) - pagado;
  }
}
