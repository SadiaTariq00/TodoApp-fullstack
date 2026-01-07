'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onTaskUpdate?: (updatedTask: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskUpdate, onTaskDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggleCompletion = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.toggleTaskCompletion(task.id);
      if (response.success) {
        onTaskUpdate?.({ ...task, completed: !task.completed });
      } else {
        setError(response.error || 'Failed to update task');
      }
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.updateTask(task.id, {
        title: editTitle,
        description: editDescription,
      });
      if (response.success && response.data) {
        onTaskUpdate?.(response.data);
        setIsEditing(false);
      } else {
        setError(response.error || 'Failed to update task');
      }
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setIsDeleting(true);
    setError('');
    try {
      const response = await apiClient.deleteTask(task.id);
      if (response.success) {
        onTaskDelete?.(task.id);
      } else {
        setError(response.error || 'Failed to delete task');
      }
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6 mb-6 card-transition transition-all duration-300 hover:shadow-xl ${
      task.completed
        ? 'bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-l-4 border-l-green-500'
        : 'bg-gradient-to-br from-white/80 to-gray-50/80 border-l-4 border-l-blue-500'
    }`}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200 fade-in">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-5 fade-in">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all focus:shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500/20"
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all focus:shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500/20 min-h-[100px]"
            placeholder="Task description"
            rows={3}
          />
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md button-transform disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="loading-spinner mr-2 w-4 h-4"></span>
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 button-transform"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={handleToggleCompletion}
                disabled={loading}
                className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300 cursor-pointer transition-all duration-200 transform hover:scale-110"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className={`text-lg font-semibold mb-1 transition-all duration-200 ${
                  task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-gray-600 mb-3 text-sm leading-relaxed transition-all duration-200 ${
                  task.completed ? 'line-through' : ''
                }`}>
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1 group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 transition-colors duration-200 group-hover:text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {formatDate(task.createdAt)}
                  </span>
                  <span className={`flex items-center gap-1 transition-colors duration-200 ${task.completed ? 'text-success-600' : 'text-primary-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      {task.completed ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      )}
                    </svg>
                    {task.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-all duration-200 button-transform group"
                    title="Edit task"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-all duration-200 button-transform disabled:opacity-50 disabled:cursor-not-allowed group"
                    title="Delete task"
                  >
                    {isDeleting ? (
                      <span className="loading-spinner w-4 h-4"></span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskCard;