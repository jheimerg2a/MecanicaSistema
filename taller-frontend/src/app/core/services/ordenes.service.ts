import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class OrdenesService {
  private url = 'http://localhost:3000/api/ordenes';
  constructor(private http: HttpClient) {}

  getAll()            { return this.http.get<any[]>(this.url); }
  getById(id: number) { return this.http.get<any>(`${this.url}/${id}`); }
  create(data: any)   { return this.http.post<any>(this.url, data); }
  updateEstado(id: number, estado: string, comentario: string) {
    return this.http.patch(`${this.url}/${id}/estado`, { estado, comentario });
  }
}
