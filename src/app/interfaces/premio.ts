export interface Premio {
  id_prize?: number;
  title: string;
  amount?: number | null; 
  description?: string | null; 
  display: string;
  frequency?: number;
  is_active: boolean;
  spins: number;
  start_time: string;
  end_time: string;
  active_days: string;
}
  
export interface PremioResponse {
    error: boolean;
    status: number;
    body: Premio[];
}
  