export interface Premio {
    id_prize?: number;
    title: string;
    is_active: boolean;
    amoun: number;
    display: string;
    start_time: string;
    end_time: string;
    active_days: string;
    spins: number;
}
  
export interface PremioResponse {
    error: boolean;
    status: number;
    body: Premio[];
}
  