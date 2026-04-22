import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiculosService } from '../../core/services/vehiculos.service';
import { ClientesService } from '../../core/services/clientes.service';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehiculos.html',
  styleUrl: './vehiculos.css'
})
export class VehiculosComponent implements OnInit {
  vehiculos: any[] = [];
  filtrados: any[] = [];
  clientes:  any[] = [];
  busqueda   = '';
  cargando   = false;
  mostrarModal = false;
  guardando    = false;
  vehiculoForm: any = {};
  modoEdicion  = false;

  marcas = ['Toyota','Hyundai','Kia','Nissan','Honda','Chevrolet','Ford',
            'Volkswagen','Mazda','Suzuki','Mitsubishi','Subaru','Otro'];
  tipos  = ['Sedán','SUV','Pickup','Hatchback','Van','Camioneta','Coupé','Otro'];

  constructor(
    private vehiculosService: VehiculosService,
    private clientesService: ClientesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargar();
    this.cargarClientes();
  }

  cargar() {
    this.cargando = true;
    this.vehiculosService.getAll().subscribe({
      next: (data) => {
        this.vehiculos = data;
        this.filtrados = data;
        this.cargando  = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  cargarClientes() {
    this.clientesService.getAll().subscribe({
      next: (data) => { this.clientes = data; this.cdr.detectChanges(); }
    });
  }

  filtrar() {
    const q = this.busqueda.toLowerCase();
    this.filtrados = this.vehiculos.filter(v =>
      v.placa?.toLowerCase().includes(q) ||
      v.marca?.toLowerCase().includes(q) ||
      v.modelo?.toLowerCase().includes(q) ||
      v.cliente?.toLowerCase().includes(q)
    );
  }

  nuevo() {
    this.vehiculoForm = { km_ingreso: 0 };
    this.modoEdicion  = false;
    this.mostrarModal = true;
  }

  editar(v: any) {
    this.vehiculoForm = { ...v };
    this.modoEdicion  = true;
    this.mostrarModal = true;
  }

  guardar() {
    if (!this.vehiculoForm.cliente_id || !this.vehiculoForm.placa ||
        !this.vehiculoForm.marca      || !this.vehiculoForm.modelo) {
      alert('Cliente, placa, marca y modelo son obligatorios');
      return;
    }
    this.guardando = true;
    const op = this.modoEdicion
      ? this.vehiculosService.update(this.vehiculoForm.id, this.vehiculoForm)
      : this.vehiculosService.create(this.vehiculoForm);

    op.subscribe({
      next: () => {
        this.guardando    = false;
        this.mostrarModal = false;
        this.cdr.detectChanges();
        this.cargar();
      },
      error: (err) => {
        this.guardando = false;
        this.cdr.detectChanges();
        alert(err.error?.mensaje || 'Error al guardar');
      }
    });
  }

  getNombreCliente(id: number) {
    const c = this.clientes.find(c => c.id === id);
    return c ? `${c.nombre} ${c.apellido}` : '—';
  }
}
