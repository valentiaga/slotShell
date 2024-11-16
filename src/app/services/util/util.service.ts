import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  constructor(private http: HttpClient) { };

  private createAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  public buildRequest<T>(method: string, url: string, body?: any, secure: boolean = true ): Observable<T> {
    const headers = secure? this.createAuthHeaders() : {};
    switch (method.toLowerCase()) {
      case 'get':
        return this.http.get<T>(url, { headers });
      case 'post':
        return this.http.post<T>(url, body, { headers });
      case 'put':
        return this.http.put<T>(url, body, { headers });
      case 'delete':
        return this.http.delete<T>(url, { headers });
      default:
        throw new Error('Método HTTP no soportado');
    }
  }

}