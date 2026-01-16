import axios, { AxiosInstance, AxiosError } from "axios";

/* =========================
   Types
========================= */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | null;
  status: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
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

/* =========================
   Axios Setup
========================= */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    // Attach JWT
    this.client.interceptors.request.use((config) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("jwt_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });
  }

  // Helper function to get user ID from JWT token
  private getUserIdFromToken(): string | null {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("jwt_token");
      if (token && token.split('.').length === 3) { // JWT has 3 parts: header.payload.signature
        try {
          // Split the token to get the payload (second part)
          const payload = token.split('.')[1];

          // Add padding if needed for base64 decoding
          const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);

          // Decode the base64 payload - use browser native atob
          const decodedPayload = typeof atob !== 'undefined' ? atob(paddedPayload) : null;
          if (!decodedPayload) {
            console.error('Unable to decode JWT token in this environment');
            return null;
          }

          // Parse as JSON
          const parsedPayload = JSON.parse(decodedPayload);

          // Return the user_id - prioritize user_id and sub as they're what backend uses
          const userId = parsedPayload.user_id || parsedPayload.sub || parsedPayload.userId || parsedPayload.id;
          return userId ? String(userId) : null;
        } catch (error) {
          console.error('Error decoding JWT token:', error);
          return null;
        }
      } else {
        console.warn('JWT token not found or invalid format');
      }
    }
    return null;
  }

  /* =========================
     AUTH
  ========================= */

  async register(payload: {
    email: string;
    username: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const res = await this.client.post("/api/auth/register", payload);
      if (res.data.success) {
        localStorage.setItem("jwt_token", res.data.data.token);
      }
      return res.data;
    } catch (err) {
      return this.handleError(err, "Registration failed");
    }
  }

  async login(payload: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const res = await this.client.post("/api/auth/login", payload);
      if (res.data.success) {
        localStorage.setItem("jwt_token", res.data.data.token);
      }
      return res.data;
    } catch (err) {
      return this.handleError(err, "Login failed");
    }
  }

  // Set the JWT token in localStorage
  setToken(token: string | null) {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("jwt_token", token);
      } else {
        localStorage.removeItem("jwt_token");
      }
    }
  }

  logout() {
    localStorage.removeItem("jwt_token");
  }

  async logoutUser(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await this.client.post('/api/auth/logout');
      const result = response.data;

      if (result.success) {
        this.logout();
      }

      return result;
    } catch (error: any) {
      return this.handleError(error, 'Logout failed');
    }
  }

  /* =========================
     TASKS
  ========================= */

  async getTasks(): Promise<ApiResponse<{ tasks: Task[] }>> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      console.error('User not authenticated');
      return {
        success: false,
        error: 'User not authenticated',
        status: 401,
      }; // Return error response if not authenticated
    }
    try {
      const response = await this.client.get(`/api/${userId}/tasks`);
      return {
        success: true,
        data: { tasks: response.data },
        status: 200,
      };
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      return this.handleError(error, 'Failed to fetch tasks');
    }
  }

  async createTask(task: Partial<Task>): Promise<ApiResponse<Task>> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      console.error('User not authenticated');
      return {
        success: false,
        error: 'User not authenticated',
        status: 401,
      };
    }
    try {
      const response = await this.client.post(`/api/${userId}/tasks`, task);
      return {
        success: true,
        data: response.data,
        status: 201,
      };
    } catch (error: any) {
      console.error('Error creating task:', error);
      return this.handleError(error, 'Failed to create task');
    }
  }

  async updateTask(id: number, task: Partial<Task>): Promise<ApiResponse<Task>> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      console.error('User not authenticated');
      return {
        success: false,
        error: 'User not authenticated',
        status: 401,
      };
    }
    try {
      const response = await this.client.put(`/api/${userId}/tasks/${id}`, task);
      return {
        success: true,
        data: response.data,
        status: 200,
      };
    } catch (error: any) {
      console.error(`Error updating task ${id} for user ${userId}:`, error);
      return this.handleError(error, 'Failed to update task');
    }
  }

  async toggleTaskCompletion(id: number): Promise<ApiResponse<Task>> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      console.error('User not authenticated');
      return {
        success: false,
        error: 'User not authenticated',
        status: 401,
      };
    }
    try {
      const response = await this.client.patch(`/api/${userId}/tasks/${id}/complete`);
      return {
        success: true,
        data: response.data,
        status: response.status || 200,
      };
    } catch (error: any) {
      console.error(`Error toggling task completion for task ${id} and user ${userId}:`, error);
      return this.handleError(error, 'Failed to toggle task completion');
    }
  }

  async deleteTask(id: number): Promise<ApiResponse<{ message: string }>> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      console.error('User not authenticated');
      return {
        success: false,
        error: 'User not authenticated',
        status: 401,
      };
    }
    try {
      const response = await this.client.delete(`/api/${userId}/tasks/${id}`);
      // For DELETE, the response.data might be empty (204 No Content), but we still succeeded
      return {
        success: true,
        data: { message: 'Task deleted successfully' },
        status: response.status || 200,
      };
    } catch (error: any) {
      console.error(`Error deleting task ${id} for user ${userId}:`, error);
      return this.handleError(error, 'Failed to delete task');
    }
  }

  /* =====================
     Error
  ========================= */

  private handleError(error: any, fallback: string): ApiResponse {
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        url: error.config?.url,
        method: error.config?.method
      });

      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || error.message || fallback,
        status: error.response?.status || 500,
      };
    }
    console.error('Non-Axios error:', error);
    return { success: false, error: error.message || fallback, status: 500 };
  }
}

const apiClient = new ApiClient();
export default apiClient;