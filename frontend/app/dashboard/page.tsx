 'use client';

import { useState } from 'react';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { Task } from '@/types';

const DashboardPage = () => {
  // Sample tasks for the public dashboard
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      userId: '',
      title: 'Welcome to TaskFlow',
      description: 'This is a sample task to demonstrate the dashboard',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      userId: '',
      title: 'Get Started',
      description: 'Sign up to create your own tasks',
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      userId: '',
      title: 'Explore Features',
      description: 'Try out our advanced task management features',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [currentFilter, setCurrentFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Handle task creation (for demo purposes)
  const handleTaskCreated = (newTask: Task) => {
    const taskWithId = {
      ...newTask,
      id: (tasks.length + 1).toString(),
      userId: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks([taskWithId, ...tasks]);
  };

  // Handle task update (for demo purposes)
  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  // Handle task deletion (for demo purposes)
  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Filter tasks based on current filter
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true; // 'all'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <div className="inline-block px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full mb-4">
                Professional Task Management
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  TaskFlow Dashboard
                </span>
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl">
                Experience our intuitive task management system with advanced features. Sign up to manage your personal tasks securely.
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

        {/* Demo Task Form */}
        <div className="mb-10 fade-in">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100/50 p-8 card-transition hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Try it out</h2>
                <p className="text-gray-600">Add a task to see how it works (changes are temporary for this demo)</p>
              </div>
            </div>
            <TaskForm onTaskCreated={handleTaskCreated} />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-8 mb-8 border border-gray-100/50 card-transition hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sample Tasks</h2>
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

        {/* Empty State */}
        {filteredTasks.length === 0 && (
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
          </div>
        )}

        {/* Task List */}
        {filteredTasks.length > 0 && (
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

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-block px-8 py-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to manage your tasks?</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust TaskFlow to organize their work and boost productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg transform hover:scale-105 button-transform"
              >
                Create Free Account
              </a>
              <a
                href="/login"
                className="px-8 py-4 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg border border-gray-200 transform hover:scale-105"
              >
                Sign In
              </a>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Smart Organization</h4>
              <p className="text-gray-600 text-sm">Intelligent task categorization and prioritization</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Lightning Fast</h4>
              <p className="text-gray-600 text-sm">Quick task creation and seamless performance</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Secure & Private</h4>
              <p className="text-gray-600 text-sm">Enterprise-grade security for your data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;