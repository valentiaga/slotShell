import { EventEmitter, Injectable } from '@angular/core';
import { Premio, PremioResponse } from '../../interfaces/premio';
import { Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../../assets/environment';

@Injectable({
  providedIn: 'root'
})
export class PremiosService {

  private readonly baseUrl: string = environments.BASE_URL
  public premiosChanged = new EventEmitter<void>();
  private premiosCache: PremioResponse | null = null;

  constructor(private http: HttpClient) {}

  getPremios(id_empresa: number): Observable<PremioResponse> {
    if (this.premiosCache) {
      return of(this.premiosCache);
    }

    const url = `${this.baseUrl}/${id_empresa}/premios`;
    return this.http.get<PremioResponse>(url).pipe(
      tap((premios) => this.premiosCache = premios)
    );
  }

  clearCache() {
    this.premiosCache = null;
  }

  postPremio(idEmpresa: number, nuevoPremio: Premio): Observable<any>{
    const url = `${this.baseUrl}/${idEmpresa}/premio`;
    return this.http.post<any>(url, nuevoPremio);
  }

  getPremio(idEmpresa: number, idPremio: number): Observable<Premio>{
    const url =`${this.baseUrl}/${idEmpresa}/id_premio/${idPremio}`;
    return this.http.get<Premio>(url);
  }

  deleteRow(idEmpresa: number, idPremio: number) {
    return this.http
      .delete(this.baseUrl + `/${idEmpresa}/premio/` + idPremio)
      .pipe(tap(() => this.premiosChanged.next()));
  }
}
