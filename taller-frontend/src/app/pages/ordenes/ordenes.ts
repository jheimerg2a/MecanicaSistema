import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenesService } from '../../core/services/ordenes.service';
import { ClientesService } from '../../core/services/clientes.service';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordenes.html',
  styleUrl: './ordenes.css'
})
export class OrdenesComponent implements OnInit {
  ordenes:   any[] = [];
  filtradas: any[] = [];
  busqueda  = '';
  cargando  = false;
  mostrarModal       = false;
  mostrarModalEstado = false;
  guardando          = false;
  ordenForm: any     = {};
  ordenSeleccionada: any = {};
  estadoForm         = { estado: '', comentario: '' };

  estadoConfig: any = {
    recibido:         { label: 'Recibido',           clase: 'badge bg-secondary' },
    diagnostico:      { label: 'En diagnóstico',     clase: 'badge bg-info text-dark' },
    en_reparacion:    { label: 'En reparación',      clase: 'badge bg-primary' },
    espera_repuestos: { label: 'Espera repuestos',   clase: 'badge bg-warning text-dark' },
    listo:            { label: 'Listo para retirar', clase: 'badge bg-success' },
    entregado:        { label: 'Entregado',          clase: 'badge bg-dark' },
    cancelado:        { label: 'Cancelado',          clase: 'badge bg-danger' },
  };

  estados = Object.keys(this.estadoConfig);

  constructor(
    private ordenesService: OrdenesService,
    private clientesService: ClientesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.ordenesService.getAll().subscribe({
      next: (data) => {
        this.ordenes  = data;
        this.filtradas = data;
        this.cargando  = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  filtrar() {
    const q = this.busqueda.toLowerCase();
    this.filtradas = this.ordenes.filter(o =>
      o.codigo?.toLowerCase().includes(q) ||
      o.cliente?.toLowerCase().includes(q) ||
      o.placa?.toLowerCase().includes(q)
    );
  }

  nueva() {
    this.ordenForm    = {};
    this.mostrarModal = true;
  }

  guardar() {
    this.guardando = true;
    this.ordenesService.create(this.ordenForm).subscribe({
      next: () => {
        this.guardando    = false;
        this.mostrarModal = false;
        this.cdr.detectChanges();
        this.cargar();
      },
      error: () => { this.guardando = false; this.cdr.detectChanges(); }
    });
  }

  abrirEstado(orden: any) {
    this.ordenSeleccionada  = orden;
    this.estadoForm         = { estado: orden.estado, comentario: '' };
    this.mostrarModalEstado = true;
  }

  actualizarEstado() {
    this.guardando = true;
    this.ordenesService.updateEstado(
      this.ordenSeleccionada.id,
      this.estadoForm.estado,
      this.estadoForm.comentario
    ).subscribe({
      next: () => {
        this.guardando          = false;
        this.mostrarModalEstado = false;
        this.cdr.detectChanges();
        this.cargar();
      },
      error: () => { this.guardando = false; this.cdr.detectChanges(); }
    });
  }

  getBadge(estado: string) {
    return this.estadoConfig[estado] || { label: estado, clase: 'badge bg-secondary' };
  }
}
