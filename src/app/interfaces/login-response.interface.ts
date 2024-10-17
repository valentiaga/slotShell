import { User } from './user.interface';

export interface Login {
  token: String;
  user: User;
}

export interface LoginResponse {
  error: boolean;
  status: number;
  body: Login;
}
