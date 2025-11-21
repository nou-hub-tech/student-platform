export interface User {
  id?: number;
  nom?: string;
  prenom?: string;
  username: string;
  email: string;
  password?: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthResponse {
  user: User;
  token: string;
} 