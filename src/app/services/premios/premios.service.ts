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

    const url = `${this.baseUrl}/prizes`;
    return this.http.get<PremioResponse>(url).pipe(
      tap((premios) => this.premiosCache = premios)
    );
  }

  clearCache() {
    this.premiosCache = null;
  }

  postPremio(idEmpresa: number, nuevoPremio: Premio): Observable<any>{
    console.log("🚀 ~ PremiosService ~ postPremio ~ nuevoPremio:", nuevoPremio);
    const url = `${this.baseUrl}/prizes`;
    return this.http.post<any>(url, nuevoPremio);
  }

  getPremio(idEmpresa: number, id_prize: number): Observable<Premio>{
    const url =`${this.baseUrl}/${idEmpresa}/id_premio/${id_prize}`;
    return this.http.get<Premio>(url);
  }

  deleteRow(idEmpresa: number, id_prize: number) {
    return this.http
      .delete(this.baseUrl + `/prizes/` + id_prize)
      .pipe(tap(() => this.premiosChanged.next()));
  }
}
