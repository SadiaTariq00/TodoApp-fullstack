'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { Task } from '@/types';

interface TaskFormProps {
  onTaskCreated?: (task: Task) => void;
  initialTask?: Task | null;
  onTaskUpdated?: (task: Task) => void;
  onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onTaskCreated,
  initialTask = null,
  onTaskUpdated,
  onCancel
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const isEditing = !!initialTask;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditing && initialTask) {
        // Update existing task
        const response = await apiClient.updateTask(initialTask.id, {
          title,
          description,
        });
        if (response.success && response.data) {
          onTaskUpdated?.(response.data);
          if (onCancel) onCancel();
        } else {
          setError(response.error || 'Failed to update task');
        }
      } else {
        // Create new task
        const response = await apiClient.createTask({
          title,
          description,
          completed: false,
        });
        if (response.success && response.data) {
          onTaskCreated?.(response.data);
          setTitle('');
          setDescription('');
        } else {
          setError(response.error || 'Failed to create task');
        }
      }
    } catch (err) {
      setError(isEditing ? 'Failed to update task' : 'Failed to create task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Animation effect for form focus
  useEffect(() => {
    if (title || description) {
      setIsFocused(true);
    }
  }, [title, description]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-600/10 to-pink-500/10 border border-blue-500/30 p-6 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.01]">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 group">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white mb-0.5 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-blue-200 text-xs">Add or update your task information</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 backdrop-blur-sm text-red-100 rounded-xl text-sm font-medium border border-red-400/30 fade-in shadow-md">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="group">
            <label htmlFor="title" className="block text-xs font-bold text-blue-200 mb-2 uppercase tracking-wide">
              Task Title *
            </label>
            <div className="relative">
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-blue-400/50 rounded-lg focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all duration-300 focus:shadow-md focus:outline-none font-medium text-gray-800 placeholder-gray-500 shadow-sm group-hover:shadow-md"
                placeholder="What needs to be done?"
                required
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none -z-10"></div>
            </div>
          </div>

          <div className="group">
            <label htmlFor="description" className="block text-xs font-bold text-blue-200 mb-2 uppercase tracking-wide">
              Description
            </label>
            <div className="relative">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-blue-400/50 rounded-lg focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all duration-300 focus:shadow-md focus:outline-none min-h-[80px] font-normal text-gray-700 placeholder-gray-500 resize-none shadow-sm group-hover:shadow-md"
                placeholder="Add more details about the task..."
                rows={3}
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none -z-10"></div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            {isEditing && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-md hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 font-medium text-xs backdrop-blur-sm border border-white/20"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-md hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-60 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none font-medium text-xs flex items-center gap-1 group/btn"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin mr-1"></div>
                  {isEditing ? '...' : '...'}
                </span>
              ) : (
                <>
                  {isEditing ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover/btn:rotate-180 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Save
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover/btn:animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;