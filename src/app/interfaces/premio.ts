export interface Premio {
    id_premio?: number;
    identificacion: String;
    is_activo: Boolean;
    monto: number;
    display: String;
    hora_inicio: String;
    hora_fin: String;
    dias: Number[];
}
  
export interface PremioResponse {
    error: boolean;
    status: number;
    body: Premio[];
}
  