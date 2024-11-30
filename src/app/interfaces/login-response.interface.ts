import { User } from './user.interface';

export interface Login {
  token: string;
  id_authentication: number;
  user: User;
}

export interface LoginResponse {
  error: boolean;
  status: number;
  body: Login;
}
