export interface Premio {
    id_prize?: number;
    title: String;
    is_active: Boolean;
    amoun: number;
    display: String;
    start_time: String;
    end_time: String;
    active_days: String;
}
  
export interface PremioResponse {
    error: boolean;
    status: number;
    body: Premio[];
}
  