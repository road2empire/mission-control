'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'active' | 'blocked';
  currentTaskId: string | null;
  sessionKey: string;
  heartbeatMinute: number;
}

export default function AgentsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('mission-control-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAgents();
      const interval = setInterval(fetchAgents, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  async function fetchAgents() {
    try {
      const data = await api.get('/agents');
      setAgents(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('mission-control-auth');
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-500';
      case 'active': return 'bg-green-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading agents...</div>
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
              <Link href="/" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Dashboard
              </Link>
              <Link href="/agents" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Agents
              </Link>
              <Link href="/tasks" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Tasks
              </Link>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Agents</h2>
          <p className="text-gray-600">Manage your squad of 10 specialized AI agents</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{agent.role}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-700">
                  <span className="font-medium w-24">Session:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{agent.sessionKey}</code>
                </div>

                <div className="flex items-center text-sm text-gray-700">
                  <span className="font-medium w-24">Heartbeat:</span>
                  <span>Every 15min at :{agent.heartbeatMinute.toString().padStart(2, '0')}</span>
                </div>

                {agent.currentTaskId && (
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium w-24">Working on:</span>
                    <Link href={`/tasks/${agent.currentTaskId}`} className="text-blue-600 hover:underline">
                      {agent.currentTaskId}
                    </Link>
                  </div>
                )}

                {!agent.currentTaskId && (
                  <div className="text-sm text-gray-500 italic">
                    No active task
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
