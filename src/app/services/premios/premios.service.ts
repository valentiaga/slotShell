import { EventEmitter, Injectable } from '@angular/core';
import { Premio, PremioResponse } from '../../interfaces/premio';
import { Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../../assets/environment';
import { UtilService } from '../util/util.service';

@Injectable({
  providedIn: 'root'
})
export class PremiosService {

  private readonly baseUrl: string = environments.BASE_URL
  public premiosChanged = new EventEmitter<void>();
  private premiosCache: PremioResponse | null = null;

  constructor(private http: HttpClient, private util: UtilService) {}

  getPremios(id_empresa: number): Observable<PremioResponse> {
    if (this.premiosCache) {
      return of(this.premiosCache);
    }
  
    const url = `${this.baseUrl}/prizes`;
    return this.util.buildRequest<PremioResponse>('get', url).pipe(
      tap((premios) => this.premiosCache = premios)
    );
  }
  
  postPremio(idEmpresa: number, nuevoPremio: Premio): Observable<any> {
    const url = `${this.baseUrl}/prizes`;
    return this.util.buildRequest<any>('post', url, nuevoPremio);
  }
  
  putPrize(idEmpresa: number, prize: Premio): Observable<any> {
    const url = `${this.baseUrl}/prizes`;
    return this.util.buildRequest<any>('put', url, prize);
  }
  
  deleteRow(idEmpresa: number, id_prize: number): Observable<any> {
    const url = `${this.baseUrl}/prizes/${id_prize}`;
    return this.util.buildRequest<any>('delete', url).pipe(
      tap(() => this.premiosChanged.next())
    );
  }
  
  clearCache() {
    this.premiosCache = null;
  }
}
