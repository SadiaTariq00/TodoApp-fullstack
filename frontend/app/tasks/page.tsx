'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import apiClient from '@/lib/api';
import { Task } from '@/types';

const TasksPage = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentFilter, setCurrentFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.getTasks();

      // Response is now guaranteed to be ApiResponse format
      if (response.success) {
        setTasks(response.data?.tasks || []);
      } else {
        setError(response.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks based on current filter
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true; // 'all'
  });

  // Handle task creation
  const handleTaskCreated = async (newTask: Partial<Task>) => {
    try {
      const response = await apiClient.createTask(newTask);

      if (response.success && response.data) {
        setTasks([response.data, ...tasks]);
      } else {
        setError(response.error || 'Failed to create task');
      }
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
    }
  };

  // Handle task update - TaskCard already made the API call, just update UI state
  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  // Handle task deletion - TaskCard already made the API call, just update UI state
  const handleTaskDeleted = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    router.push('/login');
    router.refresh();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-purple-900 to-pink-900 py-3 sm:py-4 md:py-6 relative overflow-x-hidden">
        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-5 left-2 w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-bounce" style={{animationDuration: '6s'}}></div>
          <div className="absolute top-20 right-2 w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-red-500/30 rounded-full blur-3xl animate-ping" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
          <div className="absolute bottom-5 left-1/4 w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-gradient-to-r from-blue-400/30 via-indigo-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '7s', animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-spin" style={{animationDuration: '10s'}}></div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 max-w-full sm:max-w-4xl md:max-w-5xl lg:max-w-6xl relative z-10">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-white text-sm font-black rounded-full mb-3 backdrop-blur-lg shadow-2xl animate-pulse">
                  🚀 ULTIMATE TASK MANAGEMENT PRO
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 mb-3 leading-tight drop-shadow-2xl">
                  TASKFLOW<span className="text-yellow-300">MAX</span>
                </h1>
                <p className="text-cyan-100 text-base sm:text-lg max-w-full sm:max-w-2xl leading-relaxed font-bold drop-shadow-lg">
                  Organize, track, and dominate your tasks with our cutting-edge quantum-powered task management system.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-w-fit">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 p-4 shadow-2xl backdrop-blur-lg hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-1 group animate-fadeInUp">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="text-xl font-black text-white mb-1 group-hover:text-cyan-300 transition-colors duration-500 animate-pulse">{tasks.length}</div>
                    <div className="text-xs sm:text-sm text-cyan-200 font-black">TOTAL TASKS</div>
                    <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out animate-pulse" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-400/40 p-4 shadow-2xl backdrop-blur-lg hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-1 group animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="text-xl font-black text-white mb-1 group-hover:text-yellow-300 transition-colors duration-500 animate-pulse">{tasks.filter(t => !t.completed).length}</div>
                    <div className="text-xs sm:text-sm text-yellow-200 font-black">ACTIVE TASKS</div>
                    <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-out animate-pulse" style={{width: `${tasks.filter(t => !t.completed).length > 0 ? Math.min(100, (tasks.filter(t => !t.completed).length / tasks.length) * 100) : 0}%`}}></div>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-400/40 p-4 shadow-2xl backdrop-blur-lg hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-1 group animate-fadeInUp" style={{animationDelay: '0.4s'}}>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-500/10 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="text-xl font-black text-white mb-1 group-hover:text-green-300 transition-colors duration-500 animate-pulse">{tasks.filter(t => t.completed).length}</div>
                    <div className="text-xs sm:text-sm text-green-200 font-black">COMPLETED</div>
                    <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out animate-pulse" style={{width: `${tasks.filter(t => t.completed).length > 0 ? Math.min(100, (tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%`}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-500/40 to-pink-500/40 text-red-100 rounded-xl text-center font-black text-base border border-red-400/60 backdrop-blur-xl shadow-2xl fade-in animate-pulse">
              ⚡⚠️ {error} ⚡
            </div>
          )}

          {/* Task Form */}
          <div className="mb-8 fade-in">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 border border-white/50 p-6 shadow-2xl backdrop-blur-xl">
              {/* Enhanced animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-r from-cyan-300/40 via-purple-400/40 to-pink-300/40 rounded-full blur-3xl animate-bounce" style={{animationDuration: '4s'}}></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-r from-purple-400/50 via-pink-400/50 to-red-400/50 rounded-full blur-3xl animate-ping" style={{animationDuration: '3s', animationDelay: '1.5s'}}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s'}}></div>
              </div>

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-2xl animate-pulse">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-900 via-blue-750 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
                      CREATE NEW TASK
                    </h2>
                    <p className="text-white/90 text-sm sm:text-base mt-1 font-medium">Add a new task to your ultimate task list</p>
                  </div>
                </div>
                <TaskForm onTaskCreated={handleTaskCreated} />
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-600/20 to-pink-500/20 border border-white/40 p-6 mb-8 shadow-2xl backdrop-blur-xl">
            {/* Enhanced animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-indigo-400/40 to-purple-500/40 rounded-full blur-3xl animate-bounce" style={{animationDuration: '5s'}}></div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-2xl mb-3">
                  📋 YOUR TASKS
                </h2>
                <p className="text-white/90 text-sm sm:text-base font-medium">Manage and organize your tasks efficiently</p>
              </div>

              {/* Filter buttons */}
              <div className="flex bg-white/30 backdrop-blur-xl p-2 rounded-2xl border border-white/40 shadow-xl">
                <button
                  onClick={() => setCurrentFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-all duration-500 font-black text-sm ${
                    currentFilter === 'all'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-2xl scale-110 animate-pulse'
                      : 'text-white/80 hover:text-white bg-white/20 hover:bg-white/30'
                  }`}
                >
                  📦 All Tasks
                </button>
                <button
                  onClick={() => setCurrentFilter('active')}
                  className={`px-4 py-2 rounded-lg transition-all duration-500 font-black text-sm ${
                    currentFilter === 'active'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl scale-110 animate-pulse'
                      : 'text-white/80 hover:text-white bg-white/20 hover:bg-white/30'
                  }`}
                >
                  ⚡ Active
                </button>
                <button
                  onClick={() => setCurrentFilter('completed')}
                  className={`px-4 py-2 rounded-lg transition-all duration-500 font-black text-sm ${
                    currentFilter === 'completed'
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-2xl scale-110 animate-pulse'
                      : 'text-white/80 hover:text-white bg-white/20 hover:bg-white/30'
                  }`}
                >
                  ✓ Completed
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full mb-4 animate-pulse shadow-2xl">
                  <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 animate-pulse">
                  LOADING YOUR TASKS...
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredTasks.length === 0 && (
            <div className="text-center py-16 fade-in">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-400/30 via-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center border-4 border-dashed border-cyan-400/50 animate-bounce shadow-2xl" style={{animationDuration: '3s'}}>
                  <svg className="w-12 h-12 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 mb-3 drop-shadow-2xl">
                  {currentFilter === 'completed'
                    ? 'No completed tasks yet'
                    : currentFilter === 'active'
                      ? 'No active tasks'
                      : 'No tasks yet'}
                </h3>
                <p className="text-base text-white/90 max-w-md mx-auto leading-relaxed font-bold drop-shadow-lg">
                  {currentFilter === 'completed'
                    ? 'Complete some tasks to see them here.'
                    : currentFilter === 'active'
                      ? 'Add a new task to get started!'
                      : 'Get started by creating your first task.'}
                </p>
              </div>
              {currentFilter === 'all' && (
                <button
                  onClick={() => {
                    const inputElement = document.querySelector('input[placeholder="What needs to be done?"]') as HTMLInputElement | null;
                    if (inputElement) {
                      inputElement.focus();
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-white rounded-xl hover:from-cyan-500 hover:via-purple-600 hover:to-pink-600 transition-all duration-700 shadow-2xl hover:shadow-3xl font-black text-sm transform hover:scale-110 button-transform backdrop-blur-sm border border-white/40 animate-pulse"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    CREATE YOUR FIRST TASK
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Task List */}
          {!loading && filteredTasks.length > 0 && (
            <div className="space-y-8 fade-in">
              {filteredTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="slide-in animate-fadeInUp hover:scale-105 transition-all duration-700"
                  style={{ animationDelay: `${index * 200}ms` }}
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
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TasksPage;