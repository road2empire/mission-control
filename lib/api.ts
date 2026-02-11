// API client with authentication

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiClient(endpoint: string, options: FetchOptions = {}) {
  const { params, ...fetchOptions } = options;
  
  // Build URL with query params
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  // Add API key to headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    ...fetchOptions.headers,
  };
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Convenience methods
export const api = {
  get: (endpoint: string, params?: Record<string, string>) => 
    apiClient(endpoint, { method: 'GET', params }),
  
  post: (endpoint: string, data?: any) => 
    apiClient(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  
  patch: (endpoint: string, data?: any) => 
    apiClient(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  
  delete: (endpoint: string) => 
    apiClient(endpoint, { method: 'DELETE' }),
};
