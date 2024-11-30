import { Injectable, computed, inject, signal } from '@angular/core';
import { environments } from '../../../assets/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthStatus, LoginResponse, User } from '../../interfaces';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl: string = environments.BASE_URL
  private httpClient = inject(HttpClient)
  private router = inject(Router)

  // private _currentUser = signal<string | null>(null)
  private _authStatus = signal<AuthStatus>(AuthStatus.authenticated)

  // public currentUser = computed ( () => this._currentUser()?.id_authentication);
  public authStatus = computed(() => this._authStatus())

  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this._isAuthenticated.asObservable();

  constructor() {
    this.initializeAuthStatus();
  }
  
  private initializeAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
      this.checkAuthStatus().subscribe();
    } else {
      this._authStatus.set(AuthStatus.notAuthenticated);
    }
  }

  private setAuthentication(user: string|null, token: any): boolean {
    // this._currentUser.set(user);
    this._authStatus.set(AuthStatus.authenticated);
    localStorage.setItem('token', token);
    this._isAuthenticated.next(true);
    return true
  }

  login(username: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/auth/login`;
    const body = { username, password };
  
    return this.request(url, body).pipe(
      map((response) => {
        const idAuth = response.body?.id_authentication;
        localStorage.setItem('idAuth', idAuth.toString());
        this._isAuthenticated.next(true);
        return response;
      })
    );
  }

  register(username: string, password: string, nombre: string, email: any, dni: any): Observable<void> {
    const url = `${this.baseUrl}/users`
    const body = {username, password, nombre, email, dni}
    return this.request(url, body)
  }

  private request(url: string, body: any): Observable<any> {
    return this.httpClient.post<LoginResponse>(url, body).pipe(
      map((response) => {
        this.setAuthentication(response.body.username, response.body.token);
        return response;
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  checkAuthStatus(): Observable<boolean> {
    const url = `${this.baseUrl}/auth/check-token`;
    const _token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${_token}`)
      .set('Content-Type', 'application/json')
    return this.httpClient.get<LoginResponse>(url, { headers })
      .pipe(
          map((response) => this.setAuthentication(response.body.username, response.body.token)),
          catchError(() => {
              this._authStatus.set(AuthStatus.notAuthenticated)
              return of(false)
            })
          )
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('idAuth');
    // this._currentUser.set(null);
    this._authStatus.set(AuthStatus.notAuthenticated);
    this.router.navigateByUrl('/login');
  }
}
