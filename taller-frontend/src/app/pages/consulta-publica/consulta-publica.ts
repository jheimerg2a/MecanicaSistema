import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SeguimientoService } from '../../core/services/seguimiento.service';

@Component({
  selector: 'app-consulta-publica',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './consulta-publica.html',
  styleUrl: './consulta-publica.css'
})
export class ConsultaPublicaComponent {
  busqueda  = '';
  tipoBusqueda: 'nombre' | 'dni' = 'nombre';
  resultados: any[] = [];
  buscando  = false;
  buscado   = false;
  error     = '';

  estadoConfig: any = {
    recibido:         { label: 'Recibido',          clase: 'bg-secondary', icono: 'bi-inbox' },
    diagnostico:      { label: 'En diagnóstico',    clase: 'bg-info',      icono: 'bi-search' },
    en_reparacion:    { label: 'En reparación',     clase: 'bg-primary',   icono: 'bi-tools' },
    espera_repuestos: { label: 'Espera repuestos',  clase: 'bg-warning text-dark', icono: 'bi-hourglass-split' },
    listo:            { label: '¡Listo para retirar!', clase: 'bg-success', icono: 'bi-check-circle' },
    entregado:        { label: 'Entregado',         clase: 'bg-dark',      icono: 'bi-check2-all' },
    cancelado:        { label: 'Cancelado',         clase: 'bg-danger',    icono: 'bi-x-circle' },
  };

  constructor(private seguimiento: SeguimientoService) {}

  consultar() {
    if (!this.busqueda.trim()) return;
    this.buscando = true;
    this.buscado  = false;
    this.error    = '';
    this.resultados = [];

    const obs = this.tipoBusqueda === 'dni'
      ? this.seguimiento.consultarPorDni(this.busqueda.trim())
      : this.seguimiento.consultarPorNombre(this.busqueda.trim());

    obs.subscribe({
      next: (data) => {
        this.resultados = data;
        this.buscando   = false;
        this.buscado    = true;
      },
      error: () => {
        this.error    = 'No se encontraron órdenes para esa búsqueda.';
        this.buscando = false;
        this.buscado  = true;
      }
    });
  }

  getEstado(estado: string) {
    return this.estadoConfig[estado] || { label: estado, clase: 'bg-secondary', icono: 'bi-circle' };
  }
}
