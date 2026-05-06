import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenesService } from '../../core/services/ordenes.service';
import { HttpClient } from '@angular/common/http';

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
  busqueda   = '';
  filtroEstado = 'todos';
  cargando   = false;

  // Modales
  mostrarModalNueva   = false;
  mostrarModalDetalle = false;
  mostrarModalEstado  = false;

  guardando = false;

  // Nueva orden
  ordenForm: any  = {};
  busquedaVehiculo = '';
  vehiculosFiltrados: any[] = [];
  vehiculoSeleccionado: any = null;
  busquedaMecanico = '';
  mecanicosFiltrados: any[] = [];
  mecanicoSeleccionado: any = null;
  mostrarVehiculos = false;
  mostrarMecanicos = false;

  // Detalle orden
  ordenDetalle: any = null;
  estadoForm = { estado: '', comentario: '' };

  // Agregar servicio/repuesto
  serviciosDisponibles: any[] = [];
  repuestosDisponibles: any[] = [];
  busquedaServicio = '';
  busquedaRepuesto = '';
  serviciosFiltrados: any[] = [];
  repuestosFiltrados: any[] = [];
  mostrarSugerenciasServicio = false;
  mostrarSugerenciasRepuesto = false;
  servicioForm: any = {};
  repuestoForm: any = {};

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

  private urlVehiculos  = 'http://localhost:3000/api/vehiculos';
  private urlUsuarios   = 'http://localhost:3000/api/usuarios';
  private urlServicios  = 'http://localhost:3000/api/servicios';
  private urlRepuestos  = 'http://localhost:3000/api/repuestos';

  constructor(
    private ordenesService: OrdenesService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargar();
    this.cargarServicios();
    this.cargarRepuestos();
  }

  cargar() {
    this.cargando = true;
    this.ordenesService.getAll().subscribe({
      next: (data) => {
        this.ordenes = data;
        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  aplicarFiltros() {
    let resultado = this.ordenes;
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(o => o.estado === this.filtroEstado);
    }
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      resultado = resultado.filter(o =>
        o.codigo?.toLowerCase().includes(q) ||
        o.cliente?.toLowerCase().includes(q) ||
        o.placa?.toLowerCase().includes(q) ||
        o.mecanico?.toLowerCase().includes(q)
      );
    }
    this.filtradas = resultado;
  }

  // ── Búsqueda de vehículo por nombre del dueño ──
  buscarVehiculo() {
    const q = this.busquedaVehiculo.trim().toLowerCase();
    if (q.length < 2) { this.vehiculosFiltrados = []; return; }
    this.http.get<any[]>(this.urlVehiculos).subscribe({
      next: (data) => {
        this.vehiculosFiltrados = data.filter(v =>
          v.cliente?.toLowerCase().includes(q) ||
          v.placa?.toLowerCase().includes(q) ||
          v.marca?.toLowerCase().includes(q)
        ).slice(0, 6);
        this.mostrarVehiculos = this.vehiculosFiltrados.length > 0;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarVehiculo(v: any) {
    this.vehiculoSeleccionado  = v;
    this.ordenForm.vehiculo_id = v.id;
    this.busquedaVehiculo      = `${v.cliente} — ${v.marca} ${v.modelo} (${v.placa})`;
    this.mostrarVehiculos      = false;
  }

  // ── Búsqueda de mecánico por nombre ──
  buscarMecanico() {
    const q = this.busquedaMecanico.trim().toLowerCase();
    if (q.length < 2) { this.mecanicosFiltrados = []; return; }
    this.http.get<any[]>(this.urlUsuarios).subscribe({
      next: (data) => {
        this.mecanicosFiltrados = data.filter(u =>
          u.activo && u.nombre?.toLowerCase().includes(q)
        ).slice(0, 5);
        this.mostrarMecanicos = this.mecanicosFiltrados.length > 0;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarMecanico(m: any) {
    this.mecanicoSeleccionado   = m;
    this.ordenForm.mecanico_id  = m.id;
    this.busquedaMecanico       = m.nombre;
    this.mostrarMecanicos       = false;
  }

  // ── Nueva orden ──
  nueva() {
    this.ordenForm             = {};
    this.busquedaVehiculo      = '';
    this.busquedaMecanico      = '';
    this.vehiculoSeleccionado  = null;
    this.mecanicoSeleccionado  = null;
    this.mostrarModalNueva     = true;
  }

  guardarOrden() {
    if (!this.ordenForm.vehiculo_id || !this.ordenForm.descripcion_problema) {
      alert('Selecciona un vehículo y describe el problema');
      return;
    }
    this.guardando = true;
    this.ordenesService.create(this.ordenForm).subscribe({
      next: () => {
        this.guardando        = false;
        this.mostrarModalNueva = false;
        this.cdr.detectChanges();
        this.cargar();
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.mensaje || 'Error al crear orden');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Ver detalle ──
  verDetalle(orden: any) {
    this.ordenesService.getById(orden.id).subscribe({
      next: (data) => {
        this.ordenDetalle       = data;
        this.estadoForm         = { estado: data.estado, comentario: '' };
        this.busquedaServicio   = '';
        this.busquedaRepuesto   = '';
        this.servicioForm       = {};
        this.repuestoForm       = {};
        this.mostrarModalDetalle = true;
        this.cdr.detectChanges();
      }
    });
  }

  recargarDetalle() {
    if (!this.ordenDetalle) return;
    this.ordenesService.getById(this.ordenDetalle.id).subscribe({
      next: (data) => { this.ordenDetalle = data; this.cdr.detectChanges(); }
    });
  }

  // ── Estado ──
  actualizarEstado() {
    if (!this.estadoForm.estado) return;
    this.guardando = true;
    this.ordenesService.updateEstado(
      this.ordenDetalle.id,
      this.estadoForm.estado,
      this.estadoForm.comentario
    ).subscribe({
      next: () => {
        this.guardando = false;
        this.recargarDetalle();
        this.cargar();
      },
      error: () => { this.guardando = false; this.cdr.detectChanges(); }
    });
  }

  // ── Mano de obra ──
  actualizarManoObra() {
    this.ordenesService.updateManoObra(this.ordenDetalle.id, this.ordenDetalle.mano_obra).subscribe({
      next: () => this.recargarDetalle()
    });
  }

  // ── Servicios ──
  cargarServicios() {
    this.http.get<any[]>(this.urlServicios).subscribe({
      next: (data) => { this.serviciosDisponibles = data.filter(s => s.activo); }
    });
  }

  buscarServicio() {
    const q = this.busquedaServicio.toLowerCase();
    this.serviciosFiltrados    = this.serviciosDisponibles
      .filter(s => s.nombre.toLowerCase().includes(q)).slice(0, 6);
    this.mostrarSugerenciasServicio = this.serviciosFiltrados.length > 0;
  }

  seleccionarServicio(s: any) {
    this.servicioForm           = { servicio_id: s.id, precio: s.precio_base, observacion: '' };
    this.busquedaServicio       = s.nombre;
    this.mostrarSugerenciasServicio = false;
  }

  agregarServicio() {
    if (!this.servicioForm.servicio_id) { alert('Selecciona un servicio'); return; }
    this.ordenesService.agregarServicio(this.ordenDetalle.id, this.servicioForm).subscribe({
      next: () => {
        this.busquedaServicio = '';
        this.servicioForm     = {};
        this.recargarDetalle();
        this.cargar();
      }
    });
  }

  eliminarServicio(osId: number) {
    if (!confirm('¿Eliminar este servicio de la orden?')) return;
    this.ordenesService.eliminarServicio(this.ordenDetalle.id, osId).subscribe({
      next: () => { this.recargarDetalle(); this.cargar(); }
    });
  }

  // ── Repuestos ──
  cargarRepuestos() {
    this.http.get<any[]>(this.urlRepuestos).subscribe({
      next: (data) => { this.repuestosDisponibles = data; }
    });
  }

  buscarRepuesto() {
    const q = this.busquedaRepuesto.toLowerCase();
    this.repuestosFiltrados    = this.repuestosDisponibles
      .filter(r => r.nombre.toLowerCase().includes(q) || r.codigo?.toLowerCase().includes(q))
      .slice(0, 6);
    this.mostrarSugerenciasRepuesto = this.repuestosFiltrados.length > 0;
  }

  seleccionarRepuesto(r: any) {
    this.repuestoForm           = { repuesto_id: r.id, cantidad: 1, precio_unitario: r.precio_venta };
    this.busquedaRepuesto       = r.nombre;
    this.mostrarSugerenciasRepuesto = false;
  }

  agregarRepuesto() {
    if (!this.repuestoForm.repuesto_id) { alert('Selecciona un repuesto'); return; }
    this.ordenesService.agregarRepuesto(this.ordenDetalle.id, this.repuestoForm).subscribe({
      next: () => {
        this.busquedaRepuesto = '';
        this.repuestoForm     = {};
        this.recargarDetalle();
        this.cargar();
      }
    });
  }

  eliminarRepuesto(orId: number) {
    if (!confirm('¿Eliminar este repuesto de la orden?')) return;
    this.ordenesService.eliminarRepuesto(this.ordenDetalle.id, orId).subscribe({
      next: () => { this.recargarDetalle(); this.cargar(); }
    });
  }

  getBadge(estado: string) {
    return this.estadoConfig[estado] || { label: estado, clase: 'badge bg-secondary' };
  }

  get contadorEstados() {
    const c: any = { todos: this.ordenes.length };
    this.estados.forEach(e => c[e] = this.ordenes.filter(o => o.estado === e).length);
    return c;
  }
}
