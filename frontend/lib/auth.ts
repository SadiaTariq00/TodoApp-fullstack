import { jwtDecode } from 'jwt-decode';
import apiClient from './api';

// Define JWT token interface
interface JwtToken {
  token: string;
  exp?: number;
  user_id?: string;
  sub?: string;
}

// Define user session interface
interface UserSession {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthHelper {
  // Check if JWT token is valid and not expired
  static isTokenValid(token: string | null): boolean {
    if (!token) return false;

    try {
      const decoded: JwtToken = jwtDecode<JwtToken>(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp && decoded.exp < currentTime) {
        // Remove expired token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jwt_token');
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return false;
    }
  }

  // Get current user session
  static getCurrentSession(): UserSession {
    if (typeof window === 'undefined') {
      return { user: null, token: null, isAuthenticated: false };
    }

    const token = localStorage.getItem('jwt_token');
    if (!token || !AuthHelper.isTokenValid(token)) {
      localStorage.removeItem('jwt_token');
      return { user: null, token: null, isAuthenticated: false };
    }

    return { user: null, token, isAuthenticated: true };
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return AuthHelper.getCurrentSession().isAuthenticated;
  }

  // Get current token
  static getCurrentToken(): string | null {
    return AuthHelper.getCurrentSession().token;
  }

  // Get user ID from token
  static getCurrentUserId(): string | null {
    const token = AuthHelper.getCurrentToken();
    if (!token) return null;

    try {
      const decoded: JwtToken = jwtDecode<JwtToken>(token);
      return decoded.user_id || decoded.sub || null;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await apiClient.logoutUser();
    } catch (error) {
      console.error('Error during logout API call:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token');
      }
      apiClient.setToken(null);
    }
  }

  // Check if token is about to expire (within 5 minutes)
  static isTokenExpiringSoon(): boolean {
    const token = AuthHelper.getCurrentToken();
    if (!token) return false;

    try {
      const decoded: JwtToken = jwtDecode<JwtToken>(token);
      if (!decoded.exp) return false;

      const currentTime = Date.now() / 1000;
      const fiveMinutes = 5 * 60;
      return decoded.exp - currentTime < fiveMinutes;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return false;
    }
  }

  // Refresh token if needed (stub)
  static async refreshTokenIfNeeded(): Promise<boolean> {
    if (AuthHelper.isTokenExpiringSoon()) {
      // Token needs manual refresh (or implement refresh API)
      return false;
    }
    return true;
  }
}

export default AuthHelper;

// Export types
export type { JwtToken, UserSession };
 