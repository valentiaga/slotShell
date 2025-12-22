import { EventEmitter, Injectable } from '@angular/core';
import { Premio, PremioResponse } from '../../interfaces/premio';
import { Observable, of, switchMap, tap } from 'rxjs';
import { UtilService } from '../util/util.service';
import { environments } from '../../../assets/environment';

@Injectable({
  providedIn: 'root'
})
export class PremiosService {
  private readonly baseUrl: string = environments.BASE_URL;
  public premiosChanged = new EventEmitter<void>();
  private premiosCache: PremioResponse | null = null;

  constructor(private readonly util: UtilService) {}

  /**
   * Obtiene la lista de premios
   * @param stationId - ID de la estación (opcional)
   * @returns Observable con la lista de premios
   */
  getPremios(stationId?: number): Observable<PremioResponse> {
    const url = this.buildPrizesUrl(stationId);
    const isSecure = !stationId;

    return this.util.buildRequest<PremioResponse>('get', url, {}, isSecure).pipe(
      tap((premios) => console.log(premios))
    );
  }

  /**
   * Construye la URL para obtener premios
   * @param stationId - ID de la estación (opcional)
   * @returns URL construida
   */
  private buildPrizesUrl(stationId?: number): string {
    let url = `${this.baseUrl}/prizes`;

    if (stationId) {
      url += `?tenantId=${stationId}`;
    }

    return url;
  }

  /**
   * Obtiene solo los premios activos
   * @param stationId - ID de la estación (opcional)
   * @returns Observable con los premios activos
   */
  getActivePrizes(stationId?: number): Observable<PremioResponse> {
    const url = this.buildActivePrizesUrl(stationId);
    return this.util.buildRequest<PremioResponse>('get', url, {}, false);
  }

  /**
   * Construye la URL para obtener premios activos
   * @param stationId - ID de la estación (opcional)
   * @returns URL construida
   */
  private buildActivePrizesUrl(stationId?: number): string {
    let url = `${this.baseUrl}/prizes?active=true`;

    if (stationId) {
      url += `&tenantId=${stationId}`;
    }

    return url;
  }

  /**
   * Crea un nuevo premio
   * @param newPrize - Datos del nuevo premio
   * @returns Observable con la respuesta
   */
  postPremio(newPrize: Premio): Observable<any> {
    const url = `${this.baseUrl}/prizes`;
    return this.util.buildRequest<any>('post', url, newPrize);
  }

  /**
   * Actualiza un premio existente
   * @param prize - Datos del premio a actualizar
   * @returns Observable con la respuesta
   */
  putPrize(prize: Premio): Observable<any> {
    const url = `${this.baseUrl}/prizes`;
    return this.util.buildRequest<any>('put', url, prize);
  }

  /**
   * Elimina un premio
   * @param prizeId - ID del premio a eliminar
   * @returns Observable con la respuesta
   */
  deleteRow(prizeId: number): Observable<PremioResponse> {
    const url = `${this.baseUrl}/prizes/${prizeId}`;
    return this.util.buildRequest<any>('delete', url).pipe(
      tap(() => this.premiosChanged.next()),
      switchMap(() => this.getPremios())
    );
  }

  /**
   * Limpia el caché de premios
   */
  clearCache(): void {
    this.premiosCache = null;
  }
}
