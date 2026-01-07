'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthHelper from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = AuthHelper.isAuthenticated();

    // Redirect to appropriate page based on auth status
    if (isAuthenticated) {
      // Authenticated users go to their personal tasks
      router.push('/tasks');
    } else {
      // Unauthenticated users see the public dashboard
      router.push('/dashboard');
    }
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}