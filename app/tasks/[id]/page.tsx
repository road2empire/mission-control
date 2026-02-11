'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assignee: string | null;
  priority: string;
  createdAt: string;
  updatedAt: string;
  comments: Array<{
    author: string;
    timestamp: string;
    text: string;
  }>;
  tags: string[];
}

interface Agent {
  id: string;
  name: string;
  role: string;
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [instructionText, setInstructionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('mission-control-auth');
    if (auth !== 'true') {
      router.push('/login');
      return;
    }
    fetchData();
  }, [taskId]);

  async function fetchData() {
    try {
      const tasksData = await api.get('/tasks');
      const agentsData = await api.get('/agents');
      
      const foundTask = tasksData.find((t: Task) => t.id === taskId);
      if (!foundTask) {
        alert('Task not found');
        router.push('/');
        return;
      }
      
      setTask(foundTask);
      setAgents(agentsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      alert('Failed to load task');
      router.push('/');
    }
  }

  async function handleAddInstruction() {
    if (!instructionText.trim()) return;
    
    setSubmitting(true);
    try {
      await api.post('/tasks/comment', {
        taskId,
        author: 'khayal',
        text: instructionText
      });
      
      setInstructionText('');
      await fetchData(); // Refresh
      alert('Instruction added!');
    } catch (error) {
      console.error('Failed to add instruction:', error);
      alert('Failed to add instruction');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStopAgent() {
    if (!confirm('Stop the agent and unassign this task?')) return;
    
    try {
      await api.post('/tasks/update', {
        taskId,
        updates: {
          assignee: null,
          status: 'inbox'
        }
      });
      
      await fetchData();
      alert('Agent stopped and task unassigned');
    } catch (error) {
      console.error('Failed to stop agent:', error);
      alert('Failed to stop agent');
    }
  }

  async function handleDeleteTask() {
    if (!confirm('Are you sure you want to delete this task? This cannot be undone.')) return;
    
    try {
      await api.post('/tasks/delete', { taskId });
      alert('Task deleted');
      router.push('/');
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  }

  if (loading || !task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading task...</div>
      </div>
    );
  }

  const assignedAgent = task.assignee ? agents.find(a => a.id === task.assignee) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Dashboard
            </Link>
            <div className="flex gap-2">
              <Link href="/agents" className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">
                Agents
              </Link>
              <Link href="/tasks" className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">
                Tasks
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Task Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {task.priority.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
              <p className="text-gray-600">{task.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div>📋 ID: {task.id}</div>
            <div>📅 Created: {new Date(task.createdAt).toLocaleString()}</div>
            {task.assignee && assignedAgent && (
              <div>👤 Assigned to: <span className="font-medium">{assignedAgent.name}</span></div>
            )}
          </div>

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {task.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {task.assignee && (
              <button
                onClick={handleStopAgent}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
              >
                ⏸️ Stop Agent
              </button>
            )}
            <button
              onClick={handleDeleteTask}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              🗑️ Delete Task
              </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">💬 Comments & Instructions</h2>
          
          {task.comments.length === 0 ? (
            <div className="text-gray-500 text-sm mb-4 text-center py-8">
              No comments yet. Add instructions for the agent below.
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {task.comments.map((comment, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {comment.author === 'khayal' ? '👤 Khayal' : `🤖 ${comment.author}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Instruction Form */}
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ✍️ Add Instruction for Agent
            </label>
            <textarea
              value={instructionText}
              onChange={(e) => setInstructionText(e.target.value)}
              placeholder="Type your instructions here... (e.g., 'Focus on pricing info' or 'Check compliance requirements')"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleAddInstruction}
                disabled={submitting || !instructionText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Adding...' : '📤 Send Instruction'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
