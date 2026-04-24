import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private url = 'http://localhost:3000/api/usuarios';
  constructor(private http: HttpClient) {}

  getAll()                      { return this.http.get<any[]>(this.url); }
  create(data: any)             { return this.http.post(this.url, data); }
  update(id: number, data: any) { return this.http.put(`${this.url}/${id}`, data); }
  toggleActivo(id: number)      { return this.http.patch(`${this.url}/${id}/toggle`, {}); }
}
