export interface Counter {
    id_counter: number,
    id_authentication: number,
    counter: number,
    created_at: Date,
}

export interface postCounter {
    id_authentication: number,
    counter: number,
}
  
export interface CounterResponse {
    error: boolean;
    status: number;
    body: {
      id_counter: number;
      id_authentication: number;
      counter: number;
      created_at: string;
    };
  }