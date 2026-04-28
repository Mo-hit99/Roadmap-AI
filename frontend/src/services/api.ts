const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  id: number;
  email: string;
}

export interface RoadmapRequest {
  goal: string;
  skills: string[];
  hours: number;
  deadline: string;
}

export interface RoadmapResponse {
  success: number;
  roadmap: string;
}

export interface SkillSuggestionResponse {
  skills: string[];
}

export interface HistoryItem {
  id: number;
  goal: string;
  skills: string;
  hours: number;
  deadline: string;
  success: number;
  roadmap: string;
  created_at: string;
}

const defaultOptions = {
  credentials: 'include' as const,
};

export const authService = {
  signup: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      ...defaultOptions,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Signup failed');
    return response.json();
  },
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      ...defaultOptions,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Login failed');
    return response.json();
  },
  logout: async () => {
    await fetch(`${API_BASE_URL}/auth/logout`, { ...defaultOptions, method: 'POST' });
  },
  me: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, { ...defaultOptions });
    if (!response.ok) throw new Error('Unauthorized');
    return response.json();
  },
};

export const roadmapService = {
  suggestSkills: async (goal: string): Promise<SkillSuggestionResponse> => {
    const response = await fetch(`${API_BASE_URL}/roadmap/suggest-skills`, {
      ...defaultOptions,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Failed to generate skills');
    return payload;
  },
  generate: async (data: RoadmapRequest): Promise<RoadmapResponse> => {
    const response = await fetch(`${API_BASE_URL}/roadmap/generate`, {
      ...defaultOptions,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to generate roadmap');
    return response.json();
  },
  getHistory: async (): Promise<HistoryItem[]> => {
    const response = await fetch(`${API_BASE_URL}/roadmap/history`, { ...defaultOptions });
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },
};
