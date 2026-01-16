'use client';

import { useState } from 'react';
import apiClient from '@/lib/api';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onTaskUpdate?: (updatedTask: Task) => void;
  onTaskDelete?: (taskId: number) => void;
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
      if (response.success && response.data) {
        onTaskUpdate?.(response.data);
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
    <div className={`relative overflow-hidden rounded-3xl shadow-2xl transform transition-all duration-700 hover:scale-105 hover:shadow-3xl ${
      task.completed
        ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 border-2 border-green-300/50'
        : 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 border-2 border-purple-300/50'
    }`}>
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-0 left-0 w-48 h-48 bg-gradient-to-r ${
          task.completed ? 'from-green-300/40 via-emerald-400/40 to-teal-300/40' : 'from-blue-300/40 via-purple-400/40 to-pink-300/40'
        } rounded-full blur-3xl animate-bounce`} style={{animationDuration: '4s'}}></div>
        <div className={`absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-r ${
          task.completed ? 'from-emerald-400/50 via-teal-400/50 to-green-400/50' : 'from-purple-400/50 via-pink-400/50 to-red-400/50'
        } rounded-full blur-3xl animate-ping`} style={{animationDuration: '3s', animationDelay: '1.5s'}}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r ${
          task.completed ? 'from-teal-300/20 to-emerald-300/20' : 'from-indigo-300/20 to-purple-300/20'
        } rounded-full blur-3xl animate-pulse`} style={{animationDuration: '5s'}}></div>
      </div>

      <div className="relative z-10 p-8 backdrop-blur-sm">
        {error && (
          <div className="mb-4 p-4 bg-red-500/30 text-red-100 rounded-2xl text-base font-bold border-2 border-red-400/50 backdrop-blur-sm animate-pulse shadow-lg">
            ⚠️ {error}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-6 animate-fadeIn">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-6 py-4 bg-white/90 backdrop-blur-md border-3 border-blue-400/60 rounded-2xl focus:ring-4 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-500 focus:shadow-xl focus:outline-none font-bold text-gray-800 placeholder-gray-600 shadow-lg"
              placeholder="Enter task title..."
              autoFocus
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-6 py-4 bg-white/90 backdrop-blur-md border-3 border-blue-400/60 rounded-2xl focus:ring-4 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-500 focus:shadow-xl focus:outline-none min-h-[120px] font-normal text-gray-700 placeholder-gray-600 resize-none shadow-lg"
              placeholder="Add description..."
              rows={3}
            />
            <div className="flex gap-4 pt-2">
              <button
                onClick={handleEdit}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-70 transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:scale-110 disabled:transform-none font-bold text-lg flex items-center gap-3"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-6 h-6 border-3 border-white/50 border-t-white rounded-full animate-spin mr-3"></div>
                    Processing...
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-8 py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-2xl hover:from-gray-500 hover:to-gray-600 transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:scale-110 font-bold text-lg backdrop-blur-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-4">
              <div className="flex items-center pt-1">
                <button
                  onClick={handleToggleCompletion}
                  disabled={loading}
                  className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 transform hover:scale-110 ${
                    task.completed
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-300 shadow-lg animate-pulse'
                      : 'border-2 border-blue-400/80 hover:border-purple-500 bg-white/90 backdrop-blur-md shadow-md'
                  }`}
                >
                  {task.completed && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className={`text-lg font-black mb-2 transition-all duration-700 ${
                    task.completed
                      ? 'line-through text-white/90 drop-shadow-lg'
                      : 'text-white font-black drop-shadow-lg'
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className={`text-white/90 mb-4 text-sm leading-relaxed transition-all duration-700 ${
                    task.completed ? 'line-through opacity-80' : 'opacity-95'
                  }`}>
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-white/20 text-white rounded-full backdrop-blur-md border border-white/30 font-bold shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {formatDate(task.created_at)}
                    </span>
                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/30 font-bold shadow-md ${
                      task.completed
                        ? 'bg-green-500/30 text-white'
                        : 'bg-yellow-500/30 text-white'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        {task.completed ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        )}
                      </svg>
                      <span className="font-black text-xs">{task.completed ? '✓ COMPLETED' : '⚡ PENDING'}</span>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-white hover:text-blue-300 bg-white/20 hover:bg-blue-500/30 rounded-xl transition-all duration-500 transform hover:scale-110 hover:rotate-[-5deg] backdrop-blur-md shadow-md hover:shadow-lg border border-white/30"
                      title="Edit task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="p-2 text-white hover:text-red-300 bg-white/20 hover:bg-red-500/30 rounded-xl transition-all duration-500 transform hover:scale-110 hover:rotate-[5deg] backdrop-blur-md shadow-md hover:shadow-lg border border-white/30 disabled:opacity-60 disabled:cursor-not-allowed"
                      title="Delete task"
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
    </div>
  );
};

export default TaskCard;