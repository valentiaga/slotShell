import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Crea los headers de autenticación con el token
   * @returns Headers HTTP con el token de autorización
   * @throws Error si no se encuentra el token
   */
  private createAuthHeaders(): HttpHeaders {
    const token = this.getTokenFromStorage();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtiene el token del almacenamiento local
   * @returns Token de autenticación
   * @throws Error si no se encuentra el token
   */
  private getTokenFromStorage(): string {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('🚨 No se encontró el token en localStorage');
      throw new Error('Token no disponible');
    }

    return token;
  }

  /**
   * Construye y ejecuta una petición HTTP
   * @param method - Método HTTP (get, post, put, delete)
   * @param url - URL del endpoint
   * @param body - Cuerpo de la petición (opcional)
   * @param secure - Si requiere autenticación (default: true)
   * @returns Observable con la respuesta
   * @throws Error si el método HTTP no es soportado
   */
  public buildRequest<T>(method: string, url: string, body?: any, secure: boolean = true): Observable<T> {
    const headers = this.getHeaders(secure);
    return this.executeRequest<T>(method, url, body, headers);
  }

  /**
   * Obtiene los headers según si la petición es segura o no
   * @param secure - Si requiere autenticación
   * @returns Headers HTTP
   */
  private getHeaders(secure: boolean): HttpHeaders {
    return secure ? this.createAuthHeaders() : new HttpHeaders();
  }

  /**
   * Ejecuta la petición HTTP según el método especificado
   * @param method - Método HTTP
   * @param url - URL del endpoint
   * @param body - Cuerpo de la petición
   * @param headers - Headers HTTP
   * @returns Observable con la respuesta
   * @throws Error si el método no es soportado
   */
  private executeRequest<T>(method: string, url: string, body: any, headers: HttpHeaders): Observable<T> {
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

