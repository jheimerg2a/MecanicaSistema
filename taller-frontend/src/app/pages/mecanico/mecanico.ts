import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ClientesService } from '../../core/services/clientes.service';
import { VehiculosService } from '../../core/services/vehiculos.service';
import { OrdenesService } from '../../core/services/ordenes.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mecanico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mecanico.html',
  styleUrl: './mecanico.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MecanicoComponent {
  usuario: any;

  // Flujo
  flujo: null | 'nuevo' | 'habitual' = null;
  paso  = 0;

  // Paso 1 — Cliente
  clienteForm: any = {};
  guardandoCliente = false;
  clienteCreado: any = null;

  // Paso 2 — Vehículo
  vehiculoForm: any = { km_ingreso: 0 };
  guardandoVehiculo = false;
  vehiculoCreado: any = null;
  marcas = ['Toyota','Hyundai','Kia','Nissan','Honda','Chevrolet','Ford',
            'Volkswagen','Mazda','Suzuki','Mitsubishi','Subaru','Otro'];
  tipos  = ['Sedán','SUV','Pickup','Hatchback','Van','Camioneta','Coupé','Otro'];

  // Paso 3 — Orden
  ordenForm: any = {};
  guardandoOrden = false;
  busquedaVehiculo  = '';
  vehiculosFiltrados: any[] = [];
  vehiculoSeleccionado: any = null;
  mostrarVehiculos  = false;
  serviciosDisponibles: any[] = [];
  repuestosDisponibles: any[] = [];
  serviciosOrden: any[] = [];
  repuestosOrden: any[] = [];
  busquedaServicio  = ''; serviciosFiltrados: any[] = [];
  mostrarSugServicio = false; servicioForm: any = {};
  busquedaRepuesto  = ''; repuestosFiltrados: any[] = [];
  mostrarSugRepuesto = false; repuestoForm: any = {};

  ordenCreada: any = null;

  private urlVehiculos = 'http://localhost:3000/api/vehiculos';
  private urlServicios = 'http://localhost:3000/api/servicios';
  private urlRepuestos = 'http://localhost:3000/api/repuestos';

  constructor(
    private router: Router,
    private auth: AuthService,
    private clientesService: ClientesService,
    private vehiculosService: VehiculosService,
    private ordenesService: OrdenesService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.usuario = this.auth.getUsuario();
    this.cargarCatalogos();
  }

  cargarCatalogos() {
    this.http.get<any[]>(this.urlServicios).subscribe({ next: d => { this.serviciosDisponibles = d.filter(s => s.activo); this.cdr.detectChanges(); } });
    this.http.get<any[]>(this.urlRepuestos).subscribe({ next: d => { this.repuestosDisponibles = d; this.cdr.detectChanges(); } });
  }

  iniciarFlujoNuevo() {
    this.flujo          = 'nuevo';
    this.paso           = 1;
    this.clienteForm    = {};
    this.vehiculoForm   = { km_ingreso: 0 };
    this.ordenForm      = {};
    this.clienteCreado  = null;
    this.vehiculoCreado = null;
    this.ordenCreada    = null;
    this.serviciosOrden = [];
    this.repuestosOrden = [];
    this.cdr.detectChanges();
  }

  iniciarFlujoHabitual() {
    this.flujo          = 'habitual';
    this.paso           = 3;
    this.ordenForm      = {};
    this.busquedaVehiculo = '';
    this.vehiculoSeleccionado = null;
    this.serviciosOrden = [];
    this.repuestosOrden = [];
    this.cdr.detectChanges();
  }

  resetear() {
    this.flujo  = null;
    this.paso   = 0;
    this.cdr.detectChanges();
  }

  // ── Paso 1: Crear cliente ──
  guardarCliente() {
    if (!this.clienteForm.nombre || !this.clienteForm.apellido) {
      alert('Nombre y apellido son obligatorios'); return;
    }
    this.guardandoCliente = true;
    this.clientesService.create(this.clienteForm).subscribe({
      next: (res: any) => {
        this.clienteCreado        = { ...this.clienteForm, id: res.id };
        this.vehiculoForm.cliente_id = res.id;
        this.guardandoCliente     = false;
        this.paso                 = 2;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardandoCliente = false;
        alert(err.error?.mensaje || 'Error al crear cliente');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Paso 2: Crear vehículo ──
  guardarVehiculo() {
    if (!this.vehiculoForm.placa || !this.vehiculoForm.marca || !this.vehiculoForm.modelo) {
      alert('Placa, marca y modelo son obligatorios'); return;
    }
    this.guardandoVehiculo = true;
    this.vehiculosService.create(this.vehiculoForm).subscribe({
      next: (res: any) => {
        this.vehiculoCreado      = { ...this.vehiculoForm, id: res.id };
        this.ordenForm.vehiculo_id = res.id;
        this.busquedaVehiculo    = `${this.clienteCreado?.nombre} — ${this.vehiculoForm.marca} ${this.vehiculoForm.modelo} (${this.vehiculoForm.placa})`;
        this.vehiculoSeleccionado = this.vehiculoCreado;
        this.guardandoVehiculo   = false;
        this.paso                = 3;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardandoVehiculo = false;
        alert(err.error?.mensaje || 'Error al crear vehículo');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Paso 3: Buscar vehículo (cliente habitual) ──
  buscarVehiculo() {
    const q = this.busquedaVehiculo.trim().toLowerCase();
    if (q.length < 2) { this.vehiculosFiltrados = []; this.mostrarVehiculos = false; return; }
    this.http.get<any[]>(this.urlVehiculos).subscribe({ next: data => {
      this.vehiculosFiltrados = data.filter(v =>
        v.cliente?.toLowerCase().includes(q) || v.placa?.toLowerCase().includes(q)
      ).slice(0, 6);
      setTimeout(() => { this.mostrarVehiculos = this.vehiculosFiltrados.length > 0; this.cdr.detectChanges(); });
    }});
  }

  seleccionarVehiculo(v: any) {
    this.vehiculoSeleccionado  = v;
    this.ordenForm.vehiculo_id = v.id;
    this.busquedaVehiculo      = `${v.cliente} — ${v.marca} ${v.modelo} (${v.placa})`;
    this.mostrarVehiculos      = false;
    this.cdr.detectChanges();
  }

  // ── Servicios en orden ──
  buscarServicio() {
    const q = this.busquedaServicio.toLowerCase();
    this.serviciosFiltrados = this.serviciosDisponibles.filter(s => s.nombre.toLowerCase().includes(q)).slice(0, 6);
    setTimeout(() => { this.mostrarSugServicio = this.serviciosFiltrados.length > 0 && q.length > 0; this.cdr.detectChanges(); });
  }

  seleccionarServicio(s: any) {
    this.servicioForm      = { servicio_id: s.id, nombre: s.nombre, precio: s.precio_base, observacion: '' };
    this.busquedaServicio  = s.nombre;
    this.mostrarSugServicio = false;
  }

  agregarServicio() {
    if (!this.servicioForm.servicio_id) { alert('Selecciona un servicio'); return; }
    this.serviciosOrden.push({ ...this.servicioForm });
    this.busquedaServicio  = '';
    this.servicioForm      = {};
    this.mostrarSugServicio = false;
    this.cdr.detectChanges();
  }

  quitarServicio(i: number) { this.serviciosOrden.splice(i, 1); this.cdr.detectChanges(); }

  // ── Repuestos en orden ──
  buscarRepuesto() {
    const q = this.busquedaRepuesto.toLowerCase();
    this.repuestosFiltrados = this.repuestosDisponibles.filter(r =>
      r.nombre.toLowerCase().includes(q) || r.codigo?.toLowerCase().includes(q)
    ).slice(0, 6);
    setTimeout(() => { this.mostrarSugRepuesto = this.repuestosFiltrados.length > 0 && q.length > 0; this.cdr.detectChanges(); });
  }

  seleccionarRepuesto(r: any) {
    this.repuestoForm      = { repuesto_id: r.id, nombre: r.nombre, cantidad: 1, precio_unitario: r.precio_venta };
    this.busquedaRepuesto  = r.nombre;
    this.mostrarSugRepuesto = false;
  }

  agregarRepuesto() {
    if (!this.repuestoForm.repuesto_id) { alert('Selecciona un repuesto'); return; }
    this.repuestosOrden.push({ ...this.repuestoForm });
    this.busquedaRepuesto  = '';
    this.repuestoForm      = {};
    this.mostrarSugRepuesto = false;
    this.cdr.detectChanges();
  }

  quitarRepuesto(i: number) { this.repuestosOrden.splice(i, 1); this.cdr.detectChanges(); }

  get totalEstimado() {
    const serv = this.serviciosOrden.reduce((a, s) => a + parseFloat(s.precio || 0), 0);
    const rep  = this.repuestosOrden.reduce((a, r) => a + (parseFloat(r.precio_unitario || 0) * (r.cantidad || 1)), 0);
    const mo   = parseFloat(this.ordenForm.mano_obra || 0);
    return serv + rep + mo;
  }

  // ── Paso 3: Crear orden ──
  guardarOrden() {
    if (!this.ordenForm.vehiculo_id || !this.ordenForm.descripcion_problema) {
      alert('Selecciona un vehículo y describe el problema'); return;
    }
    this.guardandoOrden = true;
    this.ordenesService.create(this.ordenForm).subscribe({
      next: (res) => {
        const ordenId   = res.id;
        const servicios = [...this.serviciosOrden];
        const repuestos = [...this.repuestosOrden];

        const agregarServicios = (i: number) => {
          if (i >= servicios.length) { agregarRepuestos(0); return; }
          this.ordenesService.agregarServicio(ordenId, servicios[i]).subscribe({
            next: () => agregarServicios(i + 1),
            error: () => agregarServicios(i + 1)
          });
        };

        const agregarRepuestos = (i: number) => {
          if (i >= repuestos.length) {
            this.ordenCreada    = { ...res, codigo: res.codigo };
            this.guardandoOrden = false;
            this.paso           = 4;
            this.cdr.detectChanges();
            return;
          }
          this.ordenesService.agregarRepuesto(ordenId, repuestos[i]).subscribe({
            next: () => agregarRepuestos(i + 1),
            error: () => agregarRepuestos(i + 1)
          });
        };

        agregarServicios(0);
      },
      error: (err) => {
        this.guardandoOrden = false;
        alert(err.error?.mensaje || 'Error al crear orden');
        this.cdr.detectChanges();
      }
    });
  }

  irAOrdenes() { this.router.navigate(['/dashboard/ordenes']); }
}

