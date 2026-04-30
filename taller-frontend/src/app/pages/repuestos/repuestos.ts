import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-repuestos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repuestos.html',
  styleUrl: './repuestos.css'
})
export class RepuestosComponent implements OnInit {
  repuestos: any[] = [];
  filtrados: any[] = [];
  busqueda   = '';
  cargando   = false;
  mostrarModal = false;
  guardando    = false;
  repuestoForm: any = {};
  modoEdicion  = false;
  private url  = 'http://localhost:3000/api/repuestos';

  // Importación
  importando       = false;
  resultadoImport: any = null;

  // Columnas visibles
  verMas = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.http.get<any[]>(this.url).subscribe({
      next: (data) => {
        this.repuestos = data;
        this.filtrados = data;
        this.cargando  = false;
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
      r.codigo_barra?.includes(q) ||
      r.codigo_original?.toLowerCase().includes(q)
    );
  }

  nuevo() {
    this.repuestoForm = { stock: 0, stock_minimo: 5, moneda: 'PEN' };
    this.modoEdicion  = false;
    this.mostrarModal = true;
  }

  editar(r: any) {
    this.repuestoForm = { ...r };
    this.modoEdicion  = true;
    this.mostrarModal = true;
  }

  guardar() {
    this.guardando = true;
    const op = this.modoEdicion
      ? this.http.put(`${this.url}/${this.repuestoForm.id}`, this.repuestoForm)
      : this.http.post(this.url, this.repuestoForm);
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

  stockBajo(r: any) { return r.stock <= r.stock_minimo; }

  onArchivoSeleccionado(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    if (!archivo.name.endsWith('.xlsx') && !archivo.name.endsWith('.xls')) {
      alert('Solo se permiten archivos Excel (.xlsx o .xls)');
      return;
    }
    this.importarExcel(archivo);
  }

  importarExcel(archivo: File) {
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

  abrirSelectorArchivo() {
    document.getElementById('inputExcel')?.click();
  }
}
