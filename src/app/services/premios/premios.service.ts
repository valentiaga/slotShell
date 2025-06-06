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

  constructor(private util: UtilService) {}

  getPremios(estacionID?: number): Observable<PremioResponse> {
    let url = `${this.baseUrl}/prizes`;

    if (estacionID) {
      url += `?tenantId=${estacionID}`;
      return this.util.buildRequest<PremioResponse>('get', url, {}, false).pipe(
        tap((premios) => console.log(premios))
      );
    } else {
      return this.util.buildRequest<PremioResponse>('get', url).pipe(
        tap((premios) => console.log(premios))
      );
    }
  }

  getActivePrizes(estacionID?: number): Observable<PremioResponse> {
    let url = `${this.baseUrl}/prizes?active=true`;

    if (estacionID) {
      url += `&tenantId=${estacionID}`;
    }

    return this.util.buildRequest<PremioResponse>('get', url, {}, false);
  }

  postPremio(nuevoPremio: Premio): Observable<any> {
    const url = `${this.baseUrl}/prizes`;
    return this.util.buildRequest<any>('post', url, nuevoPremio);
  }

  putPrize(prize: Premio): Observable<any> {
    const url = `${this.baseUrl}/prizes`;
    return this.util.buildRequest<any>('put', url, prize);
  }

  deleteRow(id_prize: number): Observable<any> {
    const url = `${this.baseUrl}/prizes/${id_prize}`;
    return this.util.buildRequest<any>('delete', url).pipe(
      tap(() => this.premiosChanged.next())
    );
  }

  clearCache() {
    this.premiosCache = null;
  }
}
