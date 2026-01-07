// types/index.ts

export interface User {
  id: number;
  email: string;
  username: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface JwtToken {
  token: string;
  expiresAt: number;
  userId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | null;
  status: number;
}

export interface AuthState {
  user: User | null;
  token: JwtToken | null;
  isLoading: boolean;
  error: string | null;
}

export interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  currentFilter: 'all' | 'active' | 'completed';
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string; // Required for mapping to username
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  completed: boolean;
}