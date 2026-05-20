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
  busqueda     = '';
  filtroEstado = 'todos';
  cargando     = false;

  // Modales
  mostrarModalNueva   = false;
  mostrarModalVer     = false;
  mostrarModalEditar  = false;
  guardando           = false;

  // Nueva orden
  ordenForm: any = {};
  busquedaVehiculo  = '';  vehiculosFiltrados: any[] = [];
  vehiculoSeleccionado: any = null; mostrarVehiculos = false;
  busquedaMecanico  = '';  mecanicosFiltrados: any[] = [];
  mecanicoSeleccionado: any = null; mostrarMecanicos = false;

  // Servicios y repuestos en nueva orden
  serviciosNuevaOrden: any[] = [];
  repuestosNuevaOrden: any[] = [];
  busquedaServicioNueva = ''; serviciosFiltradosNueva: any[] = [];
  mostrarSugServicioNueva = false; servicioFormNueva: any = {};
  busquedaRepuestoNueva = ''; repuestosFiltradosNueva: any[] = [];
  mostrarSugRepuestoNueva = false; repuestoFormNueva: any = {};

  // Detalle / Editar
  ordenActual: any = null;
  ordenEditForm: any = {};
  busquedaMecanicoEdit = ''; mecanicosFiltradosEdit: any[] = [];
  mostrarMecanicosEdit = false;
  estadoForm = { estado: '', comentario: '' };

  // Servicios/repuestos en editar
  busquedaServicio = ''; serviciosFiltrados: any[] = [];
  mostrarSugServicio = false; servicioForm: any = {};
  busquedaRepuesto = ''; repuestosFiltrados: any[] = [];
  mostrarSugRepuesto = false; repuestoForm: any = {};

  // Catálogos
  serviciosDisponibles: any[] = [];
  repuestosDisponibles: any[] = [];

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

  private urlVehiculos = 'http://localhost:3000/api/vehiculos';
  private urlUsuarios  = 'http://localhost:3000/api/usuarios';
  private urlServicios = 'http://localhost:3000/api/servicios';
  private urlRepuestos = 'http://localhost:3000/api/repuestos';

  constructor(
    private ordenesService: OrdenesService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargar();
    this.cargarCatalogos();
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
    let r = this.ordenes;
    if (this.filtroEstado !== 'todos') r = r.filter(o => o.estado === this.filtroEstado);
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      r = r.filter(o =>
        o.codigo?.toLowerCase().includes(q) ||
        o.cliente?.toLowerCase().includes(q) ||
        o.placa?.toLowerCase().includes(q) ||
        o.mecanico?.toLowerCase().includes(q)
      );
    }
    this.filtradas = r;
  }

  cargarCatalogos() {
    this.http.get<any[]>(this.urlServicios).subscribe({ next: d => this.serviciosDisponibles = d.filter(s => s.activo) });
    this.http.get<any[]>(this.urlRepuestos).subscribe({ next: d => this.repuestosDisponibles = d });
  }

  // ── Búsquedas autocomplete ──
  buscarVehiculo() {
    const q = this.busquedaVehiculo.trim().toLowerCase();
    if (q.length < 2) { this.vehiculosFiltrados = []; this.mostrarVehiculos = false; return; }
    this.http.get<any[]>(this.urlVehiculos).subscribe({ next: data => {
      this.vehiculosFiltrados = data.filter(v =>
        v.cliente?.toLowerCase().includes(q) || v.placa?.toLowerCase().includes(q)
      ).slice(0, 6);
      this.mostrarVehiculos = this.vehiculosFiltrados.length > 0;
      this.cdr.detectChanges();
    }});
  }

  seleccionarVehiculo(v: any) {
    this.vehiculoSeleccionado  = v;
    this.ordenForm.vehiculo_id = v.id;
    this.busquedaVehiculo      = `${v.cliente} — ${v.marca} ${v.modelo} (${v.placa})`;
    this.mostrarVehiculos      = false;
  }

  buscarMecanico(esEditar = false) {
    const q = (esEditar ? this.busquedaMecanicoEdit : this.busquedaMecanico).trim().toLowerCase();
    if (q.length < 2) {
      if (esEditar) { this.mecanicosFiltradosEdit = []; this.mostrarMecanicosEdit = false; }
      else { this.mecanicosFiltrados = []; this.mostrarMecanicos = false; }
      return;
    }
    this.http.get<any[]>(this.urlUsuarios).subscribe({ next: data => {
      const res = data.filter(u => u.activo && u.nombre?.toLowerCase().includes(q)).slice(0, 5);
      if (esEditar) { this.mecanicosFiltradosEdit = res; this.mostrarMecanicosEdit = res.length > 0; }
      else { this.mecanicosFiltrados = res; this.mostrarMecanicos = res.length > 0; }
      this.cdr.detectChanges();
    }});
  }

  seleccionarMecanico(m: any, esEditar = false) {
    if (esEditar) {
      this.ordenEditForm.mecanico_id = m.id;
      this.busquedaMecanicoEdit      = m.nombre;
      this.mostrarMecanicosEdit      = false;
    } else {
      this.mecanicoSeleccionado  = m;
      this.ordenForm.mecanico_id = m.id;
      this.busquedaMecanico      = m.nombre;
      this.mostrarMecanicos      = false;
    }
  }

  // ── Servicios autocomplete (nueva orden) ──
  buscarServicioNueva() {
    const q = this.busquedaServicioNueva.toLowerCase();
    this.serviciosFiltradosNueva   = this.serviciosDisponibles.filter(s => s.nombre.toLowerCase().includes(q)).slice(0, 6);
    this.mostrarSugServicioNueva   = this.serviciosFiltradosNueva.length > 0 && q.length > 0;
  }

  seleccionarServicioNueva(s: any) {
    this.servicioFormNueva         = { servicio_id: s.id, nombre: s.nombre, precio: s.precio_base, observacion: '' };
    this.busquedaServicioNueva     = s.nombre;
    this.mostrarSugServicioNueva   = false;
  }

  agregarServicioNueva() {
    if (!this.servicioFormNueva.servicio_id) { alert('Selecciona un servicio'); return; }
    this.serviciosNuevaOrden.push({ ...this.servicioFormNueva });
    this.busquedaServicioNueva   = '';
    this.servicioFormNueva       = {};
    this.mostrarSugServicioNueva = false;
  }

  quitarServicioNueva(i: number) { this.serviciosNuevaOrden.splice(i, 1); }

  // ── Repuestos autocomplete (nueva orden) ──
  buscarRepuestoNueva() {
    const q = this.busquedaRepuestoNueva.toLowerCase();
    this.repuestosFiltradosNueva   = this.repuestosDisponibles.filter(r =>
      r.nombre.toLowerCase().includes(q) || r.codigo?.toLowerCase().includes(q)
    ).slice(0, 6);
    this.mostrarSugRepuestoNueva   = this.repuestosFiltradosNueva.length > 0 && q.length > 0;
  }

  seleccionarRepuestoNueva(r: any) {
    this.repuestoFormNueva         = { repuesto_id: r.id, nombre: r.nombre, cantidad: 1, precio_unitario: r.precio_venta };
    this.busquedaRepuestoNueva     = r.nombre;
    this.mostrarSugRepuestoNueva   = false;
  }

  agregarRepuestoNueva() {
    if (!this.repuestoFormNueva.repuesto_id) { alert('Selecciona un repuesto'); return; }
    this.repuestosNuevaOrden.push({ ...this.repuestoFormNueva });
    this.busquedaRepuestoNueva   = '';
    this.repuestoFormNueva       = {};
    this.mostrarSugRepuestoNueva = false;
  }

  quitarRepuestoNueva(i: number) { this.repuestosNuevaOrden.splice(i, 1); }

  // ── Servicios autocomplete (editar) ──
  buscarServicio() {
    const q = this.busquedaServicio.toLowerCase();
    this.serviciosFiltrados  = this.serviciosDisponibles.filter(s => s.nombre.toLowerCase().includes(q)).slice(0, 6);
    this.mostrarSugServicio  = this.serviciosFiltrados.length > 0 && q.length > 0;
  }

  seleccionarServicio(s: any) {
    this.servicioForm        = { servicio_id: s.id, precio: s.precio_base, observacion: '' };
    this.busquedaServicio    = s.nombre;
    this.mostrarSugServicio  = false;
  }

  agregarServicio() {
    if (!this.servicioForm.servicio_id) { alert('Selecciona un servicio'); return; }
    this.ordenesService.agregarServicio(this.ordenActual.id, this.servicioForm).subscribe({
      next: () => { this.busquedaServicio = ''; this.servicioForm = {}; this.recargarActual(); this.cargar(); }
    });
  }

  eliminarServicio(osId: number) {
    if (!confirm('¿Eliminar este servicio?')) return;
    this.ordenesService.eliminarServicio(this.ordenActual.id, osId).subscribe({
      next: () => { this.recargarActual(); this.cargar(); }
    });
  }

  // ── Repuestos autocomplete (editar) ──
  buscarRepuesto() {
    const q = this.busquedaRepuesto.toLowerCase();
    this.repuestosFiltrados  = this.repuestosDisponibles.filter(r =>
      r.nombre.toLowerCase().includes(q) || r.codigo?.toLowerCase().includes(q)
    ).slice(0, 6);
    this.mostrarSugRepuesto  = this.repuestosFiltrados.length > 0 && q.length > 0;
  }

  seleccionarRepuesto(r: any) {
    this.repuestoForm        = { repuesto_id: r.id, cantidad: 1, precio_unitario: r.precio_venta };
    this.busquedaRepuesto    = r.nombre;
    this.mostrarSugRepuesto  = false;
  }

  agregarRepuesto() {
    if (!this.repuestoForm.repuesto_id) { alert('Selecciona un repuesto'); return; }
    this.ordenesService.agregarRepuesto(this.ordenActual.id, this.repuestoForm).subscribe({
      next: () => { this.busquedaRepuesto = ''; this.repuestoForm = {}; this.recargarActual(); this.cargar(); }
    });
  }

  eliminarRepuesto(orId: number) {
    if (!confirm('¿Eliminar este repuesto?')) return;
    this.ordenesService.eliminarRepuesto(this.ordenActual.id, orId).subscribe({
      next: () => { this.recargarActual(); this.cargar(); }
    });
  }

  // ── Nueva orden ──
  nueva() {
    this.ordenForm              = {};
    this.busquedaVehiculo       = '';
    this.busquedaMecanico       = '';
    this.vehiculoSeleccionado   = null;
    this.mecanicoSeleccionado   = null;
    this.serviciosNuevaOrden    = [];
    this.repuestosNuevaOrden    = [];
    this.busquedaServicioNueva  = '';
    this.busquedaRepuestoNueva  = '';
    this.mostrarModalNueva      = true;
  }

  async guardarOrden() {
    if (!this.ordenForm.vehiculo_id || !this.ordenForm.descripcion_problema) {
      alert('Selecciona un vehículo y describe el problema');
      return;
    }
    this.guardando = true;
    this.ordenesService.create(this.ordenForm).subscribe({
      next: async (res) => {
        const ordenId = res.id;
        // Agregar servicios
        for (const s of this.serviciosNuevaOrden) {
          await this.ordenesService.agregarServicio(ordenId, s).toPromise();
        }
        // Agregar repuestos
        for (const r of this.repuestosNuevaOrden) {
          await this.ordenesService.agregarRepuesto(ordenId, r).toPromise();
        }
        this.guardando         = false;
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

  // ── Ver detalle (solo lectura) ──
  verOrden(orden: any) {
    this.ordenesService.getById(orden.id).subscribe({
      next: (data) => {
        this.ordenActual    = data;
        this.mostrarModalVer = true;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Editar orden ──
  editarOrden(orden: any) {
    this.ordenesService.getById(orden.id).subscribe({
      next: (data) => {
        this.ordenActual      = data;
        this.ordenEditForm    = {
          mecanico_id:           data.mecanico_id,
          descripcion_problema:  data.descripcion_problema,
          fecha_estimada:        data.fecha_estimada ? data.fecha_estimada.substring(0, 10) : '',
          km_actual:             data.km_actual,
          mano_obra:             data.mano_obra,
          observaciones:         data.observaciones
        };
        this.busquedaMecanicoEdit  = data.mecanico || '';
        this.estadoForm            = { estado: data.estado, comentario: '' };
        this.busquedaServicio      = '';
        this.busquedaRepuesto      = '';
        this.servicioForm          = {};
        this.repuestoForm          = {};
        this.mostrarSugServicio    = false;
        this.mostrarSugRepuesto    = false;
        this.mostrarModalEditar    = true;
        this.cdr.detectChanges();
      }
    });
  }

  recargarActual() {
    if (!this.ordenActual) return;
    this.ordenesService.getById(this.ordenActual.id).subscribe({
      next: (data) => { this.ordenActual = data; this.cdr.detectChanges(); }
    });
  }

  guardarEdicion() {
    this.guardando = true;
    this.ordenesService.update(this.ordenActual.id, this.ordenEditForm).subscribe({
      next: () => {
        // Actualizar estado si cambió
        if (this.estadoForm.estado !== this.ordenActual.estado) {
          this.ordenesService.updateEstado(
            this.ordenActual.id, this.estadoForm.estado, this.estadoForm.comentario
          ).subscribe({ next: () => { this.guardando = false; this.mostrarModalEditar = false; this.cargar(); this.cdr.detectChanges(); } });
        } else {
          this.guardando          = false;
          this.mostrarModalEditar = false;
          this.cargar();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.mensaje || 'Error al actualizar');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Eliminar orden ──
  eliminarOrden(orden: any) {
    if (!confirm(`¿Eliminar permanentemente la orden ${orden.codigo}? Esta acción no se puede deshacer.`)) return;
    this.ordenesService.eliminar(orden.id).subscribe({
      next: () => { this.cargar(); this.cdr.detectChanges(); },
      error: (err) => alert(err.error?.mensaje || 'Error al eliminar')
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

  get totalNuevaOrden() {
    const serv = this.serviciosNuevaOrden.reduce((a, s) => a + parseFloat(s.precio || 0), 0);
    const rep  = this.repuestosNuevaOrden.reduce((a, r) => a + (parseFloat(r.precio_unitario || 0) * (r.cantidad || 1)), 0);
    const mo   = parseFloat(this.ordenForm.mano_obra || 0);
    return serv + rep + mo;
  }
}
