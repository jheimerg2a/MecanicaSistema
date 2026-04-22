import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private url = 'http://localhost:3000/api/clientes';
  constructor(private http: HttpClient) {}

  getAll()           { return this.http.get<any[]>(this.url); }
  getById(id: number){ return this.http.get<any>(`${this.url}/${id}`); }
  create(data: any)  { return this.http.post(this.url, data); }
  update(id: number, data: any) { return this.http.put(`${this.url}/${id}`, data); }
}
