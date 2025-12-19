import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthStatus, LoginResponse, User } from '../../interfaces';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environments } from '../../../assets/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl: string = environments.BASE_URL;
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _authStatus = signal<AuthStatus>(AuthStatus.authenticated);
  private readonly _isAuthenticated = new BehaviorSubject<boolean>(false);
  
  public readonly authStatus = computed(() => this._authStatus());
  public readonly isAuthenticated$ = this._isAuthenticated.asObservable();

  constructor() {
    this.initializeAuthStatus();
  }
  
  /**
   * Inicializa el estado de autenticación verificando el token almacenado
   */
  private initializeAuthStatus(): void {
    const token = localStorage.getItem('token');
    
    if (token) {
      this.checkAuthStatus().subscribe();
    } else {
      this._authStatus.set(AuthStatus.notAuthenticated);
    }
  }

  /**
   * Establece el estado de autenticación del usuario
   * @param user - Nombre de usuario
   * @param token - Token de autenticación
   * @returns true si la autenticación fue exitosa
   */
  private setAuthentication(user: string | null, token: string): boolean {
    this._authStatus.set(AuthStatus.authenticated);
    localStorage.setItem('token', token);
    this._isAuthenticated.next(true);
    return true;
  }

  /**
   * Realiza el login del usuario
   * @param username - Nombre de usuario
   * @param password - Contraseña
   * @returns Observable con la respuesta del login
   */
  login(username: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/auth/login`;
    const body = { username, password };
  
    return this.request(url, body).pipe(
      map((response) => this.handleLoginResponse(response))
    );
  }

  /**
   * Maneja la respuesta exitosa del login
   * @param response - Respuesta del servidor
   * @returns Respuesta procesada
   */
  private handleLoginResponse(response: any): any {
    const idAuth = response.body?.id_authentication;
    localStorage.setItem('idAuth', idAuth.toString());
    this._isAuthenticated.next(true);
    return response;
  }

  /**
   * Registra un nuevo usuario
   * @param username - Nombre de usuario
   * @param password - Contraseña
   * @param nombre - Nombre completo
   * @param email - Email
   * @param dni - DNI
   * @returns Observable con la respuesta del registro
   */
  register(username: string, password: string, nombre: string, email: string, dni: string): Observable<void> {
    const url = `${this.baseUrl}/users`;
    const body = { username, password, nombre, email, dni };
    return this.request(url, body);
  }

  /**
   * Realiza una petición HTTP de autenticación
   * @param url - URL del endpoint
   * @param body - Cuerpo de la petición
   * @returns Observable con la respuesta
   */
  private request(url: string, body: any): Observable<any> {
    return this.httpClient.post<LoginResponse>(url, body).pipe(
      map((response) => this.processAuthResponse(response)),
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * Procesa la respuesta de autenticación
   * @param response - Respuesta del servidor
   * @returns Respuesta procesada
   */
  private processAuthResponse(response: LoginResponse): LoginResponse {
    this.setAuthentication(response.body.username, response.body.token);
    return response;
  }

  /**
   * Verifica el estado de autenticación actual
   * @returns Observable con el estado de autenticación
   */
  checkAuthStatus(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/check-token`;
    const headers = this.createAuthHeaders();
    
    return this.httpClient.get<LoginResponse>(url, { headers })
      .pipe(
        map((response) => this.setAuthentication(response.body.username, response.body.token)),
        catchError(() => this.handleAuthCheckError())
      );
  }

  /**
   * Crea los headers de autenticación
   * @returns Headers HTTP con el token
   */
  private createAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  }

  /**
   * Maneja el error al verificar el estado de autenticación
   * @returns Observable con false
   */
  private handleAuthCheckError(): Observable<boolean> {
    this._authStatus.set(AuthStatus.notAuthenticated);
    return of(false);
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.clearAuthData();
    this._authStatus.set(AuthStatus.notAuthenticated);
    this.router.navigateByUrl('/login');
  }

  /**
   * Limpia los datos de autenticación almacenados
   */
  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('idAuth');
  }
}
