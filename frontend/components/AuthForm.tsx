'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { RegisterCredentials, LoginCredentials } from '@/types';

interface AuthFormProps {
  type: 'login' | 'register';
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = type === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;

      if (isLogin) {
        // Login credentials
        const credentials: LoginCredentials = { email, password };
        response = await apiClient.login(credentials);
      } else {
        // Register credentials - map name to username for backend compatibility
        const credentials = {
          email,
          username: name,  // Map frontend 'name' field to backend 'username'
          password
        };
        response = await apiClient.register(credentials);
      }
      

      if (response.success) {
        // Redirect to tasks page after successful authentication
        router.push('/tasks');
        router.refresh(); // Refresh to update the UI
      } else {
        setError(response.error || (isLogin ? 'Login failed' : 'Registration failed'));
      }
    } catch (err) {
      setError(isLogin ? 'Login failed' : 'Registration failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md border border-gray-100 transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-5 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            {isLogin ? 'Welcome Back' : 'Join TaskFlow'}
          </h1>
          <p className="text-gray-600 text-base font-medium">
            {isLogin
              ? 'Sign in to access your tasks and productivity tools'
              : 'Create an account to start managing your tasks efficiently'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200 fade-in shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 focus:shadow-lg focus:outline-none bg-gray-50 focus:bg-white shadow-sm"
                placeholder="Enter your full name"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 focus:shadow-lg focus:outline-none bg-gray-50 focus:bg-white shadow-sm"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 pr-14 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 focus:shadow-lg focus:outline-none bg-gray-50 focus:bg-white shadow-sm"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-indigo-600 text-sm font-medium transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {isLogin && (
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            )}
            {isLogin && (
              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-70 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isLogin ? "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" : "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"} />
                  </svg>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-100 pt-6">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <a
              href={isLogin ? '/register' : '/login'}
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </p>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;