'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthHelper from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = null
}) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if we're in the browser environment
      if (typeof window !== 'undefined') {
        // Initialize token from storage
        const token = localStorage.getItem('jwt_token');
        if (token) {
          // Set token in API client
          const apiClient = (await import('@/lib/api')).default;
          apiClient.setToken(token);
        }

        const authStatus = AuthHelper.isAuthenticated();
        setIsAuthenticated(authStatus);

        // If not authenticated, redirect to login
        if (!authStatus) {
          router.replace('/login');
        }
      } else {
        // On server, set as not authenticated initially
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show nothing while checking auth status
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, show fallback or nothing
  return fallback || null;
};

export default ProtectedRoute;