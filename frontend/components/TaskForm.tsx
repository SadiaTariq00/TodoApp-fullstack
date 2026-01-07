'use client';

import { useState } from 'react';
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

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100/50 p-6 card-transition hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <p className="text-gray-600 text-sm">Add or update your task information</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200 fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all focus:shadow-md focus:outline-none focus:bg-white shadow-sm"
            placeholder="What needs to be done?"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all focus:shadow-md focus:outline-none focus:bg-white shadow-sm min-h-[100px]"
            placeholder="Add more details about the task..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 button-transform shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg button-transform disabled:transform-none transform hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="loading-spinner mr-2 w-4 h-4"></span>
                {isEditing ? 'Updating...' : 'Creating...'}
              </span>
            ) : isEditing ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;