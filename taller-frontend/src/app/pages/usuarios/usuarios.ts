import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../core/services/usuarios.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class UsuariosComponent implements OnInit {
  usuarios:  any[] = [];
  filtrados: any[] = [];
  busqueda   = '';
  cargando   = false;
  mostrarModal = false;
  guardando    = false;
  usuarioForm: any = {};
  modoEdicion  = false;
  usuarioActual: any;
  mostrarPassword = false;

  constructor(
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.getUsuario();
    this.cargar();
  }

  cargar() {
    this.cargando = true;
    this.usuariosService.getAll().subscribe({
      next: (data) => {
        this.usuarios  = data;
        this.filtrados = data;
        this.cargando  = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  filtrar() {
    const q = this.busqueda.toLowerCase();
    this.filtrados = this.usuarios.filter(u =>
      u.nombre?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.rol?.toLowerCase().includes(q)
    );
  }

  nuevo() {
    this.usuarioForm    = { rol: 'mecanico' };
    this.modoEdicion    = false;
    this.mostrarModal   = true;
    this.mostrarPassword = true;
  }

  editar(u: any) {
    this.usuarioForm     = { ...u, password: '' };
    this.modoEdicion     = true;
    this.mostrarModal    = true;
    this.mostrarPassword = false;
  }

  guardar() {
    if (!this.usuarioForm.nombre || !this.usuarioForm.email || !this.usuarioForm.rol) {
      alert('Nombre, email y rol son obligatorios');
      return;
    }
    if (!this.modoEdicion && !this.usuarioForm.password) {
      alert('La contraseña es obligatoria para nuevos usuarios');
      return;
    }
    this.guardando = true;
    const op = this.modoEdicion
      ? this.usuariosService.update(this.usuarioForm.id, this.usuarioForm)
      : this.usuariosService.create(this.usuarioForm);

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

  toggleActivo(u: any) {
    if (u.id === this.usuarioActual?.id) {
      alert('No puedes desactivar tu propia cuenta');
      return;
    }
    this.usuariosService.toggleActivo(u.id).subscribe({
      next: () => this.cargar(),
      error: () => alert('Error al cambiar estado')
    });
  }

  esMiCuenta(u: any) {
    return u.id === this.usuarioActual?.id;
  }
}
