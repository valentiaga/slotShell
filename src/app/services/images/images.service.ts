import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { environments } from '../../../assets/environment';

export interface Image {
  id_img?: number;
  name_img: string;
  url_img: string;
  public_id?: string;
  is_new?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  private readonly baseUrl = environments.BASE_URL;
  private imagesCache: Image[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor(
    private http: HttpClient,
    private cloudinaryService: CloudinaryService
  ) {
    // Subscribirse a cambios de nuevas imágenes
    this.cloudinaryService.hasNewImages$.subscribe(hasNew => {
      if (hasNew) {
        this.clearCache();
      }
    });
  }

  getimages(): Observable<any> {
    const now = Date.now();
    
    // Si hay caché válido y no hay nuevas imágenes, usar caché
    if (this.imagesCache && (now - this.cacheTimestamp < this.CACHE_DURATION)) {
      return of({ body: this.imagesCache });
    }

    // Obtener imágenes del servidor
    return this.http.get<any>(`${this.baseUrl}/images`).pipe(
      tap(response => {
        this.imagesCache = response.body;
        this.cacheTimestamp = now;
        
        // Pre-cargar imágenes en el servicio de Cloudinary
        const imageUrls = response.body.map((img: Image) => img.url_img);
        this.cloudinaryService.preloadImages(imageUrls);
        
        // Reset flag de nuevas imágenes
        this.cloudinaryService.resetNewImagesFlag();
      })
    );
  }

  saveImage(imageData: Image): Observable<any> {
    return this.http.post(`${this.baseUrl}/images`, imageData).pipe(
      tap(() => {
        this.clearCache(); // Invalidar caché al agregar nueva imagen
      })
    );
  }

  deleteImage(id: number, publicId?: string): Observable<any> {
    // Si tiene public_id de Cloudinary, eliminar también de allí
    if (publicId) {
      this.cloudinaryService.deleteImage(publicId).subscribe({
        next: () => console.log('Imagen eliminada de Cloudinary'),
        error: (err) => console.error('Error al eliminar de Cloudinary:', err)
      });
    }

    return this.http.delete(`${this.baseUrl}/images/${id}`).pipe(
      tap(() => {
        this.clearCache(); // Invalidar caché al eliminar
      })
    );
  }

  clearCache(): void {
    this.imagesCache = null;
    this.cacheTimestamp = 0;
  }

  // Obtener imagen específica (con caché)
  getImageFromCache(url: string): Image | undefined {
    return this.imagesCache?.find(img => img.url_img === url);
  }
}