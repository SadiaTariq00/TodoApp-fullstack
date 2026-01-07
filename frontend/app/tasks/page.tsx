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
  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
  };

  // Handle task update
  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  // Handle task deletion
  const handleTaskDeleted = (taskId: string) => {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="inline-block px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full mb-4">
                  Personal Task Management
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    TaskFlow Dashboard
                  </span>
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl">
                  Organize, track, and complete your tasks efficiently with our intuitive task management system.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-fit">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{tasks.length}</div>
                  <div className="text-sm text-gray-500 font-medium">Total Tasks</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-gradient-to-r from-gray-500 to-gray-600 h-1.5 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{tasks.filter(t => !t.completed).length}</div>
                  <div className="text-sm text-gray-500 font-medium">Active</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full" style={{width: `${tasks.filter(t => !t.completed).length > 0 ? Math.min(100, (tasks.filter(t => !t.completed).length / tasks.length) * 100) : 0}%`}}></div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="text-2xl font-bold text-green-600 mb-1">{tasks.filter(t => t.completed).length}</div>
                  <div className="text-sm text-gray-500 font-medium">Completed</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full" style={{width: `${tasks.filter(t => t.completed).length > 0 ? Math.min(100, (tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl text-center font-medium border border-red-200 shadow-sm fade-in">
              {error}
            </div>
          )}

          {/* Task Form */}
          <div className="mb-10 fade-in">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100/50 p-8 card-transition hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
                  <p className="text-gray-600">Add a new task to your list</p>
                </div>
              </div>
              <TaskForm onTaskCreated={handleTaskCreated} />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-8 mb-8 border border-gray-100/50 card-transition hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Tasks</h2>
                <p className="text-gray-600">Manage and organize your tasks efficiently</p>
              </div>

              {/* Filter buttons */}
              <div className="flex bg-gradient-to-r from-gray-100 to-gray-200 p-1 rounded-2xl">
                <button
                  onClick={() => setCurrentFilter('all')}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                    currentFilter === 'all'
                      ? 'bg-white text-blue-600 shadow-lg font-bold'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  All Tasks
                </button>
                <button
                  onClick={() => setCurrentFilter('active')}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                    currentFilter === 'active'
                      ? 'bg-white text-blue-600 shadow-lg font-bold'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setCurrentFilter('completed')}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                    currentFilter === 'completed'
                      ? 'bg-white text-blue-600 shadow-lg font-bold'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <p className="text-gray-600 text-base">Loading your tasks...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredTasks.length === 0 && (
            <div className="text-center py-20 fade-in">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {currentFilter === 'completed'
                    ? 'No completed tasks yet'
                    : currentFilter === 'active'
                      ? 'No active tasks'
                      : 'No tasks yet'}
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
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
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg transform hover:scale-105 button-transform"
                >
                  Create Your First Task
                </button>
              )}
            </div>
          )}

          {/* Task List */}
          {!loading && filteredTasks.length > 0 && (
            <div className="space-y-4 fade-in">
              {filteredTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="slide-in hover:scale-[1.02] transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
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