import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RolService } from '../../core/services/rol.service';


@Component({
  selector: 'app-repuestos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repuestos.html',
  styleUrl: './repuestos.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepuestosComponent implements OnInit {
  repuestos: any[] = [];
  filtrados: any[] = [];
  busqueda   = '';
  cargando   = false;
  vista: 'tabla' | 'cuadricula' = 'tabla';

  // Modal crear/editar
  mostrarModal = false;
  guardando    = false;
  repuestoForm: any = {};
  modoEdicion  = false;
  imagenPreview: string | null = null;
  archivoImagen: File | null   = null;

  // Importar Excel
  importando       = false;
  resultadoImport: any = null;

  // Ver más columnas
  verMas = false;

  // Eliminación
  mostrarModalEliminar = false;
  modoEliminar: 'individual' | 'grupal' | 'categoria' = 'individual';
  repuestoAEliminar: any = null;
  seleccionados: Set<number> = new Set();
  categoriaEliminar = '';
  previewEliminar: any = null;
  eliminando = false;

  categorias: string[] = [];
  private url = 'http://localhost:3000/api/repuestos';
  urlBase     = 'http://localhost:3000';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef,public rol: RolService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.http.get<any[]>(this.url).subscribe({
      next: (data) => {
        this.repuestos = data;
        this.filtrados = data;
        this.cargando  = false;
        this.categorias = [...new Set(data.map(r => r.categoria).filter(Boolean))];
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  filtrar() {
    const q = this.busqueda.toLowerCase();
    this.filtrados = this.repuestos.filter(r =>
      r.nombre?.toLowerCase().includes(q) ||
      r.codigo?.toLowerCase().includes(q) ||
      r.categoria?.toLowerCase().includes(q) ||
      r.marca?.toLowerCase().includes(q) ||
      r.codigo_barra?.includes(q)
    );
    this.seleccionados.clear();
  }

  // ── Imagen ──
  onImagenSeleccionada(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('La imagen no puede superar 3MB'); return; }
    this.archivoImagen = file;
    const reader = new FileReader();
    reader.onload = (e: any) => { this.imagenPreview = e.target.result; this.cdr.detectChanges(); };
    reader.readAsDataURL(file);
  }

  quitarImagen() {
    this.archivoImagen = null;
    this.imagenPreview = null;
    this.repuestoForm.imagen = null;
  }
  abrirSelectorImagen() {
  const input = document.getElementById('inputImagen') as HTMLInputElement;
  if (input) input.click();
}

  getImagenUrl(imagen: string | null) {
    if (!imagen) return null;
    return `${this.urlBase}${imagen}`;
  }

  // ── CRUD ──
  nuevo() {
    this.repuestoForm  = { stock: 0, stock_minimo: 5, moneda: 'PEN' };
    this.modoEdicion   = false;
    this.imagenPreview = null;
    this.archivoImagen = null;
    this.mostrarModal  = true;
  }

  editar(r: any) {
    this.repuestoForm  = { ...r };
    this.modoEdicion   = true;
    this.imagenPreview = r.imagen ? this.getImagenUrl(r.imagen) : null;
    this.archivoImagen = null;
    this.mostrarModal  = true;
  }

  guardar() {
    if (!this.repuestoForm.nombre) { alert('El nombre es obligatorio'); return; }
    this.guardando = true;

    const formData = new FormData();
    Object.keys(this.repuestoForm).forEach(key => {
      if (this.repuestoForm[key] !== null && this.repuestoForm[key] !== undefined) {
        formData.append(key, this.repuestoForm[key]);
      }
    });
    if (this.archivoImagen) formData.append('imagen', this.archivoImagen);
    if (this.repuestoForm.imagen) formData.append('imagen_actual', this.repuestoForm.imagen);

    const op = this.modoEdicion
      ? this.http.put(`${this.url}/${this.repuestoForm.id}`, formData)
      : this.http.post(this.url, formData);

    op.subscribe({
      next: () => {
        this.guardando    = false;
        this.mostrarModal = false;
        this.cdr.detectChanges();
        this.cargar();
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.mensaje || 'Error al guardar');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Selección para eliminación grupal ──
  toggleSeleccion(id: number) {
    if (this.seleccionados.has(id)) this.seleccionados.delete(id);
    else this.seleccionados.add(id);
    this.cdr.detectChanges();
  }

  toggleTodos() {
    if (this.seleccionados.size === this.filtrados.length) {
      this.seleccionados.clear();
    } else {
      this.filtrados.forEach(r => this.seleccionados.add(r.id));
    }
    this.cdr.detectChanges();
  }

  get todosSeleccionados() { return this.seleccionados.size === this.filtrados.length && this.filtrados.length > 0; }

  // ── Eliminación ──
  abrirEliminarIndividual(r: any) {
    this.modoEliminar      = 'individual';
    this.repuestoAEliminar = r;
    this.previewEliminar   = { total: 1, productos: [r] };
    this.mostrarModalEliminar = true;
  }

  abrirEliminarGrupal() {
    if (this.seleccionados.size === 0) { alert('Selecciona al menos un producto'); return; }
    this.modoEliminar = 'grupal';
    const ids = Array.from(this.seleccionados);
    this.http.post<any>(`${this.url}/preview-eliminar`, { ids }).subscribe({
      next: (data) => {
        this.previewEliminar      = data;
        this.mostrarModalEliminar = true;
        this.cdr.detectChanges();
      }
    });
  }

  abrirEliminarCategoria() {
    if (!this.categoriaEliminar) { alert('Selecciona una categoría'); return; }
    this.modoEliminar = 'categoria';
    this.http.post<any>(`${this.url}/preview-eliminar`, { categoria: this.categoriaEliminar }).subscribe({
      next: (data) => {
        this.previewEliminar      = data;
        this.mostrarModalEliminar = true;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarEliminar() {
    this.eliminando = true;
    let op;

    if (this.modoEliminar === 'individual') {
      op = this.http.delete(`${this.url}/${this.repuestoAEliminar.id}`);
    } else if (this.modoEliminar === 'grupal') {
      op = this.http.post(`${this.url}/eliminar-grupal`, { ids: Array.from(this.seleccionados) });
    } else {
      op = this.http.post(`${this.url}/eliminar-grupal`, { categoria: this.categoriaEliminar });
    }

    op.subscribe({
      next: () => {
        this.eliminando           = false;
        this.mostrarModalEliminar = false;
        this.seleccionados.clear();
        this.categoriaEliminar    = '';
        this.previewEliminar      = null;
        this.cargar();
      },
      error: (err) => {
        this.eliminando = false;
        alert(err.error?.mensaje || 'Error al eliminar');
        this.cdr.detectChanges();
      }
    });
  }

  // ── Importar Excel ──
  onArchivoSeleccionado(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    if (!archivo.name.endsWith('.xlsx') && !archivo.name.endsWith('.xls')) {
      alert('Solo se permiten archivos Excel (.xlsx o .xls)'); return;
    }
    this.importando      = true;
    this.resultadoImport = null;
    const formData = new FormData();
    formData.append('archivo', archivo);
    this.http.post<any>(`${this.url}/importar`, formData).subscribe({
      next: (res) => {
        this.importando      = false;
        this.resultadoImport = res;
        this.cdr.detectChanges();
        this.cargar();
      },
      error: (err) => {
        this.importando = false;
        alert(err.error?.mensaje || 'Error al importar');
        this.cdr.detectChanges();
      }
    });
  }

  abrirSelectorArchivo() { document.getElementById('inputExcel')?.click(); }

  stockBajo(r: any) { return r.stock <= r.stock_minimo; }
}
