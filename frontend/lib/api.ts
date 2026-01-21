import axios, { AxiosInstance } from "axios";

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
   Axios Setup (FIXED)
========================= */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://shaziatariq-todo-app-backend.hf.space";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    // Attach JWT token
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
      if (res.data?.success) {
        localStorage.setItem("jwt_token", res.data.data.token);
      }
      return res.data;
    } catch (err: any) {
      return this.handleError(err, "Registration failed");
    }
  }

  async login(payload: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const res = await this.client.post("/api/auth/login", payload);
      if (res.data?.success) {
        localStorage.setItem("jwt_token", res.data.data.token);
      }
      return res.data;
    } catch (err: any) {
      return this.handleError(err, "Login failed");
    }
  }

  logout() {
    localStorage.removeItem("jwt_token");
  }

  /* =========================
     TASKS
  ========================= */

  private getUserIdFromToken(): string | null {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("jwt_token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return String(payload.user_id || payload.sub || payload.id || "");
    } catch {
      return null;
    }
  }

  async getTasks(): Promise<ApiResponse<{ tasks: Task[] }>> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      return { success: false, error: "Not authenticated", status: 401 };
    }
    try {
      const res = await this.client.get(`/api/${userId}/tasks`);
      return { success: true, data: { tasks: res.data }, status: 200 };
    } catch (err: any) {
      return this.handleError(err, "Failed to fetch tasks");
    }
  }

  async createTask(task: Partial<Task>): Promise<ApiResponse<Task>> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      return { success: false, error: "Not authenticated", status: 401 };
    }
    try {
      const res = await this.client.post(`/api/${userId}/tasks`, task);
      return { success: true, data: res.data, status: 201 };
    } catch (err: any) {
      return this.handleError(err, "Failed to create task");
    }
  }

  async updateTask(id: number, task: Partial<Task>): Promise<ApiResponse<Task>> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      return { success: false, error: "Not authenticated", status: 401 };
    }
    try {
      const res = await this.client.put(`/api/${userId}/tasks/${id}`, task);
      return { success: true, data: res.data, status: 200 };
    } catch (err: any) {
      return this.handleError(err, "Failed to update task");
    }
  }

  async deleteTask(id: number): Promise<ApiResponse<{ message: string }>> {
    const userId = this.getUserIdFromToken();
    if (!userId) {
      return { success: false, error: "Not authenticated", status: 401 };
    }
    try {
      await this.client.delete(`/api/${userId}/tasks/${id}`);
      return {
        success: true,
        data: { message: "Task deleted successfully" },
        status: 200,
      };
    } catch (err: any) {
      return this.handleError(err, "Failed to delete task");
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

  // Logout user from backend
  async logoutUser(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await this.client.post('/api/auth/logout');
      const result = response.data;

      if (result.success) {
        this.logout(); // Clear local storage
      }

      return result;
    } catch (error: any) {
      return this.handleError(error, 'Logout failed');
    }
  }

  /* =========================
     Error handler
  ========================= */
  private handleError(error: any, fallback: string): ApiResponse {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.detail ||
          fallback,
        status: error.response?.status || 500,
      };
    }
    return { success: false, error: fallback, status: 500 };
  }
}

const apiClient = new ApiClient();
export default apiClient;
