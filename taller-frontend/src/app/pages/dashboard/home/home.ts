import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdenesService } from '../../../core/services/ordenes.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  stats: any       = null;
  cargando         = true;

  estadoConfig: any = {
    recibido:         { label: 'Recibido',           clase: 'badge bg-secondary' },
    diagnostico:      { label: 'En diagnóstico',     clase: 'badge bg-info text-dark' },
    en_reparacion:    { label: 'En reparación',      clase: 'badge bg-primary' },
    espera_repuestos: { label: 'Espera repuestos',   clase: 'badge bg-warning text-dark' },
    listo:            { label: 'Listo para retirar', clase: 'badge bg-success' },
    entregado:        { label: 'Entregado',          clase: 'badge bg-dark' },
    cancelado:        { label: 'Cancelado',          clase: 'badge bg-danger' },
  };

  constructor(
    private ordenesService: OrdenesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.ordenesService.getEstadisticas().subscribe({
      next: (data) => {
        this.stats    = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  getBadge(estado: string) {
    return this.estadoConfig[estado] || { label: estado, clase: 'badge bg-secondary' };
  }
}
