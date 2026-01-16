 'use client';

import { useState } from 'react';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { Task } from '@/types';

const DashboardPage = () => {
  // Sample tasks for the public dashboard
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      user_id: '',
      title: 'Welcome to TaskFlow',
      description: 'This is a sample task to demonstrate the dashboard',
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      user_id: '',
      title: 'Get Started',
      description: 'Sign up to create your own tasks',
      completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      user_id: '',
      title: 'Explore Features',
      description: 'Try out our advanced task management features',
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const [currentFilter, setCurrentFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Handle task creation (for demo purposes)
  const handleTaskCreated = (newTask: Task) => {
    const taskWithId = {
      ...newTask,
      id: tasks.length + 1,
      user_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTasks([taskWithId, ...tasks]);
  };

  // Handle task update (for demo purposes)
  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  // Handle task deletion (for demo purposes)
  const handleTaskDeleted = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Filter tasks based on current filter
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true; // 'all'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 py-4 sm:py-6 md:py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-5 left-2 w-40 h-40 sm:w-52 sm:h-52 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-2 w-52 h-52 sm:w-64 sm:h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-5 left-1/4 w-48 h-48 sm:w-60 sm:h-60 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

        <div className="container mx-auto px-3 sm:px-4 max-w-full sm:max-w-4xl md:max-w-5xl lg:max-w-6xl relative z-10">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8 md:gap-10">
            <div className="flex-1">
              <div className="inline-block px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm sm:text-base font-bold rounded-full mb-3 sm:mb-5 backdrop-blur-sm shadow-lg">
                💼 Professional Task Management
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 md:mb-5 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                  TaskFlow Pro
                </span>
              </h1>
              <p className="text-blue-100 text-lg sm:text-xl max-w-full sm:max-w-2xl leading-relaxed">
                Experience our intuitive task management system with advanced features. Sign up to manage your personal tasks securely.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 min-w-fit">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.02] sm:hover:scale-105 group">
                <div className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 group-hover:text-blue-300 transition-colors duration-300">{tasks.length}</div>
                <div className="text-sm sm:text-base text-blue-200 font-semibold">Total Tasks</div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2 sm:mt-3">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-700 ease-out" style={{width: '100%'}}></div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.02] sm:hover:scale-105 group">
                <div className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 group-hover:text-yellow-300 transition-colors duration-300">{tasks.filter(t => !t.completed).length}</div>
                <div className="text-sm sm:text-base text-yellow-200 font-semibold">Active</div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2 sm:mt-3">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-700 ease-out" style={{width: `${tasks.filter(t => !t.completed).length > 0 ? Math.min(100, (tasks.filter(t => !t.completed).length / tasks.length) * 100) : 0}%`}}></div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.02] sm:hover:scale-105 group">
                <div className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 group-hover:text-green-300 transition-colors duration-300">{tasks.filter(t => t.completed).length}</div>
                <div className="text-sm sm:text-base text-green-200 font-semibold">Completed</div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2 sm:mt-3">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-700 ease-out" style={{width: `${tasks.filter(t => t.completed).length > 0 ? Math.min(100, (tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Task Form */}
        <div className="mb-8 sm:mb-10 md:mb-12 fade-in">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-2 border-blue-500/30 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-sm">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-7">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Try it out</h2>
                  <p className="text-blue-200 text-base sm:text-lg">Add a task to see how it works (changes are temporary for this demo)</p>
                </div>
              </div>
              <TaskForm onTaskCreated={handleTaskCreated} />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-2 border-blue-500/30 p-4 sm:p-6 md:p-8 mb-8 sm:mb-10 shadow-2xl backdrop-blur-sm">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-28 h-28 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-7">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3">Sample Tasks</h2>
              <p className="text-blue-200 text-base sm:text-lg">Manage and organize your tasks efficiently</p>
            </div>

            {/* Filter buttons */}
            <div className="flex bg-white/20 backdrop-blur-sm p-2 rounded-xl sm:rounded-2xl border border-white/30">
              <button
                onClick={() => setCurrentFilter('all')}
                className={`px-4 sm:px-5 md:px-7 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 font-bold text-sm sm:text-base ${
                  currentFilter === 'all'
                    ? 'bg-white text-blue-600 shadow-lg scale-105'
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
              >
                All Tasks
              </button>
              <button
                onClick={() => setCurrentFilter('active')}
                className={`px-4 sm:px-5 md:px-7 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 font-bold text-sm sm:text-base ${
                  currentFilter === 'active'
                    ? 'bg-white text-blue-600 shadow-lg scale-105'
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setCurrentFilter('completed')}
                className={`px-4 sm:px-5 md:px-7 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 font-bold text-sm sm:text-base ${
                  currentFilter === 'completed'
                    ? 'bg-white text-blue-600 shadow-lg scale-105'
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12 sm:py-16 md:py-24 fade-in">
            <div className="mb-6 sm:mb-10">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-8 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center border-4 border-dashed border-blue-400/30 animate-bounce">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4">
                {currentFilter === 'completed'
                  ? 'No completed tasks yet'
                  : currentFilter === 'active'
                    ? 'No active tasks'
                    : 'No tasks yet'}
              </h3>
              <p className="text-lg sm:text-xl text-blue-200 max-w-sm sm:max-w-md mx-auto leading-relaxed">
                {currentFilter === 'completed'
                  ? 'Complete some tasks to see them here.'
                  : currentFilter === 'active'
                    ? 'Add a new task to get started!'
                    : 'Get started by creating your first task.'}
              </p>
            </div>
          </div>
        )}

        {/* Task List */}
        {filteredTasks.length > 0 && (
          <div className="space-y-4 sm:space-y-6 fade-in">
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className="slide-in animate-fadeInUp hover:scale-[1.01] transition-all duration-500"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <TaskCard
                  task={task}
                  onTaskUpdate={handleTaskUpdated}
                  onTaskDelete={handleTaskDeleted}
                />
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-2 border-blue-500/30 p-12 mb-12 shadow-2xl backdrop-blur-sm">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-56 h-56 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-4xl font-black text-white mb-5">Ready to manage your tasks?</h3>
              <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of professionals who trust TaskFlow to organize their work and boost productivity.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <a
                  href="/register"
                  className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl hover:from-blue-700 hover:to-purple-700 transition-all duration-500 shadow-2xl hover:shadow-3xl font-black text-xl transform hover:scale-110 button-transform backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create Free Account
                  </span>
                </a>
                <a
                  href="/login"
                  className="px-10 py-5 bg-white/20 backdrop-blur-sm text-white rounded-3xl hover:bg-white/30 transition-all duration-500 shadow-2xl hover:shadow-3xl font-black text-xl border border-white/30 transform hover:scale-110"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 p-7 shadow-xl backdrop-blur-sm hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full blur-2xl"></div>
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-black text-2xl text-white mb-3">Smart Organization</h4>
                <p className="text-blue-200 text-lg">Intelligent task categorization and prioritization</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 p-7 shadow-xl backdrop-blur-sm hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full blur-2xl"></div>
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-black text-2xl text-white mb-3">Lightning Fast</h4>
                <p className="text-purple-200 text-lg">Quick task creation and seamless performance</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 p-7 shadow-xl backdrop-blur-sm hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-2xl"></div>
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-black text-2xl text-white mb-3">Secure & Private</h4>
                <p className="text-green-200 text-lg">Enterprise-grade security for your data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;