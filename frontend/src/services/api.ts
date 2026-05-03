const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:5000/api';

export interface User {
  id: number;
  email: string;
}

export interface RoadmapRequest {
  goal: string;
  skills: string[];
  hours: number;
  deadline: string;
  progress?: string;
}

export interface SuccessDetails {
  reasoning: string;
  risk_factors: string[];
  improvements: string[];
}

export interface RoadmapResponse {
  success: number;
  success_details?: SuccessDetails;
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
  progress: string;
  created_at: string;
}

// ─── Mentor Types ────────────────────────────────────────

export interface MentorChatRequest {
  goal: string;
  skills: string[];
  hours: number;
  deadline: string;
  progress: string;
  message: string;
}

export interface MentorChatResponse {
  reply: string;
}

export interface JobRole {
  title: string;
  readiness: number;
  missing_skills: string[];
  suggestions: string[];
}

export interface JobMatchResponse {
  roles: JobRole[];
  error?: string;
}

export interface ResumeRequest {
  goal: string;
  skills: string[];
  projects: string;
}

export interface ResumeResponse {
  resume: string;
  history_id: number | null;
}

export interface ResumeUpdateRequest {
  resume: string;
  goal: string;
  skills: string[];
  projects: string;
}

export interface DailyPlanDay {
  day: number;
  label: string;
  learning: string;
  practice: string;
  outcome: string;
}

export interface DailyPlanResponse {
  days: DailyPlanDay[];
  error?: string;
}

export interface SkillGapItem {
  skill: string;
  reason: string;
}

export interface SkillGapResponse {
  critical: SkillGapItem[];
  optional: SkillGapItem[];
  priority_order: string[];
  summary: string;
}

export interface CareerToolHistoryItem {
  id: number;
  tool_type: 'mentor_chat' | 'daily_plan' | 'job_match' | 'resume' | 'skill_gap';
  title: string;
  content: any;
  created_at: string;
}

// ─── Fetch helpers ────────────────────────────────────────

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

export const mentorService = {
  chat: async (data: MentorChatRequest): Promise<MentorChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/mentor/chat`, {
      ...defaultOptions,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Chat failed');
    return response.json();
  },
  matchJobs: async (goal: string, skills: string[]): Promise<JobMatchResponse> => {
    const response = await fetch(`${API_BASE_URL}/mentor/job-match`, {
      ...defaultOptions,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, skills }),
    });
    if (!response.ok) throw new Error('Failed to match jobs');
    return response.json();
  },
  generateResume: async (data: ResumeRequest): Promise<ResumeResponse> => {
    const response = await fetch(`${API_BASE_URL}/mentor/resume`, {
      ...defaultOptions,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to generate resume');
    return response.json();
  },
  updateResume: async (historyId: number, data: ResumeUpdateRequest): Promise<ResumeResponse> => {
    const response = await fetch(`${API_BASE_URL}/mentor/resume/${historyId}`, {
      ...defaultOptions,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save resume');
    return response.json();
  },
  generateDailyPlan: async (goal: string, skills: string[], hours: number): Promise<DailyPlanResponse> => {
    const response = await fetch(`${API_BASE_URL}/mentor/daily-plan`, {
      ...defaultOptions,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, skills, hours }),
    });
    if (!response.ok) throw new Error('Failed to generate daily plan');
    return response.json();
  },
  analyzeSkillGaps: async (goal: string, skills: string[]): Promise<SkillGapResponse> => {
    const response = await fetch(`${API_BASE_URL}/mentor/skill-gap`, {
      ...defaultOptions,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, skills }),
    });
    if (!response.ok) throw new Error('Failed to analyze skill gaps');
    return response.json();
  },
  getHistory: async (): Promise<CareerToolHistoryItem[]> => {
    const response = await fetch(`${API_BASE_URL}/mentor/history`, { ...defaultOptions });
    if (!response.ok) throw new Error('Failed to fetch tool history');
    const payload = await response.json();
    return Array.isArray(payload) ? payload : (payload.history ?? []);
  },
};
