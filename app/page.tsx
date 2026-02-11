'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'active' | 'blocked';
  currentTaskId: string | null;
  sessionKey: string;
  heartbeatMinute: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assignee: string | null;
  priority: string;
  createdAt: string;
  updatedAt: string;
  comments: any[];
  tags: string[];
}

interface Activity {
  id: string;
  type: string;
  agentId: string;
  message: string;
  taskId: string | null;
  timestamp: string;
}

import { api } from '@/lib/api';

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [agentsData, tasksData, activitiesData] = await Promise.all([
        api.get('/agents'),
        api.get('/tasks'),
        api.get('/activities', { limit: '20' })
      ]);
      
      setAgents(agentsData);
      setTasks(tasksData);
      setActivities(activitiesData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }

  const tasksByStatus = {
    inbox: tasks.filter(t => t.status === 'inbox'),
    assigned: tasks.filter(t => t.status === 'assigned'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    done: tasks.filter(t => t.status === 'done')
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-500';
      case 'active': return 'bg-green-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading Mission Control...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">🎯 Mission Control</h1>
            <div className="flex gap-4">
              <Link href="/agents" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Agents
              </Link>
              <Link href="/tasks" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Tasks
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Agent Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🤖 Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map(agent => (
                <div key={agent.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-600">{agent.role}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    <div>⏰ Heartbeat: Every 15min at :{agent.heartbeatMinute.toString().padStart(2, '0')}</div>
                    {agent.currentTaskId && (
                      <div className="mt-1">📋 Working on: {agent.currentTaskId}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Activity Feed</h2>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {activities.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm text-center">No activity yet</div>
              ) : (
                activities.map(activity => (
                  <div key={activity.id} className="p-3 hover:bg-gray-50">
                    <div className="text-sm text-gray-900">{activity.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()} · {activity.agentId}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Task Board */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Task Board</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status} className="bg-gray-100 rounded-lg p-3">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase">
                  {status.replace('_', ' ')} ({statusTasks.length})
                </h3>
                <div className="space-y-2">
                  {statusTasks.map(task => (
                    <Link key={task.id} href={`/tasks/${task.id}`}>
                      <div className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                        <div className={`text-xs font-medium px-2 py-1 rounded border inline-block mb-2 ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{task.title}</h4>
                        {task.assignee && (
                          <div className="text-xs text-gray-600 mt-2">
                            👤 {agents.find(a => a.id === task.assignee)?.name || task.assignee}
                          </div>
                        )}
                        {task.comments.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            💬 {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
