import { jwtDecode } from 'jwt-decode';
import apiClient from './api';

// Define JWT token interface
interface JwtToken {
  token: string;
  expiresAt: number;
  userId: string;
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
    if (!token) {
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Check if token is expired
      if (decoded.exp < currentTime) {
        // Remove expired token from storage (only in browser)
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
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return {
        user: null,
        token: null,
        isAuthenticated: false
      };
    }

    const token = localStorage.getItem('jwt_token');

    if (!token) {
      return {
        user: null,
        token: null,
        isAuthenticated: false
      };
    }

    if (!AuthHelper.isTokenValid(token)) {
      localStorage.removeItem('jwt_token');
      return {
        user: null,
        token: null,
        isAuthenticated: false
      };
    }

    // In a real app, you might want to decode the token to get user info
    // For now, we'll just return the token validity status
    return {
      user: null, // We'll get user data from API calls
      token,
      isAuthenticated: true
    };
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return AuthHelper.getCurrentSession().isAuthenticated;
  }

  // Get current token
  static getCurrentToken(): string | null {
    const session = AuthHelper.getCurrentSession();
    return session.token;
  }

  // Get user ID from token
  static getCurrentUserId(): string | null {
    const token = AuthHelper.getCurrentToken();
    if (!token) {
      return null;
    }

    try {
      const decoded: any = jwtDecode(token);
      return decoded.userId || decoded.sub || null;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      // Call the API to invalidate the session
      await apiClient.logoutUser();
    } catch (error) {
      console.error('Error during logout API call:', error);
      // Even if API call fails, clear local storage
    } finally {
      // Clear local storage anyway
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token');
      }
      // Update API client
      apiClient.setToken(null);
    }
  }

  // Check if token is about to expire (within 5 minutes)
  static isTokenExpiringSoon(): boolean {
    const token = AuthHelper.getCurrentToken();
    if (!token) {
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const fiveMinutes = 5 * 60; // 5 minutes in seconds

      // Check if token expires within 5 minutes
      return decoded.exp - currentTime < fiveMinutes;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return false;
    }
  }

  // Refresh token if needed (in a real app, you'd have a refresh token mechanism)
  static async refreshTokenIfNeeded(): Promise<boolean> {
    if (AuthHelper.isTokenExpiringSoon()) {
      // In a real implementation, you would call a refresh endpoint
      // For now, we'll just return false indicating the token needs to be refreshed manually
      return false;
    }
    return true;
  }
}

export default AuthHelper;

// Export types
export type { JwtToken, UserSession };