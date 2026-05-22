import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../core/services/clientes.service';
import { RolService } from '../../core/services/rol.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class ClientesComponent implements OnInit {
  clientes: any[] = [];
  filtrados: any[] = [];
  busqueda = '';
  cargando = false;
  mostrarModal = false;
  guardando = false;
  clienteForm: any = {};
  modoEdicion = false;

  constructor(
    private clientesService: ClientesService,
    private cdr: ChangeDetectorRef,
    public rol: RolService
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.clientesService.getAll().subscribe({
      next: (data) => {
        this.clientes  = data;
        this.filtrados = data;
        this.cargando  = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  filtrar() {
    const q = this.busqueda.toLowerCase();
    this.filtrados = this.clientes.filter(c =>
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(q) ||
      c.dni?.includes(q) || c.telefono?.includes(q)
    );
  }

  nuevo() {
    this.clienteForm  = {};
    this.modoEdicion  = false;
    this.mostrarModal = true;
  }

  editar(c: any) {
    if (!this.rol.puedeEditarCliente()) return;
    this.clienteForm  = { ...c };
    this.modoEdicion  = true;
    this.mostrarModal = true;
  }

  guardar() {
    this.guardando = true;
    const op = this.modoEdicion
      ? this.clientesService.update(this.clienteForm.id, this.clienteForm)
      : this.clientesService.create(this.clienteForm);
    op.subscribe({
      next: () => {
        this.guardando    = false;
        this.mostrarModal = false;
        this.cdr.detectChanges();
        this.cargar();
      },
      error: () => { this.guardando = false; this.cdr.detectChanges(); }
    });
  }
}
