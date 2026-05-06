import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiciosService } from '../../core/services/servicios.service';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css'
})
export class ServiciosComponent implements OnInit {
  servicios: any[] = [];
  filtrados: any[] = [];
  busqueda   = '';
  cargando   = false;
  mostrarModal = false;
  guardando    = false;
  servicioForm: any = {};
  modoEdicion  = false;
  filtroActivo = 'todos';

  categorias = [
    'Mantenimiento', 'Frenos', 'Motor', 'Transmisión',
    'Suspensión', 'Eléctrico', 'Diagnóstico', 'Carrocería', 'Otro'
  ];

  constructor(
    private serviciosService: ServiciosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.serviciosService.getAll().subscribe({
      next: (data) => {
        this.servicios = data;
        this.aplicarFiltros();
        this.cargando  = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  aplicarFiltros() {
    let resultado = this.servicios;
    if (this.filtroActivo === 'activos')   resultado = resultado.filter(s => s.activo);
    if (this.filtroActivo === 'inactivos') resultado = resultado.filter(s => !s.activo);
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      resultado = resultado.filter(s =>
        s.nombre?.toLowerCase().includes(q) ||
        s.categoria?.toLowerCase().includes(q) ||
        s.descripcion?.toLowerCase().includes(q)
      );
    }
    this.filtrados = resultado;
  }

  nuevo() {
    this.servicioForm = { precio_base: 0, activo: 1 };
    this.modoEdicion  = false;
    this.mostrarModal = true;
  }

  editar(s: any) {
    this.servicioForm = { ...s };
    this.modoEdicion  = true;
    this.mostrarModal = true;
  }

  guardar() {
    if (!this.servicioForm.nombre) {
      alert('El nombre es obligatorio');
      return;
    }
    this.guardando = true;
    const op = this.modoEdicion
      ? this.serviciosService.update(this.servicioForm.id, this.servicioForm)
      : this.serviciosService.create(this.servicioForm);

    op.subscribe({
      next: () => {
        this.guardando    = false;
        this.mostrarModal = false;
        this.cargar();
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.mensaje || 'Error al guardar');
        this.cdr.detectChanges();
      }
    });
  }

  toggleActivo(s: any) {
    this.serviciosService.toggleActivo(s.id).subscribe({
      next: () => this.cargar()
    });
  }

  get categoriasUnicas() {
    return [...new Set(this.servicios.map(s => s.categoria).filter(Boolean))];
  }

  get totalActivos()   { return this.servicios.filter(s => s.activo).length; }
  get totalInactivos() { return this.servicios.filter(s => !s.activo).length; }
  get precioPromedio() {
    const activos = this.servicios.filter(s => s.activo);
    if (!activos.length) return 0;
    return activos.reduce((a, s) => a + parseFloat(s.precio_base), 0) / activos.length;
  }
}
